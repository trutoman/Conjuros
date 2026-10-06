// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  InMemoryTagsRepository,
  PostgresTagsRepository,
} from '../../api/repositories/tags.repository';
import {
  InMemoryUsersRepository,
  PostgresUsersRepository,
} from '../../api/repositories/users.repository';
import { setupPgliteDatabase } from './pglite';

const database = setupPgliteDatabase();

const implementations = [
  [
    'in-memory',
    () => ({ users: new InMemoryUsersRepository(), tags: new InMemoryTagsRepository() }),
  ],
  [
    'postgres',
    () => ({
      users: new PostgresUsersRepository(database.db),
      tags: new PostgresTagsRepository(database.db),
    }),
  ],
] as const;

describe.each(implementations)('%s tags repository', (_name, createRepositories) => {
  async function setup() {
    const { users, tags } = createRepositories();
    const owner = (await users.create('owner@example.com', 'hash')).id;
    const other = (await users.create('other@example.com', 'hash')).id;

    async function seed(ownerId: string, names: string[]) {
      const created = [];
      for (const tagName of names) {
        created.push(
          await tags.create(
            ownerId,
            { tagName, description: `About ${tagName}`, color: '#123ABC' },
            await tags.nextOrder(ownerId),
          ),
        );
      }
      return created;
    }

    const inOrder = async (ownerId: string) =>
      (await tags.findAllOwned(ownerId)).sort((left, right) => left.order - right.order);

    return { tags, owner, other, seed, inOrder };
  }

  it('creates a tag with a normalized name and its own fields', async () => {
    const { tags, owner } = await setup();

    const created = await tags.create(
      owner,
      { tagName: 'Docs.API', description: 'Reference', color: '#AABBCC' },
      1,
    );

    expect(created).toEqual({
      id: expect.any(String),
      ownerId: owner,
      tagName: 'Docs.API',
      tagNameNormalized: 'docs.api',
      description: 'Reference',
      color: '#AABBCC',
      order: 1,
      createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      updatedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
    });
    expect(await tags.findOwned(created.id, owner)).toEqual(created);
  });

  it('numbers tags per owner', async () => {
    const { tags, owner, other, seed } = await setup();

    expect(await tags.nextOrder(owner)).toBe(1);
    await seed(owner, ['a', 'b']);
    await seed(other, ['c']);

    expect(await tags.nextOrder(owner)).toBe(3);
    expect(await tags.nextOrder(other)).toBe(2);
  });

  it('finds owned tags by normalized names', async () => {
    const { tags, owner, other, seed } = await setup();
    await seed(owner, ['Alpha', 'Beta', 'Gamma']);
    await seed(other, ['Alpha']);

    const found = await tags.findOwnedByNormalizedNames(owner, ['alpha', 'gamma', 'missing']);

    expect(found.map((tag) => tag.tagNameNormalized).sort()).toEqual(['alpha', 'gamma']);
    expect(found.every((tag) => tag.ownerId === owner)).toBe(true);
    expect(await tags.findOwnedByNormalizedNames(owner, [])).toEqual([]);
  });

  it('never returns or changes the tags of another owner', async () => {
    const { tags, owner, other, seed } = await setup();
    const [mine] = await seed(owner, ['docs']);

    expect(await tags.findOwned(mine.id, other)).toBeNull();
    expect(await tags.findOwnedByNormalizedNames(other, ['docs'])).toEqual([]);
    expect(await tags.findAllOwned(other)).toEqual([]);
    expect(await tags.reorder(mine.id, other, 1)).toBeNull();
    expect(await tags.delete(mine.id, other)).toBe(false);
    expect(await tags.findOwned(mine.id, owner)).toEqual(mine);
  });

  it('replaces the stored fields of a tag', async () => {
    const { tags, owner, seed } = await setup();
    const [docs] = await seed(owner, ['docs']);
    const edited = {
      ...docs,
      tagName: 'Guides',
      tagNameNormalized: 'guides',
      description: 'Renamed',
      color: '#000000',
      updatedAt: '2026-02-03T04:05:06.007Z',
    };

    expect(await tags.replace(edited)).toEqual(edited);
    expect(await tags.findOwned(docs.id, owner)).toEqual(edited);
  });

  it('deletes an owned tag exactly once', async () => {
    const { tags, owner, seed } = await setup();
    const [docs] = await seed(owner, ['docs']);

    expect(await tags.delete(docs.id, owner)).toBe(true);
    expect(await tags.delete(docs.id, owner)).toBe(false);
    expect(await tags.findOwned(docs.id, owner)).toBeNull();
  });

  describe('reorder', () => {
    it('moves a tag and renumbers the whole list contiguously', async () => {
      const { tags, owner, seed, inOrder } = await setup();
      const [, , third] = await seed(owner, ['a', 'b', 'c', 'd', 'e']);

      const moved = await tags.reorder(third.id, owner, 1);

      expect(moved).toMatchObject({ tagName: 'c', order: 1 });
      const ordered = await inOrder(owner);
      expect(ordered.map((tag) => tag.tagName)).toEqual(['c', 'a', 'b', 'd', 'e']);
      expect(ordered.map((tag) => tag.order)).toEqual([1, 2, 3, 4, 5]);
    });

    it('places a tag last when the position is past the end', async () => {
      const { tags, owner, seed, inOrder } = await setup();
      const [first] = await seed(owner, ['a', 'b', 'c', 'd', 'e']);

      const moved = await tags.reorder(first.id, owner, 99);

      expect(moved).toMatchObject({ tagName: 'a', order: 5 });
      expect((await inOrder(owner)).map((tag) => tag.tagName)).toEqual(['b', 'c', 'd', 'e', 'a']);
    });

    it('returns null for an unknown tag and leaves other owners untouched', async () => {
      const { tags, owner, other, seed } = await setup();
      const [, second] = await seed(owner, ['a', 'b']);
      const [theirs] = await seed(other, ['x', 'y']);
      const before = await tags.findOwned(theirs.id, other);

      expect(await tags.reorder('missing', owner, 1)).toBeNull();
      await tags.reorder(second.id, owner, 1);

      expect(await tags.findOwned(theirs.id, other)).toEqual(before);
    });
  });
});
