// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { AppError } from '../../api/errors';
import { PostgresUsersRepository } from '../../api/repositories/users.repository';
import { setupPgliteDatabase } from './pglite';

const database = setupPgliteDatabase();

describe('PostgresUsersRepository', () => {
  it('rejects a duplicate email with a conflict error', async () => {
    const repository = new PostgresUsersRepository(database.db);
    await repository.create('ada@example.com', 'hash-1');

    const attempt = repository.create('ada@example.com', 'hash-2');

    await expect(attempt).rejects.toBeInstanceOf(AppError);
    await expect(attempt).rejects.toMatchObject({
      status: 409,
      code: 'CONFLICT',
      message: 'An account with this email already exists',
    });
  });

  it('creates exactly one account when the same email is registered at the same time', async () => {
    const repository = new PostgresUsersRepository(database.db);

    const outcomes = await Promise.allSettled([
      repository.create('ada@example.com', 'hash-1'),
      repository.create('ada@example.com', 'hash-2'),
    ]);

    expect(outcomes.filter((outcome) => outcome.status === 'fulfilled')).toHaveLength(1);
    expect(outcomes.find((outcome) => outcome.status === 'rejected')).toMatchObject({
      reason: { status: 409, code: 'CONFLICT' },
    });
  });
});
