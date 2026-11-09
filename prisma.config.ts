import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'prisma/config';

// Prisma does not read .env.local on its own. Loading it the way Next.js does
// keeps one set of settings for both.
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // `prisma generate` runs on install, before any database settings exist.
    url: process.env.DATABASE_URL ?? '',
  },
});
