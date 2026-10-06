import { describe, expect, it } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { AuthenticatedUser } from '@conjuros/contracts';
import { InMemoryUsersRepository } from '../../api/repositories/users.repository';
import {
  authenticateUser,
  createSession,
  readSession,
  resolveExternalIdentity,
} from '../../api/services/auth.service';

const TEST_SECRET = 'test-secret-key-for-jwt-signing';
const validUser: AuthenticatedUser = { id: 'user-123', email: 'test@example.com' };

describe('auth.service', () => {
  describe('readSession', () => {
    it('returns authenticated user for valid token', () => {
      const token = createSession(validUser, TEST_SECRET);
      const result = readSession(token, TEST_SECRET);

      expect(result).toEqual(validUser);
    });

    it('throws AppError 401 for invalid JWT signature', () => {
      const token = createSession(validUser, TEST_SECRET);
      const wrongSecret = 'wrong-secret-key';

      expect(() => readSession(token, wrongSecret)).toThrow(
        expect.objectContaining({
          status: 401,
          code: 'AUTH_ERROR',
          message: 'Your session is invalid or expired',
        }),
      );
    });

    it('throws AppError 401 for expired JWT token', () => {
      const expiredToken = jwt.sign(validUser, TEST_SECRET, { expiresIn: '-1s' });

      expect(() => readSession(expiredToken, TEST_SECRET)).toThrow(
        expect.objectContaining({
          status: 401,
          code: 'AUTH_ERROR',
          message: 'Your session is invalid or expired',
        }),
      );
    });

    it('throws AppError 401 for malformed payload missing id', () => {
      const malformedToken = jwt.sign({ email: 'test@example.com' }, TEST_SECRET);

      expect(() => readSession(malformedToken, TEST_SECRET)).toThrow(
        expect.objectContaining({
          status: 401,
          code: 'AUTH_ERROR',
          message: 'Your session is invalid or expired',
        }),
      );
    });

    it('throws AppError 401 for malformed payload missing email', () => {
      const malformedToken = jwt.sign({ id: 'user-123' }, TEST_SECRET);

      expect(() => readSession(malformedToken, TEST_SECRET)).toThrow(
        expect.objectContaining({
          status: 401,
          code: 'AUTH_ERROR',
          message: 'Your session is invalid or expired',
        }),
      );
    });
  });

  describe('authenticateUser', () => {
    const credentials = { email: 'ada@example.com', password: 'Password1!' };

    it('signs in a password account with valid credentials', async () => {
      const repository = new InMemoryUsersRepository();
      const created = await repository.create(
        credentials.email,
        await bcrypt.hash(credentials.password, 4),
      );

      const result = await authenticateUser(repository, credentials);

      expect(result).toEqual({ id: created.id, email: created.email });
    });

    it('rejects a passwordless account with the invalid-credentials error', async () => {
      const repository = new InMemoryUsersRepository();
      await repository.create(credentials.email, null);

      await expect(authenticateUser(repository, credentials)).rejects.toMatchObject({
        status: 401,
        code: 'AUTH_ERROR',
        message: 'Invalid email or password',
      });
    });
  });

  describe('resolveExternalIdentity', () => {
    it('returns the account already linked to the identity without duplicating it', async () => {
      const repository = new InMemoryUsersRepository();
      const created = await repository.create('ada@example.com', null);
      await repository.linkGoogleId(created.id, 'sub-1');

      const result = await resolveExternalIdentity(repository, {
        subject: 'sub-1',
        email: 'ada@example.com',
        emailVerified: true,
      });

      expect(result).toEqual({ id: created.id, email: 'ada@example.com' });
      expect(
        (await repository.findByEmail('ada@example.com'))?.id,
      ).toBe(created.id);
    });

    it('links a verified email to an existing account', async () => {
      const repository = new InMemoryUsersRepository();
      const existing = await repository.create('ada@example.com', 'hash');

      const result = await resolveExternalIdentity(repository, {
        subject: 'sub-1',
        email: 'ada@example.com',
        emailVerified: true,
      });

      expect(result).toEqual({ id: existing.id, email: existing.email });
      expect((await repository.findByGoogleId('sub-1'))?.id).toBe(existing.id);
    });

    it('creates a passwordless account when no email matches', async () => {
      const repository = new InMemoryUsersRepository();

      const result = await resolveExternalIdentity(repository, {
        subject: 'sub-1',
        email: 'new@example.com',
        emailVerified: true,
      });

      const stored = await repository.findById(result.id);
      expect(stored).toMatchObject({ email: 'new@example.com', passwordHash: null, googleId: 'sub-1' });
    });

    it('rejects an unverified email', async () => {
      const repository = new InMemoryUsersRepository();

      await expect(
        resolveExternalIdentity(repository, {
          subject: 'sub-1',
          email: 'new@example.com',
          emailVerified: false,
        }),
      ).rejects.toMatchObject({ status: 401, code: 'AUTH_ERROR' });
      expect(await repository.findByEmail('new@example.com')).toBeNull();
    });

    it('rejects an absent email', async () => {
      const repository = new InMemoryUsersRepository();

      await expect(
        resolveExternalIdentity(repository, { subject: 'sub-1', email: null, emailVerified: true }),
      ).rejects.toMatchObject({ status: 401, code: 'AUTH_ERROR' });
      expect(await repository.findByGoogleId('sub-1')).toBeNull();
    });
  });
});
