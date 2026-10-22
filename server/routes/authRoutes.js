import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { sendLoginCodeEmail, sendPasswordResetEmail } from '../emailService.js';
import { clientIp, hashIp } from '../lib/request.js';
import {
  LIMITS,
  OTP,
  SessionError,
  countAttempts,
  createSession,
  hashCode,
  maskEmail,
  newCode,
  pruneAuthData,
  recordAttempt,
  revokeAllSessions,
  revokeSession,
  rotateSession,
  sameHash,
} from '../lib/auth.js';

const router = express.Router();


// A real bcrypt hash of a random string, compared when the email is unknown so a
// wrong email takes as long as a wrong password and the response can't reveal which.
const DUMMY_HASH = bcrypt.hashSync(crypto.randomBytes(16).toString('hex'), 10);

const tooMany = (res, minutes) =>
  res.status(429).json({ error: `Too many attempts. Try again in ${minutes} minutes.` });

// Step 1: check the password, then email a one-time code.
router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email ?? '').trim().toLowerCase();
    const password = String(req.body.password ?? '');
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const ipHash = hashIp(clientIp(req));
    if ((await countAttempts('password_fail', { email }, LIMITS.passwordPerEmail.window)) >= LIMITS.passwordPerEmail.max) return tooMany(res, 15);
    if ((await countAttempts('password_fail', { ipHash }, LIMITS.passwordPerIp.window)) >= LIMITS.passwordPerIp.max) return tooMany(res, 60);

    const admin = await prisma.admin.findUnique({ where: { email } });
    const isMatch = await bcrypt.compare(password, admin?.password ?? DUMMY_HASH);
    if (!admin || !isMatch) {
      await recordAttempt('password_fail', email, ipHash);
      return res.status(401).json({ error: 'Incorrect email or password' });
    }

    if ((await countAttempts('otp_sent', { email }, LIMITS.otpSentPerEmail.window)) >= LIMITS.otpSentPerEmail.max) return tooMany(res, 60);

    const code = newCode();
    const challenge = await prisma.loginChallenge.create({
      data: { adminId: admin.id, codeHash: 'pending', expiresAt: new Date(Date.now() + OTP.ttl) },
    });
    await prisma.loginChallenge.update({ where: { id: challenge.id }, data: { codeHash: hashCode(challenge.id, code) } });
    await sendLoginCodeEmail(admin.email, code);
    await recordAttempt('otp_sent', email, ipHash);
    pruneAuthData().catch(() => {});

    res.json({ challengeId: challenge.id, email: maskEmail(admin.email), expiresAt: challenge.expiresAt, resendAfter: OTP.resendAfter });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const openChallenge = (id) =>
  typeof id === 'string'
    ? prisma.loginChallenge.findFirst({ where: { id, consumedAt: null, expiresAt: { gt: new Date() } }, include: { admin: true } })
    : null;

// Step 2: check the emailed code and start a session.
router.post('/verify-otp', async (req, res) => {
  try {
    const { challengeId, remember } = req.body;
    const code = String(req.body.code ?? '').replace(/\D/g, '');
    const challenge = await openChallenge(challengeId);
    if (!challenge) return res.status(400).json({ error: 'This code has expired. Sign in again.', expired: true });

    if (code.length !== 6 || !sameHash(hashCode(challenge.id, code), challenge.codeHash)) {
      const attempts = challenge.attempts + 1;
      await prisma.loginChallenge.update({
        where: { id: challenge.id },
        data: { attempts, ...(attempts >= OTP.maxAttempts && { consumedAt: new Date() }) },
      });
      await recordAttempt('otp_fail', challenge.admin.email, hashIp(clientIp(req)));
      const left = OTP.maxAttempts - attempts;
      return left > 0
        ? res.status(400).json({ error: `That code isn't right. ${left} ${left === 1 ? 'try' : 'tries'} left.`, attemptsLeft: left })
        : res.status(400).json({ error: 'Too many wrong codes. Sign in again.', expired: true });
    }

    await prisma.loginChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } });
    const session = await createSession(challenge.admin, { remember: remember === true, userAgent: req.headers['user-agent'] });
    res.json({ ...session, admin: { email: challenge.admin.email } });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/resend-otp', async (req, res) => {
  try {
    const challenge = await openChallenge(req.body.challengeId);
    if (!challenge) return res.status(400).json({ error: 'This sign-in has expired. Start again.', expired: true });

    const wait = OTP.resendAfter - (Date.now() - challenge.lastSentAt.getTime());
    if (wait > 0) return res.status(429).json({ error: `Wait ${Math.ceil(wait / 1000)} seconds before asking for another code.` });
    if (challenge.sendCount >= OTP.maxSends) return res.status(429).json({ error: 'Too many codes sent. Sign in again later.' });

    const code = newCode();
    await prisma.loginChallenge.update({
      where: { id: challenge.id },
      data: {
        codeHash: hashCode(challenge.id, code),
        sendCount: challenge.sendCount + 1,
        lastSentAt: new Date(),
        expiresAt: new Date(Date.now() + OTP.ttl),
      },
    });
    await sendLoginCodeEmail(challenge.admin.email, code);
    await recordAttempt('otp_sent', challenge.admin.email, hashIp(clientIp(req)));
    res.json({ resendAfter: OTP.resendAfter });
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    res.json(await rotateSession(req.body.refreshToken));
  } catch (error) {
    if (error instanceof SessionError) return res.status(401).json({ error: 'Session ended. Sign in again.' });
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    await revokeSession(req.body.refreshToken);
  } catch (error) {
    console.error('Logout error:', error);
  }
  res.json({ success: true });
});


router.get('/me', requireAuth, async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.adminId },
      select: { email: true },
    });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.json({ admin: { email: admin.email } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/forgot-password', async (req, res) => {
  try {
    const email = String(req.body.email ?? '').trim().toLowerCase();
    const ipHash = hashIp(clientIp(req));
    if ((await countAttempts('reset_request', { ipHash }, 60 * 60 * 1000)) >= 5) return tooMany(res, 60);
    await recordAttempt('reset_request', email || null, ipHash);

    const admin = email ? await prisma.admin.findUnique({ where: { email } }) : null;
    if (!admin) {
      return res.json({ message: 'If that email is in our database, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour
      },
    });

    const siteUrl = process.env.SITE_URL || 'http://localhost:8080';
    const resetLink = `${siteUrl}/admin/reset-password/${resetToken}?email=${encodeURIComponent(email)}`;
    await sendPasswordResetEmail(email, resetLink);

    res.json({ message: 'If that email is in our database, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/reset-password', async (req, res) => {
  try {
    const { token, email, password } = req.body;

    if (!token || !email || !password) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const admin = await prisma.admin.findFirst({
      where: { email, resetPasswordExpires: { gt: new Date() } },
    });

    if (!admin || !admin.resetPasswordToken) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const isValidToken = await bcrypt.compare(token, admin.resetPasswordToken);
    if (!isValidToken) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null },
    });
    // A new password signs out every device.
    await revokeAllSessions(admin.id);

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
