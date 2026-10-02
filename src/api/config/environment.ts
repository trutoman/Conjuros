import { z } from 'zod';
import { emailSchema } from '@conjuros/contracts';

const nonBlankString = z.string().trim().min(1);

const databaseUrlSchema = nonBlankString.refine(
  (value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'postgres:' || url.protocol === 'postgresql:';
    } catch {
      return false;
    }
  },
  { message: 'Must use the postgres: or postgresql: protocol' },
);

const apiEnvironmentSchema = z.object({
  DATABASE_URL: databaseUrlSchema,
  SESSION_SECRET: nonBlankString.min(32),
  ADMIN_EMAIL: z.preprocess(
    (value) => (value === undefined || value === '' ? undefined : value),
    emailSchema.optional(),
  ),
  CORS_ORIGIN: z.preprocess(
    (value) => (value === undefined || value === '' ? undefined : value),
    z.string().trim().url().optional(),
  ),
  PORT: z.preprocess(
    (value) => (value === undefined || value === '' ? undefined : value),
    z.coerce.number().int().min(1).max(65_535).optional(),
  ),
});

export interface ApiEnvironment {
  databaseUrl: string;
  sessionSecret: string;
  adminEmail: string | null;
  corsOrigin: string;
  port: number;
}

export function parseApiEnvironment(
  environment: Record<string, string | undefined>,
): ApiEnvironment {
  const parsed = apiEnvironmentSchema.safeParse(environment);
  if (!parsed.success) {
    const invalidVariables = [
      ...new Set(parsed.error.issues.map((issue) => String(issue.path[0]))),
    ];
    throw new Error(`Invalid environment configuration: ${invalidVariables.join(', ')}`);
  }

  return {
    databaseUrl: parsed.data.DATABASE_URL,
    sessionSecret: parsed.data.SESSION_SECRET,
    adminEmail: parsed.data.ADMIN_EMAIL ?? null,
    corsOrigin: parsed.data.CORS_ORIGIN ?? 'http://localhost:5173',
    port: parsed.data.PORT ?? 3000,
  };
}
