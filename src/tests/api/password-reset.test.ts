import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EmailMessage } from '../../api/email/sender';
import { PASSWORD_RESET_REQUEST_MESSAGE } from '../../api/controllers/auth.controller';
import { createTestApp, registerUser, validPassword } from './testApp';

const NEW_PASSWORD = 'NewPass1!';

function extractToken(message: EmailMessage): string {
  const match = message.text.match(/reset-password\?token=([^\s]+)/);
  if (!match) throw new Error('No reset token in the email');
  return decodeURIComponent(match[1]);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('password reset request endpoint', () => {
  it('returns the generic message for an existing account and sends the reset email', async () => {
    const { app, emailSender } = createTestApp();
    await registerUser(request, app, 'ada@example.com');
    emailSender.messages.length = 0;

    const response = await request(app)
      .post('/api/auth/password-reset/request')
      .send({ email: 'ada@example.com' })
      .expect(202);

    expect(response.body).toEqual({ message: PASSWORD_RESET_REQUEST_MESSAGE });
    expect(emailSender.messages).toHaveLength(1);
    expect(emailSender.messages[0].to).toBe('ada@example.com');
  });

  it('returns the same generic message for an unknown email without sending anything', async () => {
    const { app, emailSender } = createTestApp();

    const response = await request(app)
      .post('/api/auth/password-reset/request')
      .send({ email: 'nobody@example.com' })
      .expect(202);

    expect(response.body).toEqual({ message: PASSWORD_RESET_REQUEST_MESSAGE });
    expect(emailSender.messages).toHaveLength(0);
  });

  it('returns the same generic message for a passwordless account without sending anything', async () => {
    const { app, users, emailSender } = createTestApp();
    await users.create('google@example.com', null);

    const response = await request(app)
      .post('/api/auth/password-reset/request')
      .send({ email: 'google@example.com' })
      .expect(202);

    expect(response.body).toEqual({ message: PASSWORD_RESET_REQUEST_MESSAGE });
    expect(emailSender.messages).toHaveLength(0);
  });
});

describe('password reset confirm endpoint', () => {
  it('resets the password so the new one signs in and the old fails', async () => {
    const { app, emailSender } = createTestApp();
    await registerUser(request, app, 'ada@example.com');
    emailSender.messages.length = 0;
    await request(app)
      .post('/api/auth/password-reset/request')
      .send({ email: 'ada@example.com' })
      .expect(202);
    const token = extractToken(emailSender.messages[0]);

    await request(app)
      .post('/api/auth/password-reset/confirm')
      .send({ token, password: NEW_PASSWORD })
      .expect(200);

    await request(app)
      .post('/api/auth/login')
      .send({ email: 'ada@example.com', password: NEW_PASSWORD })
      .expect(200);
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'ada@example.com', password: validPassword })
      .expect(401);
  });

  it('returns the unmet password rule and leaves the token usable', async () => {
    const { app, emailSender } = createTestApp();
    await registerUser(request, app, 'ada@example.com');
    emailSender.messages.length = 0;
    await request(app)
      .post('/api/auth/password-reset/request')
      .send({ email: 'ada@example.com' })
      .expect(202);
    const token = extractToken(emailSender.messages[0]);

    const rejected = await request(app)
      .post('/api/auth/password-reset/confirm')
      .send({ token, password: 'weakpassword' })
      .expect(400);

    expect(rejected.body.error).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Password must include at least one uppercase letter',
    });

    await request(app)
      .post('/api/auth/password-reset/confirm')
      .send({ token, password: NEW_PASSWORD })
      .expect(200);
  });

  it('rejects an invalid token with the invalid-or-expired message', async () => {
    const { app } = createTestApp();

    const response = await request(app)
      .post('/api/auth/password-reset/confirm')
      .send({ token: 'not-a-real-token', password: NEW_PASSWORD })
      .expect(400);

    expect(response.body.error).toMatchObject({
      code: 'RESET_TOKEN_INVALID',
      message: 'This password reset link is invalid or has expired',
    });
  });

  it('does not create a session when a password is reset', async () => {
    const { app, emailSender } = createTestApp();
    await registerUser(request, app, 'ada@example.com');
    emailSender.messages.length = 0;
    await request(app)
      .post('/api/auth/password-reset/request')
      .send({ email: 'ada@example.com' })
      .expect(202);
    const token = extractToken(emailSender.messages[0]);

    const response = await request(app)
      .post('/api/auth/password-reset/confirm')
      .send({ token, password: NEW_PASSWORD })
      .expect(200);

    expect(response.headers['set-cookie']).toBeUndefined();
  });
});

describe('registration emails', () => {
  it('sends a welcome email on registration', async () => {
    const { app, emailSender } = createTestApp();

    await registerUser(request, app, 'ada@example.com');

    expect(emailSender.messages).toHaveLength(1);
    expect(emailSender.messages[0]).toMatchObject({ to: 'ada@example.com' });
    expect(emailSender.messages[0].subject).toBe('Welcome to Conjuros');
  });

  it('still registers the account when the welcome email fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { app, emailSender } = createTestApp();
    emailSender.send = async () => {
      throw new Error('smtp is unavailable');
    };

    await request(app)
      .post('/api/auth/register')
      .send({ email: 'ada@example.com', password: validPassword })
      .expect(201);
  });
});
