import { z } from 'zod';
import { emailSchema } from '@conjuros/contracts';

const nonBlankString = z.string().trim().min(1);

const blankToUndefined = (value: unknown) =>
  value === undefined || value === '' ? undefined : value;

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

const smtpUrlSchema = nonBlankString.refine(
  (value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'smtp:' || url.protocol === 'smtps:';
    } catch {
      return false;
    }
  },
  { message: 'Must use the smtp: or smtps: protocol' },
);

const apiEnvironmentSchema = z
  .object({
    DATABASE_URL: databaseUrlSchema,
    SESSION_SECRET: nonBlankString.min(32),
    ADMIN_EMAIL: z.preprocess(blankToUndefined, emailSchema.optional()),
    CORS_ORIGIN: z.preprocess(blankToUndefined, z.string().trim().url().optional()),
    PORT: z.preprocess(
      blankToUndefined,
      z.coerce.number().int().min(1).max(65_535).optional(),
    ),
    DATABASE_SSL: z.preprocess(blankToUndefined, z.enum(['disable', 'require']).optional()),
    DATABASE_SSL_CA: z.preprocess(blankToUndefined, nonBlankString.optional()),
    SMTP_URL: z.preprocess(blankToUndefined, smtpUrlSchema.optional()),
    MAIL_FROM: z.preprocess(blankToUndefined, emailSchema.optional()),
    APP_BASE_URL: z.preprocess(blankToUndefined, z.string().trim().url().optional()),
    PASSWORD_RESET_TTL_MINUTES: z.preprocess(
      blankToUndefined,
      z.coerce.number().int().positive().optional(),
    ),
  })
  .refine((data) => !(data.SMTP_URL && !data.MAIL_FROM), {
    message: 'MAIL_FROM is required when SMTP_URL is set',
    path: ['MAIL_FROM'],
  });

export interface ApiEnvironment {
  databaseUrl: string;
  databaseSsl: 'disable' | 'require';
  databaseSslCa: string | null;
  sessionSecret: string;
  adminEmail: string | null;
  corsOrigin: string;
  port: number;
  smtpUrl: string | null;
  mailFrom: string | null;
  appBaseUrl: string;
  passwordResetTtlMinutes: number;
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
    databaseSsl: parsed.data.DATABASE_SSL ?? 'disable',
    databaseSslCa: parsed.data.DATABASE_SSL_CA ?? null,
    sessionSecret: parsed.data.SESSION_SECRET,
    adminEmail: parsed.data.ADMIN_EMAIL ?? null,
    corsOrigin: parsed.data.CORS_ORIGIN ?? 'http://localhost:5173',
    port: parsed.data.PORT ?? 3000,
    smtpUrl: parsed.data.SMTP_URL ?? null,
    mailFrom: parsed.data.MAIL_FROM ?? null,
    appBaseUrl: parsed.data.APP_BASE_URL ?? parsed.data.CORS_ORIGIN ?? 'http://localhost:5173',
    passwordResetTtlMinutes: parsed.data.PASSWORD_RESET_TTL_MINUTES ?? 60,
  };
}
