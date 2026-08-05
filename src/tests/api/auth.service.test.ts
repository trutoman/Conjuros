import { describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import type { AuthenticatedUser } from '@conjuros/contracts';
import { createSession, readSession } from '../../api/services/auth.service';

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
});
