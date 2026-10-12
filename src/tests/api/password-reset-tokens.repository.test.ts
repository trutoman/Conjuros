import { describe, expect, it } from 'vitest';
import { InMemoryPasswordResetTokensRepository } from '../../api/repositories/password-reset-tokens.repository';

const expiresAt = new Date('2026-01-01T00:00:00.000Z');

describe('InMemoryPasswordResetTokensRepository', () => {
  it('creates a token and finds it by hash', async () => {
    const repository = new InMemoryPasswordResetTokensRepository();

    const created = await repository.create({ userId: 'user-1', tokenHash: 'hash-1', expiresAt });
    const found = await repository.findByTokenHash('hash-1');

    expect(found).toEqual(created);
    expect(found).toMatchObject({ userId: 'user-1', tokenHash: 'hash-1', usedAt: null });
  });

  it('returns null for an unknown hash', async () => {
    const repository = new InMemoryPasswordResetTokensRepository();

    expect(await repository.findByTokenHash('missing')).toBeNull();
  });

  it('marks a token used', async () => {
    const repository = new InMemoryPasswordResetTokensRepository();
    const created = await repository.create({ userId: 'user-1', tokenHash: 'hash-1', expiresAt });

    await repository.markUsed(created.id, new Date('2026-01-01T01:00:00.000Z'));

    expect((await repository.findByTokenHash('hash-1'))?.usedAt).toBe(
      '2026-01-01T01:00:00.000Z',
    );
  });

  it('deletes only the unused tokens of one user', async () => {
    const repository = new InMemoryPasswordResetTokensRepository();
    await repository.create({ userId: 'user-1', tokenHash: 'hash-1', expiresAt });
    const used = await repository.create({ userId: 'user-1', tokenHash: 'hash-2', expiresAt });
    await repository.markUsed(used.id, new Date());
    await repository.create({ userId: 'user-2', tokenHash: 'hash-3', expiresAt });

    await repository.deleteUnusedForUser('user-1');

    expect(await repository.findByTokenHash('hash-1')).toBeNull();
    expect(await repository.findByTokenHash('hash-2')).not.toBeNull();
    expect(await repository.findByTokenHash('hash-3')).not.toBeNull();
  });

  it('rejects a duplicate token hash', async () => {
    const repository = new InMemoryPasswordResetTokensRepository();
    await repository.create({ userId: 'user-1', tokenHash: 'hash-1', expiresAt });

    await expect(
      repository.create({ userId: 'user-2', tokenHash: 'hash-1', expiresAt }),
    ).rejects.toThrow('A token with this hash already exists');
  });
});
