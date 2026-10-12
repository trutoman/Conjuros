import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { buildSslOptions } from './src/api/db/ssl';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/api/db/schema.ts',
  out: './drizzle',
  casing: 'snake_case',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
    ssl: buildSslOptions({
      mode: process.env.DATABASE_SSL === 'require' ? 'require' : 'disable',
      caPath: process.env.DATABASE_SSL_CA || null,
    }),
  },
});
