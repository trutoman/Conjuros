// @vitest-environment node
import { sql } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { tagCategories } from '../../api/db/schema';
import { FOREIGN_KEY_VIOLATION } from '../../api/db/sqlstate';
import { PostgresTagCategoriesRepository } from '../../api/repositories/tag-categories.repository';
import { PostgresUsersRepository } from '../../api/repositories/users.repository';
import { sqlStateOf, setupPgliteDatabase } from './pglite';

const database = setupPgliteDatabase();

async function setup() {
  const users = new PostgresUsersRepository(database.db);
  const categories = new PostgresTagCategoriesRepository(database.db);
  const owner = (await users.create('owner@example.com', 'hash')).id;
  return { categories, owner };
}

describe('PostgresTagCategoriesRepository', () => {
  it('returns the existing category when the name is already taken', async () => {
    const { categories, owner } = await setup();
    const first = await categories.create(owner, { name: 'work', description: 'first' }, 1);

    const second = await categories.create(owner, { name: 'Work', description: 'second' }, 2);

    expect(second).toEqual(first);
    expect((await categories.list(owner, { limit: 25, skip: 0, sort: 'order' })).total).toBe(1);
  });

  it('creates one category when the same name is created concurrently', async () => {
    const { categories, owner } = await setup();

    const created = await Promise.all([
      categories.create(owner, { name: 'work', description: '' }, 1),
      categories.create(owner, { name: 'work', description: '' }, 1),
      categories.create(owner, { name: 'work', description: '' }, 1),
    ]);

    expect(new Set(created.map((category) => category.id)).size).toBe(1);
    expect(await categories.findAllOwned(owner)).toHaveLength(1);
  });

  it('keeps every member when members are added concurrently', async () => {
    const { categories, owner } = await setup();
    const work = await categories.create(owner, { name: 'work', description: '' }, 1);

    await Promise.all(
      ['a', 'b', 'c', 'd', 'e'].map((tagId) =>
        categories.addMembers(owner, work.id, [tagId, 'shared']),
      ),
    );

    const stored = await categories.findOwned(work.id, owner);
    expect([...(stored?.tagIds ?? [])].sort()).toEqual(['a', 'b', 'c', 'd', 'e', 'shared']);
  });

  it('bumps updatedAt when members change', async () => {
    const { categories, owner } = await setup();
    const work = await categories.create(owner, { name: 'work', description: '' }, 1);
    const stale = '2020-01-01T00:00:00.000Z';
    await categories.replace({ ...work, updatedAt: stale });

    const added = await categories.addMembers(owner, work.id, ['a']);
    const removed = await categories.removeMember(owner, work.id, 'a');

    expect(added).not.toBeNull();
    expect(added?.updatedAt).not.toBe(stale);
    expect(removed).not.toBeNull();
    expect(removed?.updatedAt).not.toBe(stale);
  });

  it('stores member ids that contain array and SQL metacharacters as plain data', async () => {
    const { categories, owner } = await setup();
    const work = await categories.create(owner, { name: 'work', description: '' }, 1);
    const awkward = ["x'), ('y", '{a,b}', 'has,comma', '"quoted"', 'back\\slash', 'NULL', ''];

    const updated = await categories.addMembers(owner, work.id, awkward);

    expect(updated?.tagIds).toEqual(awkward);
    for (const tagId of awkward) {
      expect((await categories.findOwnedByMemberTag(owner, tagId))?.id).toBe(work.id);
    }
    const removed = await categories.removeMember(owner, work.id, '{a,b}');
    expect(removed?.tagIds).toEqual(awkward.filter((tagId) => tagId !== '{a,b}'));
  });

  it('adds nothing when the list of members is empty', async () => {
    const { categories, owner } = await setup();
    const work = await categories.create(owner, { name: 'work', description: '' }, 1);
    await categories.addMembers(owner, work.id, ['a']);

    const unchanged = await categories.addMembers(owner, work.id, []);

    expect(unchanged?.tagIds).toEqual(['a']);
  });

  it('surfaces stored names in normalized lowercase on every read', async () => {
    const { categories, owner } = await setup();
    const timestamp = new Date();
    await database.db.insert(tagCategories).values({
      id: 'legacy',
      ownerId: owner,
      name: 'General',
      nameNormalized: 'General',
      order: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    expect(await categories.findOwned('legacy', owner)).toMatchObject({
      name: 'general',
      nameNormalized: 'general',
    });
    expect((await categories.findAllOwned(owner))[0]).toMatchObject({ name: 'general' });
    expect(
      (await categories.list(owner, { limit: 25, skip: 0, sort: 'order' })).items[0],
    ).toMatchObject({ name: 'general' });
  });

  it('rejects a category for an owner without an account', async () => {
    const { categories } = await setup();

    const state = await sqlStateOf(
      categories.create('missing-owner', { name: 'work', description: '' }, 1),
    );

    expect(state).toBe(FOREIGN_KEY_VIOLATION);
  });

  it('leaves the list untouched when a reorder fails part-way', async () => {
    const { categories, owner } = await setup();
    const [a, b, c] = [
      await categories.create(owner, { name: 'a', description: '' }, 1),
      await categories.create(owner, { name: 'b', description: '' }, 2),
      await categories.create(owner, { name: 'c', description: '' }, 3),
    ];
    // Moving c to the front gives b position 3, which this trigger rejects.
    await database.db.execute(sql`
      CREATE FUNCTION reject_position_three() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        IF NEW.position = 3 THEN RAISE EXCEPTION 'position 3 rejected'; END IF;
        RETURN NEW;
      END $$`);
    await database.db.execute(sql`
      CREATE TRIGGER reject_position_three BEFORE UPDATE ON tag_categories
      FOR EACH ROW EXECUTE FUNCTION reject_position_three()`);

    try {
      await expect(categories.reorder(c.id, owner, 1)).rejects.toBeDefined();
    } finally {
      await database.db.execute(sql`DROP TRIGGER reject_position_three ON tag_categories`);
      await database.db.execute(sql`DROP FUNCTION reject_position_three()`);
    }

    const stored = await categories.findAllOwned(owner);
    expect(stored.map((category) => [category.id, category.order])).toEqual([
      [a.id, 1],
      [b.id, 2],
      [c.id, 3],
    ]);
  });
});
