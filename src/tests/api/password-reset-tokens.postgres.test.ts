// @vitest-environment node
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { users } from '../../api/db/schema';
import { PostgresPasswordResetTokensRepository } from '../../api/repositories/password-reset-tokens.repository';
import { PostgresUsersRepository } from '../../api/repositories/users.repository';
import { setupPgliteDatabase } from './pglite';

const database = setupPgliteDatabase();
const expiresAt = new Date('2026-01-01T00:00:00.000Z');

async function createUser(email: string) {
  return new PostgresUsersRepository(database.db).create(email, 'hash');
}

describe('PostgresPasswordResetTokensRepository', () => {
  it('creates a token and finds it by hash', async () => {
    const repository = new PostgresPasswordResetTokensRepository(database.db);
    const user = await createUser('ada@example.com');

    const created = await repository.create({
      userId: user.id,
      tokenHash: 'hash-1',
      expiresAt,
    });
    const found = await repository.findByTokenHash('hash-1');

    expect(found).toEqual(created);
    expect(found).toMatchObject({ userId: user.id, tokenHash: 'hash-1', usedAt: null });
  });

  it('returns null for an unknown hash', async () => {
    const repository = new PostgresPasswordResetTokensRepository(database.db);

    expect(await repository.findByTokenHash('missing')).toBeNull();
  });

  it('marks a token used', async () => {
    const repository = new PostgresPasswordResetTokensRepository(database.db);
    const user = await createUser('ada@example.com');
    const created = await repository.create({ userId: user.id, tokenHash: 'hash-1', expiresAt });

    await repository.markUsed(created.id, new Date('2026-01-01T01:00:00.000Z'));

    expect((await repository.findByTokenHash('hash-1'))?.usedAt).toBe(
      '2026-01-01T01:00:00.000Z',
    );
  });

  it('deletes only the unused tokens of one user', async () => {
    const repository = new PostgresPasswordResetTokensRepository(database.db);
    const user = await createUser('ada@example.com');
    const other = await createUser('grace@example.com');
    await repository.create({ userId: user.id, tokenHash: 'hash-1', expiresAt });
    const used = await repository.create({ userId: user.id, tokenHash: 'hash-2', expiresAt });
    await repository.markUsed(used.id, new Date());
    await repository.create({ userId: other.id, tokenHash: 'hash-3', expiresAt });

    await repository.deleteUnusedForUser(user.id);

    expect(await repository.findByTokenHash('hash-1')).toBeNull();
    expect(await repository.findByTokenHash('hash-2')).not.toBeNull();
    expect(await repository.findByTokenHash('hash-3')).not.toBeNull();
  });

  it('rejects a duplicate token hash', async () => {
    const repository = new PostgresPasswordResetTokensRepository(database.db);
    const user = await createUser('ada@example.com');
    await repository.create({ userId: user.id, tokenHash: 'hash-1', expiresAt });

    await expect(
      repository.create({ userId: user.id, tokenHash: 'hash-1', expiresAt }),
    ).rejects.toThrow();
  });

  it('removes the tokens when the account is deleted', async () => {
    const repository = new PostgresPasswordResetTokensRepository(database.db);
    const user = await createUser('ada@example.com');
    await repository.create({ userId: user.id, tokenHash: 'hash-1', expiresAt });

    await database.db.delete(users).where(eq(users.id, user.id));

    expect(await repository.findByTokenHash('hash-1')).toBeNull();
  });
});
