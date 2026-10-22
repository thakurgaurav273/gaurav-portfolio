import { isSessionActive, verifyAccessToken } from '../lib/auth.js';

// Accepts a short-lived access token whose session hasn't been signed out or revoked.
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  let payload;
  try {
    payload = verifyAccessToken(authHeader.split(' ')[1]);
  } catch {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  try {
    if (!(await isSessionActive(payload.sid))) {
      return res.status(401).json({ error: 'Unauthorized: Session ended' });
    }
  } catch (error) {
    console.error('Session check failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }

  req.admin = payload;
  next();
};
