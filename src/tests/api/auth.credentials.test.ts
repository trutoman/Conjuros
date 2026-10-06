import request from 'supertest';
import bcrypt from 'bcryptjs';
import { describe, expect, it } from 'vitest';
import { passwordSchema } from '@conjuros/contracts';
import { createTestApp, registerUser, validPassword } from './testApp';

describe('password policy', () => {
  it('accepts a password that includes every required character class', () => {
    expect(passwordSchema.safeParse('Conjuro1!').success).toBe(true);
  });

  it('rejects a password shorter than the minimum length', () => {
    const result = passwordSchema.safeParse('Ab1!xyz');
    expect(result.success).toBe(false);
    expect(result.success ? '' : result.error.issues[0].message).toBe(
      'Password must be at least 8 characters',
    );
  });

  it('rejects a password longer than the maximum length', () => {
    const result = passwordSchema.safeParse(`Ab1!${'x'.repeat(125)}`);
    expect(result.success).toBe(false);
    expect(result.success ? '' : result.error.issues[0].message).toBe(
      'Password must be at most 128 characters',
    );
  });

  it('rejects a password without an uppercase letter', () => {
    const result = passwordSchema.safeParse('conjuro1!');
    expect(result.success).toBe(false);
    expect(result.success ? '' : result.error.issues[0].message).toBe(
      'Password must include at least one uppercase letter',
    );
  });

  it('rejects a password without a lowercase letter', () => {
    const result = passwordSchema.safeParse('CONJURO1!');
    expect(result.success).toBe(false);
    expect(result.success ? '' : result.error.issues[0].message).toBe(
      'Password must include at least one lowercase letter',
    );
  });

  it('rejects a password without a number', () => {
    const result = passwordSchema.safeParse('Conjuro!!');
    expect(result.success).toBe(false);
    expect(result.success ? '' : result.error.issues[0].message).toBe(
      'Password must include at least one number',
    );
  });

  it('rejects a password without a special character', () => {
    const result = passwordSchema.safeParse('Conjuro12');
    expect(result.success).toBe(false);
    expect(result.success ? '' : result.error.issues[0].message).toBe(
      'Password must include at least one special character',
    );
  });
});

describe('auth credentials route validation', () => {
  it('returns the unmet password rule as the error message on registration', async () => {
    const { app } = createTestApp();

    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'ada@example.com', password: 'weakpassword' })
      .expect(400);

    expect(response.body.error).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Password must include at least one uppercase letter',
    });
  });

  it('reports an already-registered email without exposing account data', async () => {
    const { app } = createTestApp();
    await registerUser(request, app, 'ada@example.com');

    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'ada@example.com', password: validPassword })
      .expect(409);

    expect(response.body.error).toMatchObject({
      code: 'CONFLICT',
      message: 'An account with this email already exists',
    });
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
  });

  it('rejects an unknown email with the generic invalid-credentials message', async () => {
    const { app } = createTestApp();

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: validPassword })
      .expect(401);

    expect(response.body.error).toMatchObject({
      code: 'AUTH_ERROR',
      message: 'Invalid email or password',
    });
  });

  it('rejects a wrong password with the generic invalid-credentials message', async () => {
    const { app } = createTestApp();
    await registerUser(request, app, 'ada@example.com');

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ada@example.com', password: 'WrongPass1!' })
      .expect(401);

    expect(response.body.error).toMatchObject({
      code: 'AUTH_ERROR',
      message: 'Invalid email or password',
    });
  });

  it('rejects a passwordless account with the same generic invalid-credentials message', async () => {
    const { app, users } = createTestApp();
    await users.create('nolocal@example.com', null);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nolocal@example.com', password: validPassword })
      .expect(401);

    expect(response.body.error).toMatchObject({
      code: 'AUTH_ERROR',
      message: 'Invalid email or password',
    });
  });

  it('signs in a legacy account whose password predates the stronger policy', async () => {
    const { app, users } = createTestApp();
    const weakButValid = 'weakpassword1';
    await users.create('legacy@example.com', await bcrypt.hash(weakButValid, 4));

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'legacy@example.com', password: weakButValid })
      .expect(200);

    expect(response.body.user).toMatchObject({ email: 'legacy@example.com' });
  });
});
