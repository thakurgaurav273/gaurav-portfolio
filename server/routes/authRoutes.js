import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { sendPasswordResetEmail } from '../emailService.js';

const router = express.Router();


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({ token, admin: { email: admin.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
    const { email } = req.body;
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

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
