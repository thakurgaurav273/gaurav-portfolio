// Creates an admin login, or resets the password of an existing one.
//
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='…' npm run admin:create
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';

const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD.');
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 12) {
  console.error('Use a password of at least 12 characters.');
  process.exit(1);
}

const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
await prisma.admin.upsert({ where: { email: ADMIN_EMAIL }, update: { password }, create: { email: ADMIN_EMAIL, password } });
console.log(`Admin ready: ${ADMIN_EMAIL}`);
await prisma.$disconnect();
