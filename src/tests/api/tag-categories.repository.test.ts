// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  InMemoryTagCategoriesRepository,
  PostgresTagCategoriesRepository,
} from '../../api/repositories/tag-categories.repository';
import {
  InMemoryUsersRepository,
  PostgresUsersRepository,
} from '../../api/repositories/users.repository';
import { setupPgliteDatabase } from './pglite';

const database = setupPgliteDatabase();

const implementations = [
  [
    'in-memory',
    () => ({
      users: new InMemoryUsersRepository(),
      categories: new InMemoryTagCategoriesRepository(),
    }),
  ],
  [
    'postgres',
    () => ({
      users: new PostgresUsersRepository(database.db),
      categories: new PostgresTagCategoriesRepository(database.db),
    }),
  ],
] as const;

const listQuery = { limit: 25, skip: 0, sort: 'order' as const };

describe.each(implementations)('%s tag categories repository', (_name, createRepositories) => {
  async function setup() {
    const { users, categories } = createRepositories();
    const owner = (await users.create('owner@example.com', 'hash')).id;
    const other = (await users.create('other@example.com', 'hash')).id;

    async function seed(ownerId: string, names: string[]) {
      const created = [];
      for (const name of names) {
        created.push(
          await categories.create(
            ownerId,
            { name, description: '' },
            await categories.nextOrder(ownerId),
          ),
        );
      }
      return created;
    }

    return { categories, owner, other, seed };
  }

  it('creates a category with a normalized name, its description and no members', async () => {
    const { categories, owner } = await setup();

    const created = await categories.create(owner, { name: 'Work', description: 'Job things' }, 1);

    expect(created).toEqual({
      id: expect.any(String),
      ownerId: owner,
      name: 'work',
      nameNormalized: 'work',
      description: 'Job things',
      tagIds: [],
      order: 1,
      createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      updatedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
    });
    expect(await categories.findOwned(created.id, owner)).toEqual(created);
  });

  it('numbers categories per owner', async () => {
    const { categories, owner, other, seed } = await setup();

    expect(await categories.nextOrder(owner)).toBe(1);
    await seed(owner, ['a', 'b']);
    await seed(other, ['c']);

    expect(await categories.nextOrder(owner)).toBe(3);
    expect(await categories.nextOrder(other)).toBe(2);
  });

  it('finds a category by id, normalized name and member tag', async () => {
    const { categories, owner, seed } = await setup();
    const [work] = await seed(owner, ['work', 'home']);
    await categories.addMembers(owner, work.id, ['tag-1']);

    expect((await categories.findOwned(work.id, owner))?.name).toBe('work');
    expect((await categories.findOwnedByNormalizedName(owner, 'work'))?.id).toBe(work.id);
    expect((await categories.findOwnedByMemberTag(owner, 'tag-1'))?.id).toBe(work.id);
    expect(await categories.findOwned('missing', owner)).toBeNull();
    expect(await categories.findOwnedByNormalizedName(owner, 'missing')).toBeNull();
    expect(await categories.findOwnedByMemberTag(owner, 'tag-2')).toBeNull();
    expect((await categories.findAllOwned(owner)).map((category) => category.name).sort()).toEqual([
      'home',
      'work',
    ]);
  });

  it('never returns or changes the categories of another owner', async () => {
    const { categories, owner, other, seed } = await setup();
    const [mine] = await seed(owner, ['work']);
    await categories.addMembers(owner, mine.id, ['tag-1']);

    expect(await categories.findOwned(mine.id, other)).toBeNull();
    expect(await categories.findOwnedByNormalizedName(other, 'work')).toBeNull();
    expect(await categories.findOwnedByMemberTag(other, 'tag-1')).toBeNull();
    expect(await categories.findAllOwned(other)).toEqual([]);
    expect((await categories.list(other, listQuery)).total).toBe(0);
    expect(await categories.addMembers(other, mine.id, ['tag-2'])).toBeNull();
    expect(await categories.removeMember(other, mine.id, 'tag-1')).toBeNull();
    expect(await categories.reorder(mine.id, other, 1)).toBeNull();
    expect(await categories.delete(mine.id, other)).toBe(false);
    expect(await categories.findOwned(mine.id, owner)).toMatchObject({
      name: 'work',
      tagIds: ['tag-1'],
    });
  });

  it('adds members without duplicates and keeps their insertion order', async () => {
    const { categories, owner, seed } = await setup();
    const [work] = await seed(owner, ['work']);

    await categories.addMembers(owner, work.id, ['a', 'b']);
    const updated = await categories.addMembers(owner, work.id, ['b', 'c', 'c']);

    expect(updated?.tagIds).toEqual(['a', 'b', 'c']);
    expect((await categories.findOwned(work.id, owner))?.tagIds).toEqual(['a', 'b', 'c']);
    expect(await categories.addMembers(owner, 'missing', ['a'])).toBeNull();
  });

  it('removes a member and ignores tags that are not members', async () => {
    const { categories, owner, seed } = await setup();
    const [work] = await seed(owner, ['work']);
    await categories.addMembers(owner, work.id, ['a', 'b']);

    const removed = await categories.removeMember(owner, work.id, 'a');
    const unchanged = await categories.removeMember(owner, work.id, 'zzz');

    expect(removed?.tagIds).toEqual(['b']);
    expect(unchanged?.tagIds).toEqual(['b']);
    expect(await categories.removeMember(owner, 'missing', 'a')).toBeNull();
  });

  it('replaces the stored fields of a category', async () => {
    const { categories, owner, seed } = await setup();
    const [work] = await seed(owner, ['work']);
    const edited = {
      ...work,
      name: 'office',
      nameNormalized: 'office',
      description: 'Where work happens',
      tagIds: ['x'],
      updatedAt: '2026-02-03T04:05:06.007Z',
    };

    expect(await categories.replace(edited)).toEqual(edited);
    expect(await categories.findOwned(work.id, owner)).toEqual(edited);
  });

  it('deletes an owned category exactly once', async () => {
    const { categories, owner, seed } = await setup();
    const [work] = await seed(owner, ['work']);

    expect(await categories.delete(work.id, owner)).toBe(true);
    expect(await categories.delete(work.id, owner)).toBe(false);
    expect(await categories.findOwned(work.id, owner)).toBeNull();
  });

  describe('list', () => {
    it('paginates with limit and skip and reports the total of all matches', async () => {
      const { categories, owner, other, seed } = await setup();
      await seed(owner, ['alpha', 'beta', 'gamma']);
      await seed(other, ['delta']);

      const page = await categories.list(owner, { limit: 2, skip: 1, sort: 'name' });

      expect(page.items.map((category) => category.name)).toEqual(['beta', 'gamma']);
      expect(page.total).toBe(3);
    });

    it('sorts by order, name and last update (newest first)', async () => {
      const { categories, owner, seed } = await setup();
      const [charlie, alpha, bravo] = await seed(owner, ['charlie', 'alpha', 'bravo']);
      await categories.replace({ ...charlie, updatedAt: '2026-01-01T00:00:00.000Z' });
      await categories.replace({ ...alpha, updatedAt: '2026-01-03T00:00:00.000Z' });
      await categories.replace({ ...bravo, updatedAt: '2026-01-02T00:00:00.000Z' });

      const names = async (sort: 'order' | 'name' | 'updatedAt') =>
        (await categories.list(owner, { ...listQuery, sort })).items.map(
          (category) => category.name,
        );

      expect(await names('order')).toEqual(['charlie', 'alpha', 'bravo']);
      expect(await names('name')).toEqual(['alpha', 'bravo', 'charlie']);
      expect(await names('updatedAt')).toEqual(['alpha', 'bravo', 'charlie']);
    });

    it('searches name and description case-insensitively and matches wildcards literally', async () => {
      const { categories, owner } = await setup();
      await categories.create(owner, { name: 'alpha', description: '100% done' }, 1);
      await categories.create(owner, { name: 'beta', description: '1000 items' }, 2);
      await categories.create(owner, { name: 'gamma', description: 'a_b and back\\slash' }, 3);
      await categories.create(owner, { name: 'delta', description: 'aXb' }, 4);

      const search = async (term: string) =>
        (await categories.list(owner, { ...listQuery, search: term })).items.map(
          (category) => category.name,
        );

      expect(await search('ALPHA')).toEqual(['alpha']);
      expect(await search('ITEMS')).toEqual(['beta']);
      expect(await search('100%')).toEqual(['alpha']);
      expect(await search('a_b')).toEqual(['gamma']);
      expect(await search('back\\slash')).toEqual(['gamma']);
    });
  });

  describe('reorder', () => {
    const namesInOrder = async (
      categories: Awaited<ReturnType<typeof setup>>['categories'],
      ownerId: string,
    ) => (await categories.findAllOwned(ownerId)).sort((left, right) => left.order - right.order);

    it('moves a category and renumbers the whole list contiguously', async () => {
      const { categories, owner, seed } = await setup();
      const [, , third] = await seed(owner, ['a', 'b', 'c', 'd', 'e']);

      const moved = await categories.reorder(third.id, owner, 1);

      expect(moved).toMatchObject({ name: 'c', order: 1 });
      const ordered = await namesInOrder(categories, owner);
      expect(ordered.map((category) => category.name)).toEqual(['c', 'a', 'b', 'd', 'e']);
      expect(ordered.map((category) => category.order)).toEqual([1, 2, 3, 4, 5]);
    });

    it('places a category last when the position is past the end', async () => {
      const { categories, owner, seed } = await setup();
      const [first] = await seed(owner, ['a', 'b', 'c', 'd', 'e']);

      const moved = await categories.reorder(first.id, owner, 99);

      expect(moved).toMatchObject({ name: 'a', order: 5 });
      expect((await namesInOrder(categories, owner)).map((category) => category.name)).toEqual([
        'b',
        'c',
        'd',
        'e',
        'a',
      ]);
    });

    it('returns null for an unknown category and leaves other owners untouched', async () => {
      const { categories, owner, other, seed } = await setup();
      await seed(owner, ['a', 'b']);
      const [theirs] = await seed(other, ['x', 'y']);
      const before = await categories.findOwned(theirs.id, other);

      expect(await categories.reorder('missing', owner, 1)).toBeNull();
      await categories.reorder(
        (await categories.findOwnedByNormalizedName(owner, 'b'))!.id,
        owner,
        1,
      );

      expect(await categories.findOwned(theirs.id, other)).toEqual(before);
    });
  });
});
