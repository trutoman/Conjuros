import { describe, expect, it } from 'vitest';

import { parseApiEnvironment } from '../../api/config/environment';

const databaseUrl = 'postgres://conjuros:db-secret-value@localhost:5432/conjuros';

const validEnvironment: Record<string, string> = {
  DATABASE_URL: databaseUrl,
  SESSION_SECRET: 'a-32-character-session-secret-value',
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
    expect(parseApiEnvironment(validEnvironment)).toEqual({
      databaseUrl,
      sessionSecret: 'a-32-character-session-secret-value',
      adminEmail: null,
      corsOrigin: 'http://localhost:5173',
      port: 3000,
    });
  });

  it.each(['postgres://user:pass@localhost:5432/conjuros', 'postgresql://user:pass@db:5432/conjuros'])(
    'accepts the PostgreSQL URL %s',
    (url) => {
      expect(parseApiEnvironment({ ...validEnvironment, DATABASE_URL: url }).databaseUrl).toBe(url);
    },
  );

  it('parses an optional admin email', () => {
    expect(
      parseApiEnvironment({ ...validEnvironment, ADMIN_EMAIL: 'Admin@Example.com' }),
    ).toEqual({
      databaseUrl,
      sessionSecret: 'a-32-character-session-secret-value',
      adminEmail: 'admin@example.com',
      corsOrigin: 'http://localhost:5173',
      port: 3000,
    });
  });

  it('treats an empty admin email as absent', () => {
    expect(parseApiEnvironment({ ...validEnvironment, ADMIN_EMAIL: '' })).toEqual({
      databaseUrl,
      sessionSecret: 'a-32-character-session-secret-value',
      adminEmail: null,
      corsOrigin: 'http://localhost:5173',
      port: 3000,
    });
  });

  it('parses a configurable CORS origin', () => {
    expect(
      parseApiEnvironment({ ...validEnvironment, CORS_ORIGIN: 'https://conjuros.example.com' }),
    ).toEqual({
      databaseUrl,
      sessionSecret: 'a-32-character-session-secret-value',
      adminEmail: null,
      corsOrigin: 'https://conjuros.example.com',
      port: 3000,
    });
  });

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
});
