import { z } from 'zod';
import { emailSchema } from '@conjuros/contracts';

const nonBlankString = z.string().trim().min(1);

const mongoUriSchema = nonBlankString.refine(
  (value) => {
    try {
      const uri = new URL(value);
      return uri.protocol === 'mongodb:' || uri.protocol === 'mongodb+srv:';
    } catch {
      return false;
    }
  },
  { message: 'Must use the mongodb: or mongodb+srv: protocol' },
);

const apiEnvironmentSchema = z.object({
  MONGODB_URI: mongoUriSchema,
  MONGODB_DATABASE: nonBlankString,
  SESSION_SECRET: nonBlankString.min(32),
  ADMIN_EMAIL: emailSchema.optional(),
  PORT: z.preprocess(
    (value) => (value === undefined || value === '' ? undefined : value),
    z.coerce.number().int().min(1).max(65_535).optional(),
  ),
});

export interface ApiEnvironment {
  mongoUri: string;
  databaseName: string;
  sessionSecret: string;
  adminEmail: string | null;
  port: number;
}

export function parseApiEnvironment(environment: Record<string, string | undefined>): ApiEnvironment {
  const parsed = apiEnvironmentSchema.safeParse(environment);
  if (!parsed.success) {
    const invalidVariables = [...new Set(parsed.error.issues.map((issue) => String(issue.path[0])))];
    throw new Error(`Invalid environment configuration: ${invalidVariables.join(', ')}`);
  }

  return {
    mongoUri: parsed.data.MONGODB_URI,
    databaseName: parsed.data.MONGODB_DATABASE,
    sessionSecret: parsed.data.SESSION_SECRET,
    adminEmail: parsed.data.ADMIN_EMAIL ?? null,
    port: parsed.data.PORT ?? 3000,
  };
}