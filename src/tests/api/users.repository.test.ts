// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  InMemoryUsersRepository,
  PostgresUsersRepository,
} from '../../api/repositories/users.repository';
import { setupPgliteDatabase } from './pglite';

const database = setupPgliteDatabase();

const implementations = [
  ['in-memory', () => new InMemoryUsersRepository()],
  ['postgres', () => new PostgresUsersRepository(database.db)],
] as const;

describe.each(implementations)('%s users repository', (_name, createRepository) => {
  it('creates a user with the default theme and role', async () => {
    const repository = createRepository();

    const user = await repository.create('ada@example.com', 'hash-1');

    expect(user).toEqual({
      id: expect.any(String),
      email: 'ada@example.com',
      passwordHash: 'hash-1',
      createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      theme: 'light',
      role: 'user',
    });
  });

  it('finds a user by email and by id', async () => {
    const repository = createRepository();
    const created = await repository.create('ada@example.com', 'hash-1');

    expect(await repository.findByEmail('ada@example.com')).toEqual(created);
    expect(await repository.findById(created.id)).toEqual(created);
  });

  it('returns null for an unknown email or id', async () => {
    const repository = createRepository();

    expect(await repository.findByEmail('nobody@example.com')).toBeNull();
    expect(await repository.findById('missing')).toBeNull();
  });

  it('keeps users apart', async () => {
    const repository = createRepository();
    const ada = await repository.create('ada@example.com', 'hash-1');
    const grace = await repository.create('grace@example.com', 'hash-2');

    expect(ada.id).not.toBe(grace.id);
    expect((await repository.findByEmail('grace@example.com'))?.id).toBe(grace.id);
  });

  it('updates the theme preference and returns the updated user', async () => {
    const repository = createRepository();
    const created = await repository.create('ada@example.com', 'hash-1');

    const updated = await repository.updateTheme(created.id, 'dark');

    expect(updated).toEqual({ ...created, theme: 'dark' });
    expect(await repository.findById(created.id)).toEqual({ ...created, theme: 'dark' });
    expect(await repository.updateTheme('missing', 'dark')).toBeNull();
  });

  it('updates the role and returns the updated user', async () => {
    const repository = createRepository();
    const created = await repository.create('ada@example.com', 'hash-1');

    const updated = await repository.setRole(created.id, 'admin');

    expect(updated).toEqual({ ...created, role: 'admin' });
    expect(await repository.findByEmail('ada@example.com')).toEqual({ ...created, role: 'admin' });
    expect(await repository.setRole('missing', 'admin')).toBeNull();
  });
});
