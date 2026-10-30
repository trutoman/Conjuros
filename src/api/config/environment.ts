import { z } from 'zod';
import { attachmentMaxBytes, emailSchema } from '@conjuros/contracts';

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

const httpUrlSchema = nonBlankString.refine(
  (value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  },
  { message: 'Must be an absolute http: or https: URL' },
);

const supabaseProjectRefPattern = /^([a-z0-9]+)\.(?:supabase\.co|pooler\.supabase\.com)$/i;

// Resolves the Supabase project a connection string or project URL belongs to, or null when
// the value does not describe a Supabase project (local PostgreSQL, custom domain, self-hosted).
export function supabaseProjectRef(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol === 'postgres:' || url.protocol === 'postgresql:') {
    const poolerUser = /^postgres\.([a-z0-9]+)$/i.exec(url.username);
    if (poolerUser) return poolerUser[1].toLowerCase();
    const host = supabaseProjectRefPattern.exec(url.hostname);
    return host ? host[1].toLowerCase() : null;
  }

  if (url.protocol === 'https:' || url.protocol === 'http:') {
    const host = supabaseProjectRefPattern.exec(url.hostname);
    return host ? host[1].toLowerCase() : null;
  }

  return null;
}

const apiEnvironmentSchema = z
  .object({
    DATABASE_URL: databaseUrlSchema,
    SESSION_SECRET: nonBlankString.min(32),
    ADMIN_EMAIL: z.preprocess(blankToUndefined, emailSchema.optional()),
    CORS_ORIGIN: z.preprocess(blankToUndefined, httpUrlSchema.optional()),
    PORT: z.preprocess(
      blankToUndefined,
      z.coerce.number().int().min(1).max(65_535).optional(),
    ),
    DATABASE_SSL: z.preprocess(blankToUndefined, z.enum(['disable', 'require']).optional()),
    DATABASE_SSL_CA: z.preprocess(blankToUndefined, nonBlankString.optional()),
    SMTP_URL: z.preprocess(blankToUndefined, smtpUrlSchema.optional()),
    MAIL_FROM: z.preprocess(blankToUndefined, emailSchema.optional()),
    APP_BASE_URL: z.preprocess(blankToUndefined, httpUrlSchema.optional()),
    PASSWORD_RESET_TTL_MINUTES: z.preprocess(
      blankToUndefined,
      z.coerce.number().int().positive().optional(),
    ),
    SUPABASE_URL: z.preprocess(blankToUndefined, httpUrlSchema.optional()),
    SUPABASE_SERVICE_ROLE_KEY: z.preprocess(blankToUndefined, nonBlankString.optional()),
    ATTACHMENT_BUCKET: z.preprocess(blankToUndefined, nonBlankString.optional()),
    ATTACHMENT_MAX_BYTES: z.preprocess(
      blankToUndefined,
      z.coerce.number().int().positive().optional(),
    ),
  })
  .refine((data) => !(data.SMTP_URL && !data.MAIL_FROM), {
    message: 'MAIL_FROM is required when SMTP_URL is set',
    path: ['MAIL_FROM'],
  })
  .refine((data) => !data.SUPABASE_URL === !data.SUPABASE_SERVICE_ROLE_KEY, {
    message: 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set together',
    path: ['SUPABASE_SERVICE_ROLE_KEY'],
  })
  .refine(
    (data) => {
      // Storage must belong to the database's own project so one environment never writes
      // objects into another environment's bucket. Skipped when either side is not Supabase.
      const databaseRef = supabaseProjectRef(data.DATABASE_URL);
      const storageRef = data.SUPABASE_URL ? supabaseProjectRef(data.SUPABASE_URL) : null;
      return !databaseRef || !storageRef || databaseRef === storageRef;
    },
    {
      message: 'Must point at the same Supabase project as DATABASE_URL',
      path: ['SUPABASE_URL'],
    },
  );

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
  supabaseUrl: string | null;
  supabaseServiceRoleKey: string | null;
  attachmentBucket: string;
  attachmentMaxBytes: number;
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
    supabaseUrl: parsed.data.SUPABASE_URL ?? null,
    supabaseServiceRoleKey: parsed.data.SUPABASE_SERVICE_ROLE_KEY ?? null,
    attachmentBucket: parsed.data.ATTACHMENT_BUCKET ?? 'attachments',
    attachmentMaxBytes: parsed.data.ATTACHMENT_MAX_BYTES ?? attachmentMaxBytes,
  };
}
