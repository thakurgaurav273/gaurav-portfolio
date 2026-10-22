import crypto from 'crypto';

// Vercel sets x-real-ip to the visitor's address and overwrites anything the client sent.
export const clientIp = (req) => String(req.headers['x-real-ip'] || req.ip || '').trim();

// Salted so the stored value can't be reversed into an IP address.
export const hashIp = (ip) =>
  crypto
    .createHash('sha256')
    .update(`${process.env.JWT_SECRET || 'contact'}:${ip || 'unknown'}`)
    .digest('hex');
