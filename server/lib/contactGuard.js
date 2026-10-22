import crypto from 'crypto';
import axios from 'axios';
import { z } from 'zod';
import { prisma } from './prisma.js';

/*
  Layered spam protection for the contact form, cheapest checks first:
    1. Shape and length validation
    2. Honeypot field and a minimum time-to-submit (silently "accepted" so bots learn nothing)
    3. Content heuristics (links in the name, too many links in the message)
    4. Rate limits per IP, per sender address and site-wide, counted in the database so
       they hold across serverless instances
    5. reCAPTCHA v3, when SITE_SECRET_KEY is configured
*/

const MIN_FILL_MS = 3000;
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const RETENTION = 90 * DAY;

const LIMITS = [
  { key: 'ipHash', window: 10 * MINUTE, max: 3 },
  { key: 'ipHash', window: DAY, max: 10 },
  { key: 'email', window: DAY, max: 3 },
  { key: null, window: HOUR, max: 30 }, // site-wide ceiling against distributed floods
];

const URL_PATTERN = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|ru|cn|xyz|top|info|io|biz)\b)/gi;

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(255),
  message: z.string().trim().min(10).max(2000),
  website: z.string().optional(), // honeypot: real visitors never see this field
  elapsedMs: z.coerce.number().optional(),
  recaptchaToken: z.string().optional(),
});

export class ContactRejected extends Error {
  constructor(status, message, { silent = false } = {}) {
    super(message);
    this.status = status;
    this.silent = silent;
  }
}

// Salted so the stored value can't be reversed into an IP address.
const hashIp = (ip) =>
  crypto
    .createHash('sha256')
    .update(`${process.env.JWT_SECRET || 'contact'}:${ip || 'unknown'}`)
    .digest('hex');

// Vercel sets x-real-ip to the visitor's address and overwrites anything the client sent.
export const clientIp = (req) => String(req.headers['x-real-ip'] || req.ip || '').trim();

async function verifyRecaptcha(token) {
  const secret = process.env.SITE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const { data } = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: { secret, response: token },
      timeout: 5000,
    });
    // 'submit' is the action name older builds of the frontend used.
    return data.success === true && data.score >= 0.5 && (!data.action || ['contact', 'submit'].includes(data.action));
  } catch (error) {
    console.error('reCAPTCHA verification error:', error.message);
    return false;
  }
}

/**
 * Runs every check and returns the cleaned submission plus its IP hash.
 * Throws ContactRejected; `silent` rejections should still look like success to the client.
 */
export async function screenContact(body, ip) {
  const parsed = schema.safeParse(body ?? {});
  if (!parsed.success) {
    throw new ContactRejected(400, 'Please check your name, email and message and try again.');
  }
  const { name, email, message, website, elapsedMs, recaptchaToken } = parsed.data;

  if (website) throw new ContactRejected(200, 'honeypot', { silent: true });
  if (elapsedMs === undefined || elapsedMs < MIN_FILL_MS) throw new ContactRejected(200, 'too fast', { silent: true });

  if ((name.match(URL_PATTERN) ?? []).length > 0 || (message.match(URL_PATTERN) ?? []).length > 3) {
    throw new ContactRejected(400, 'Your message looks like spam. Please remove links and try again, or email me directly.');
  }

  const ipHash = hashIp(ip);
  const now = Date.now();
  for (const { key, window, max } of LIMITS) {
    const where = { createdAt: { gte: new Date(now - window) } };
    if (key === 'ipHash') where.ipHash = ipHash;
    if (key === 'email') where.email = email;
    if ((await prisma.contactSubmission.count({ where })) >= max) {
      throw new ContactRejected(429, "You've sent a few messages already. Please try again later, or email me directly.");
    }
  }

  if (!(await verifyRecaptcha(recaptchaToken))) {
    throw new ContactRejected(400, 'Spam check failed. Please refresh the page and try again.');
  }

  // A sender gets at most one confirmation email a day, so the form can't be used to mail-bomb someone.
  const recentConfirmation = await prisma.contactSubmission.count({
    where: { email, confirmationSent: true, createdAt: { gte: new Date(now - DAY) } },
  });

  return { name, email, message, ipHash, sendConfirmation: recentConfirmation === 0 };
}

export const recordSubmission = (data) => prisma.contactSubmission.create({ data });

export const markSubmission = (id, data) => prisma.contactSubmission.update({ where: { id }, data });

// Old submissions aren't needed for rate limiting; keep the table small.
export const pruneSubmissions = () =>
  prisma.contactSubmission.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - RETENTION) } } });
