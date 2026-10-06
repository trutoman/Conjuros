// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { tags as tagsTable } from '../../api/db/schema';
import { FOREIGN_KEY_VIOLATION } from '../../api/db/sqlstate';
import { PostgresTagsRepository } from '../../api/repositories/tags.repository';
import { PostgresUsersRepository } from '../../api/repositories/users.repository';
import { sqlStateOf, setupPgliteDatabase } from './pglite';

const database = setupPgliteDatabase();

async function setup() {
  const users = new PostgresUsersRepository(database.db);
  const tags = new PostgresTagsRepository(database.db);
  const owner = (await users.create('owner@example.com', 'hash')).id;
  return { tags, owner };
}

function row(ownerId: string, id: string, order: number, tagName = id) {
  const timestamp = new Date();
  return {
    id,
    ownerId,
    tagName,
    tagNameNormalized: tagName,
    color: '#123ABC',
    order,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

describe('PostgresTagsRepository', () => {
  it('lists tags by position and breaks ties by id', async () => {
    const { tags, owner } = await setup();
    await database.db
      .insert(tagsTable)
      .values([row(owner, 'c', 2), row(owner, 'b', 1), row(owner, 'a', 2), row(owner, 'd', 3)]);

    const listed = await tags.findAllOwned(owner);

    expect(listed.map((tag) => tag.id)).toEqual(['b', 'a', 'c', 'd']);
  });

  it('allows the same tag name more than once for an owner', async () => {
    const { tags, owner } = await setup();

    await tags.create(owner, { tagName: 'docs', description: '', color: '#123ABC' }, 1);
    await tags.create(owner, { tagName: 'docs', description: '', color: '#123ABC' }, 2);

    expect(await tags.findOwnedByNormalizedNames(owner, ['docs'])).toHaveLength(2);
  });

  it('treats lookup values as data', async () => {
    const { tags, owner } = await setup();
    await tags.create(owner, { tagName: 'docs', description: '', color: '#123ABC' }, 1);

    const found = await tags.findOwnedByNormalizedNames(owner, ["docs' OR '1'='1", '%', 'd_cs']);

    expect(found).toEqual([]);
  });

  it('does not replace a tag on behalf of another owner', async () => {
    const { tags, owner } = await setup();
    const other = (
      await new PostgresUsersRepository(database.db).create('other@example.com', 'hash')
    ).id;
    const mine = await tags.create(
      owner,
      { tagName: 'docs', description: 'mine', color: '#123ABC' },
      1,
    );

    await tags.replace({ ...mine, ownerId: other, description: 'hijacked' });

    expect(await tags.findOwned(mine.id, owner)).toEqual(mine);
    expect(await tags.findAllOwned(other)).toEqual([]);
  });

  it('rejects a tag for an owner without an account', async () => {
    const { tags } = await setup();

    const state = await sqlStateOf(
      tags.create('missing-owner', { tagName: 'docs', description: '', color: '#123ABC' }, 1),
    );

    expect(state).toBe(FOREIGN_KEY_VIOLATION);
  });

  it('bumps updatedAt on every tag of the owner when one is moved', async () => {
    const { tags, owner } = await setup();
    const stale = new Date('2020-01-01T00:00:00.000Z');
    await database.db.insert(tagsTable).values([
      { ...row(owner, 'a', 1), updatedAt: stale },
      { ...row(owner, 'b', 2), updatedAt: stale },
    ]);

    await tags.reorder('b', owner, 1);

    const stored = await tags.findAllOwned(owner);
    expect(stored.map((tag) => tag.id)).toEqual(['b', 'a']);
    expect(stored.every((tag) => tag.updatedAt !== stale.toISOString())).toBe(true);
  });
});
