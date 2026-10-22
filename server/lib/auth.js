import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma.js';

/*
  Admin sign-in:
    1. Email + password  → a LoginChallenge and a 6-digit code emailed to the admin
    2. Code              → an AdminSession: a 15-minute access token plus a refresh token
    3. Refresh token     → rotated on every use; the session ends after 12 hours,
                           or 30 days when "Remember me" was ticked
*/

export const ACCESS_TTL = '15m';
export const SESSION_TTL = { short: 12 * 60 * 60 * 1000, remember: 30 * 24 * 60 * 60 * 1000 };
export const OTP = { ttl: 10 * 60 * 1000, maxAttempts: 5, resendAfter: 30 * 1000, maxSends: 5 };

const MINUTE = 60 * 1000;
export const LIMITS = {
  passwordPerEmail: { window: 15 * MINUTE, max: 5 },
  passwordPerIp: { window: 60 * MINUTE, max: 20 },
  otpSentPerEmail: { window: 60 * MINUTE, max: 10 },
};

// Never sign tokens with a guessable default in production.
export const jwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET is not configured');
  return 'dev-only-secret';
};

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

export const hashCode = (challengeId, code) => sha256(`${jwtSecret()}:${challengeId}:${code}`);

export const sameHash = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

export const newCode = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');

export const maskEmail = (email) => {
  const [user, domain] = email.split('@');
  return `${user.slice(0, 2)}${'•'.repeat(Math.max(1, user.length - 2))}@${domain}`;
};

export const signAccessToken = (admin, sessionId) =>
  jwt.sign({ typ: 'access', adminId: admin.id, email: admin.email, sid: sessionId }, jwtSecret(), { expiresIn: ACCESS_TTL });

export const verifyAccessToken = (token) => {
  const payload = jwt.verify(token, jwtSecret());
  if (payload.typ !== 'access' || !payload.sid) throw new Error('Not an access token');
  return payload;
};

export async function countAttempts(kind, { email, ipHash }, window) {
  return prisma.authAttempt.count({
    where: { kind, ...(email ? { email } : { ipHash }), createdAt: { gte: new Date(Date.now() - window) } },
  });
}

export const recordAttempt = (kind, email, ipHash) => prisma.authAttempt.create({ data: { kind, email, ipHash } });

// Issues the token pair for a new session.
export async function createSession(admin, { remember, userAgent }) {
  const refreshToken = crypto.randomBytes(48).toString('base64url');
  const expiresAt = new Date(Date.now() + (remember ? SESSION_TTL.remember : SESSION_TTL.short));
  const session = await prisma.adminSession.create({
    data: { adminId: admin.id, tokenHash: sha256(refreshToken), remember, userAgent: userAgent?.slice(0, 300), expiresAt },
  });
  return { accessToken: signAccessToken(admin, session.id), refreshToken, expiresAt, remember };
}

export class SessionError extends Error {}

// Swaps a refresh token for a new pair. Reusing an already-rotated token revokes the session.
export async function rotateSession(refreshToken) {
  if (!refreshToken || typeof refreshToken !== 'string') throw new SessionError('Missing refresh token');
  const hash = sha256(refreshToken);
  const session = await prisma.adminSession.findUnique({ where: { tokenHash: hash }, include: { admin: true } });

  if (!session) {
    const reused = await prisma.adminSession.findUnique({ where: { previousHash: hash } });
    if (reused && !reused.revokedAt) {
      await prisma.adminSession.update({ where: { id: reused.id }, data: { revokedAt: new Date() } });
      console.warn(`Refresh token reuse detected; revoked session ${reused.id}`);
    }
    throw new SessionError('Invalid refresh token');
  }
  if (session.revokedAt || session.expiresAt < new Date()) throw new SessionError('Session ended');

  const next = crypto.randomBytes(48).toString('base64url');
  await prisma.adminSession.update({
    where: { id: session.id },
    data: { tokenHash: sha256(next), previousHash: hash, lastUsedAt: new Date() },
  });
  return {
    accessToken: signAccessToken(session.admin, session.id),
    refreshToken: next,
    expiresAt: session.expiresAt,
    remember: session.remember,
  };
}

export async function revokeSession(refreshToken) {
  if (!refreshToken || typeof refreshToken !== 'string') return;
  await prisma.adminSession.updateMany({ where: { tokenHash: sha256(refreshToken), revokedAt: null }, data: { revokedAt: new Date() } });
}

export const revokeAllSessions = (adminId) =>
  prisma.adminSession.updateMany({ where: { adminId, revokedAt: null }, data: { revokedAt: new Date() } });

export const isSessionActive = async (sessionId) => {
  const session = await prisma.adminSession.findUnique({ where: { id: sessionId }, select: { revokedAt: true, expiresAt: true } });
  return Boolean(session && !session.revokedAt && session.expiresAt > new Date());
};

// Housekeeping, run opportunistically on sign-in.
export const pruneAuthData = () =>
  Promise.all([
    prisma.authAttempt.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * MINUTE) } } }),
    prisma.loginChallenge.deleteMany({ where: { expiresAt: { lt: new Date(Date.now() - 60 * MINUTE) } } }),
    prisma.adminSession.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
  ]);
