import { describe, expect, it } from 'vitest';

import { parseApiEnvironment } from '../../api/config/environment';

const validEnvironment = {
  MONGODB_URI: 'mongodb://localhost:27017',
  MONGODB_DATABASE: 'conjuros',
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
      mongoUri: 'mongodb://localhost:27017',
      databaseName: 'conjuros',
      sessionSecret: 'a-32-character-session-secret-value',
      adminEmail: null,
      corsOrigin: 'http://localhost:5173',
      port: 3000,
    });
  });

  it('parses an optional admin email', () => {
    expect(
      parseApiEnvironment({ ...validEnvironment, ADMIN_EMAIL: 'Admin@Example.com' }),
    ).toEqual({
      mongoUri: 'mongodb://localhost:27017',
      databaseName: 'conjuros',
      sessionSecret: 'a-32-character-session-secret-value',
      adminEmail: 'admin@example.com',
      corsOrigin: 'http://localhost:5173',
      port: 3000,
    });
  });

  it('treats an empty admin email as absent', () => {
    expect(parseApiEnvironment({ ...validEnvironment, ADMIN_EMAIL: '' })).toEqual({
      mongoUri: 'mongodb://localhost:27017',
      databaseName: 'conjuros',
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
      mongoUri: 'mongodb://localhost:27017',
      databaseName: 'conjuros',
      sessionSecret: 'a-32-character-session-secret-value',
      adminEmail: null,
      corsOrigin: 'https://conjuros.example.com',
      port: 3000,
    });
  });

  it.each([
    ['MONGODB_URI', { ...validEnvironment, MONGODB_URI: '   ' }],
    ['MONGODB_DATABASE', { ...validEnvironment, MONGODB_DATABASE: '' }],
    ['SESSION_SECRET', { ...validEnvironment, SESSION_SECRET: 'short' }],
    ['MONGODB_URI', { ...validEnvironment, MONGODB_URI: 'https://localhost:27017' }],
  ])('rejects invalid %s without displaying configuration values', (variableName, environment) => {
    const message = invalidEnvironmentMessage(environment);

    expect(message).toContain(variableName);
    expect(message).not.toContain(environment.SESSION_SECRET);
    expect(message).not.toContain(environment.MONGODB_URI);
  });
});