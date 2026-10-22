import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Migrations need a direct (non-pooled) connection on Neon.
// The runtime client uses DATABASE_URL (pooled) via the pg adapter in lib/prisma.js.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.js',
  },
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
