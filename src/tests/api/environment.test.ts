import { describe, expect, it } from 'vitest';

import { parseApiEnvironment } from '../../api/config/environment';

const databaseUrl = 'postgres://conjuros:db-secret-value@localhost:5432/conjuros';

const validEnvironment: Record<string, string> = {
  DATABASE_URL: databaseUrl,
  SESSION_SECRET: 'a-32-character-session-secret-value',
};

const defaultConfiguration = {
  databaseUrl,
  databaseSsl: 'disable',
  databaseSslCa: null,
  sessionSecret: 'a-32-character-session-secret-value',
  adminEmail: null,
  corsOrigin: 'http://localhost:5173',
  port: 3000,
  smtpUrl: null,
  mailFrom: null,
  appBaseUrl: 'http://localhost:5173',
  passwordResetTtlMinutes: 60,
  supabaseUrl: null,
  supabaseServiceRoleKey: null,
  attachmentBucket: 'attachments',
  attachmentMaxBytes: 52_428_800,
};

function invalidEnvironmentMessage(environment: Record<string, string>) {
  try {
    parseApiEnvironment(environment);
  } catch (error) {
    return error instanceof Error ? error.message : '';
  }

  throw new Error('Expected environment validation to fail');
}

describe('parseApiEnvironment', () => {
  it('returns validated API startup configuration', () => {
    expect(parseApiEnvironment(validEnvironment)).toEqual(defaultConfiguration);
  });

  it.each(['postgres://user:pass@localhost:5432/conjuros', 'postgresql://user:pass@db:5432/conjuros'])(
    'accepts the PostgreSQL URL %s',
    (url) => {
      expect(parseApiEnvironment({ ...validEnvironment, DATABASE_URL: url }).databaseUrl).toBe(url);
    },
  );

  it('parses the database TLS settings', () => {
    expect(
      parseApiEnvironment({
        ...validEnvironment,
        DATABASE_SSL: 'require',
        DATABASE_SSL_CA: '/certs/ca.pem',
      }),
    ).toEqual({ ...defaultConfiguration, databaseSsl: 'require', databaseSslCa: '/certs/ca.pem' });
  });

  it('treats blank database TLS settings as defaults', () => {
    expect(
      parseApiEnvironment({ ...validEnvironment, DATABASE_SSL: '', DATABASE_SSL_CA: '' }),
    ).toEqual(defaultConfiguration);
  });

  it('rejects an unknown DATABASE_SSL mode', () => {
    expect(invalidEnvironmentMessage({ ...validEnvironment, DATABASE_SSL: 'verify' })).toContain(
      'DATABASE_SSL',
    );
  });

  it('parses an optional admin email', () => {
    expect(
      parseApiEnvironment({ ...validEnvironment, ADMIN_EMAIL: 'Admin@Example.com' }),
    ).toEqual({
      ...defaultConfiguration,
      adminEmail: 'admin@example.com',
    });
  });

  it('treats an empty admin email as absent', () => {
    expect(parseApiEnvironment({ ...validEnvironment, ADMIN_EMAIL: '' })).toEqual(
      defaultConfiguration,
    );
  });

  it('parses a configurable CORS origin and defaults the app base URL to it', () => {
    expect(
      parseApiEnvironment({ ...validEnvironment, CORS_ORIGIN: 'https://conjuros.example.com' }),
    ).toEqual({
      ...defaultConfiguration,
      corsOrigin: 'https://conjuros.example.com',
      appBaseUrl: 'https://conjuros.example.com',
    });
  });

  it('leaves email delivery disabled by default', () => {
    const environment = parseApiEnvironment(validEnvironment);

    expect(environment.smtpUrl).toBeNull();
    expect(environment.mailFrom).toBeNull();
    expect(environment.passwordResetTtlMinutes).toBe(60);
  });

  it('parses configured email settings', () => {
    expect(
      parseApiEnvironment({
        ...validEnvironment,
        SMTP_URL: 'smtps://user:pass@smtp.example.com:465',
        MAIL_FROM: 'No-Reply@Example.com',
        APP_BASE_URL: 'https://conjuros.example.com',
        PASSWORD_RESET_TTL_MINUTES: '30',
      }),
    ).toEqual({
      ...defaultConfiguration,
      smtpUrl: 'smtps://user:pass@smtp.example.com:465',
      mailFrom: 'no-reply@example.com',
      appBaseUrl: 'https://conjuros.example.com',
      passwordResetTtlMinutes: 30,
    });
  });

  it('requires MAIL_FROM when SMTP_URL is set', () => {
    const message = invalidEnvironmentMessage({
      ...validEnvironment,
      SMTP_URL: 'smtp://user:pass@smtp.example.com:587',
    });

    expect(message).toContain('MAIL_FROM');
  });

  it.each([
    ['SMTP_URL', 'an HTTP URL', { ...validEnvironment, SMTP_URL: 'https://smtp.example.com' }],
    ['SMTP_URL', 'not a URL', { ...validEnvironment, SMTP_URL: 'smtp.example.com:587' }],
    ['MAIL_FROM', 'not an email', { ...validEnvironment, MAIL_FROM: 'not-an-email' }],
    ['APP_BASE_URL', 'not a URL', { ...validEnvironment, APP_BASE_URL: 'conjuros.example.com' }],
    [
      'PASSWORD_RESET_TTL_MINUTES',
      'not a positive integer',
      { ...validEnvironment, PASSWORD_RESET_TTL_MINUTES: '0' },
    ],
  ])(
    'rejects %s when it is %s without displaying configuration values',
    (variableName, _reason, environment) => {
      const message = invalidEnvironmentMessage(environment);

      expect(message).toContain(variableName);
      for (const value of [...Object.values(environment), databaseUrl, 'db-secret-value']) {
        if (value.trim() !== '') expect(message).not.toContain(value);
      }
    },
  );

  it.each([
    ['DATABASE_URL', 'a MongoDB URL', { ...validEnvironment, DATABASE_URL: 'mongodb://localhost:27017' }],
    ['DATABASE_URL', 'an HTTP URL', { ...validEnvironment, DATABASE_URL: 'https://user:pass@localhost:5432' }],
    ['DATABASE_URL', 'a value that is not a URL', { ...validEnvironment, DATABASE_URL: 'localhost:5432/conjuros' }],
    ['DATABASE_URL', 'blank', { ...validEnvironment, DATABASE_URL: '   ' }],
    ['DATABASE_URL', 'empty', { ...validEnvironment, DATABASE_URL: '' }],
    ['DATABASE_URL', 'missing', { SESSION_SECRET: validEnvironment.SESSION_SECRET }],
    ['SESSION_SECRET', 'too short', { ...validEnvironment, SESSION_SECRET: 'short' }],
  ])('rejects %s when it is %s without displaying configuration values', (variableName, _reason, environment) => {
    const message = invalidEnvironmentMessage(environment);

    expect(message).toContain(variableName);
    for (const value of [...Object.values(environment), databaseUrl, 'db-secret-value']) {
      if (value.trim() !== '') expect(message).not.toContain(value);
    }
  });

  it('names every invalid variable once', () => {
    const message = invalidEnvironmentMessage({ DATABASE_URL: 'mongodb://localhost:27017', SESSION_SECRET: 'short' });

    expect(message).toBe('Invalid environment configuration: DATABASE_URL, SESSION_SECRET');
  });

  it('no longer reads the MongoDB variables', () => {
    const message = invalidEnvironmentMessage({
      MONGODB_URI: 'mongodb://localhost:27017',
      MONGODB_DATABASE: 'conjuros',
      SESSION_SECRET: validEnvironment.SESSION_SECRET,
    });

    expect(message).toContain('DATABASE_URL');
  });

  it('reads the optional Storage configuration', () => {
    expect(
      parseApiEnvironment({
        ...validEnvironment,
        SUPABASE_URL: 'https://project.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'service-role-secret',
        ATTACHMENT_BUCKET: 'files',
        ATTACHMENT_MAX_BYTES: '1048576',
      }),
    ).toMatchObject({
      supabaseUrl: 'https://project.supabase.co',
      supabaseServiceRoleKey: 'service-role-secret',
      attachmentBucket: 'files',
      attachmentMaxBytes: 1_048_576,
    });
  });

  it('rejects a half-configured Storage pair without leaking values', () => {
    const message = invalidEnvironmentMessage({
      ...validEnvironment,
      SUPABASE_URL: 'https://project.supabase.co',
    });
    expect(message).toContain('SUPABASE_SERVICE_ROLE_KEY');
    expect(message).not.toContain('project.supabase.co');
  });
});
