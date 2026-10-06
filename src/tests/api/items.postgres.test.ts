// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { CollectionItemInput, CollectionQuery } from '@conjuros/contracts';
import { collectionItems } from '../../api/db/schema';
import { CHECK_VIOLATION, FOREIGN_KEY_VIOLATION } from '../../api/db/sqlstate';
import { PostgresItemsRepository } from '../../api/repositories/items.repository';
import { PostgresUsersRepository } from '../../api/repositories/users.repository';
import { sqlStateOf, setupPgliteDatabase } from './pglite';

const database = setupPgliteDatabase();

const baseQuery: CollectionQuery = { limit: 25, skip: 0, sort: 'order', tagFilterMode: 'all' };

function spell(title: string, tags: string[] = []): CollectionItemInput {
  return { kind: 'spell', title, tags, relatedItemIds: [], command: `echo ${title}` };
}

async function setup() {
  const users = new PostgresUsersRepository(database.db);
  const items = new PostgresItemsRepository(database.db);
  const owner = (await users.create('owner@example.com', 'hash')).id;

  async function add(input: CollectionItemInput, ownerId = owner) {
    return items.create(ownerId, input, await items.nextOrder(ownerId));
  }
  async function seed(titles: string[]) {
    const created = [];
    for (const title of titles) created.push(await add(spell(title)));
    return created;
  }

  return { items, owner, add, seed };
}

describe('PostgresItemsRepository', () => {
  describe('list', () => {
    it('pages through items that share the same last-update time without repeats or gaps', async () => {
      const { items, owner, seed } = await setup();
      const created = await seed(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
      // A reorder stamps every row of the owner with one updated_at.
      await items.reorder(created[0].id, owner, 4);
      const all = await items.list(owner, { ...baseQuery, limit: 50 });
      expect(new Set(all.items.map((item) => item.updatedAt)).size).toBe(1);

      const seen: string[] = [];
      for (let skip = 0; skip < 7; skip += 2) {
        const page = await items.list(owner, { ...baseQuery, sort: 'updatedAt', limit: 2, skip });
        seen.push(...page.items.map((item) => item.id));
      }

      expect([...seen].sort()).toEqual(created.map((item) => item.id).sort());
    });

    it('keeps the total of all matches when the page is smaller than the result', async () => {
      const { items, owner, seed } = await setup();
      await seed(['a', 'b', 'c', 'd', 'e']);

      const page = await items.list(owner, { ...baseQuery, limit: 2, search: 'echo' });

      expect(page.items).toHaveLength(2);
      expect(page.total).toBe(5);
    });

    it('matches the wildcard characters of the search text literally inside tags', async () => {
      const { items, owner, add } = await setup();
      await add(spell('one', ['a_b', '100%']));
      await add(spell('two', ['axb', '1000']));

      const titles = async (search: string) =>
        (await items.list(owner, { ...baseQuery, search })).items.map((item) => item.title);

      expect(await titles('a_b')).toEqual(['one']);
      expect(await titles('100%')).toEqual(['one']);
    });

    it('filters on tags that contain array and SQL metacharacters', async () => {
      const { items, owner, add } = await setup();
      const awkward = ["x'), ('y", '{a,b}', 'has,comma', '"quoted"', 'back\\slash'];
      await add(spell('awkward', awkward));
      await add(spell('plain', ['plain']));

      const all = await items.list(owner, { ...baseQuery, tags: awkward, tagFilterMode: 'all' });
      const any = await items.list(owner, {
        ...baseQuery,
        tags: ['{a,b}', 'missing'],
        tagFilterMode: 'any',
      });

      expect(all.items.map((item) => item.title)).toEqual(['awkward']);
      expect(all.items[0].tags).toEqual(awkward);
      expect(any.items.map((item) => item.title)).toEqual(['awkward']);
    });

    it('treats the search text as data', async () => {
      const { items, owner, seed } = await setup();
      await seed(['a']);

      const result = await items.list(owner, {
        ...baseQuery,
        search: "'; DROP TABLE collection_items; --",
      });

      expect(result).toEqual({ items: [], total: 0 });
      expect((await items.list(owner, baseQuery)).total).toBe(1);
    });
  });

  describe('reorder', () => {
    it('stamps every item of the owner with the same new updatedAt', async () => {
      const { items, owner, seed } = await setup();
      const created = await seed(['a', 'b', 'c']);
      const before = new Set(created.map((item) => item.updatedAt));

      await items.reorder(created[2].id, owner, 1);

      const after = (await items.list(owner, baseQuery)).items;
      expect(new Set(after.map((item) => item.updatedAt)).size).toBe(1);
      expect(before.has(after[0].updatedAt)).toBe(false);
    });

    it('renumbers duplicate positions left behind by a deletion', async () => {
      const { items, owner, add, seed } = await setup();
      const [, second] = await seed(['a', 'b', 'c', 'd']);
      await items.delete(second.id, owner);
      await add(spell('e'));
      const positions = (await items.list(owner, baseQuery)).items.map((item) => item.order);
      expect(positions).toEqual([1, 3, 4, 4]);

      const last = (await items.list(owner, baseQuery)).items[3];
      await items.reorder(last.id, owner, 1);

      const renumbered = (await items.list(owner, baseQuery)).items;
      expect(renumbered.map((item) => item.order)).toEqual([1, 2, 3, 4]);
      expect(renumbered[0].id).toBe(last.id);
    });

    it('keeps positions contiguous and unique when several items are moved at the same time', async () => {
      const { items, owner, seed } = await setup();
      const created = await seed(['a', 'b', 'c', 'd', 'e', 'f']);

      await Promise.all([
        items.reorder(created[0].id, owner, 6),
        items.reorder(created[5].id, owner, 1),
        items.reorder(created[2].id, owner, 3),
        items.reorder(created[4].id, owner, 2),
      ]);

      const stored = (await items.list(owner, baseQuery)).items;
      expect(stored.map((item) => item.order)).toEqual([1, 2, 3, 4, 5, 6]);
      expect(new Set(stored.map((item) => item.id)).size).toBe(6);
    });
  });

  describe('integrity', () => {
    it('rejects an item for an owner without an account', async () => {
      const { items } = await setup();

      const state = await sqlStateOf(items.create('missing-owner', spell('a'), 1));

      expect(state).toBe(FOREIGN_KEY_VIOLATION);
    });

    it('rejects a replacement whose value fields do not match its kind', async () => {
      const { items, owner, seed } = await setup();
      const [created] = await seed(['a']);

      const state = await sqlStateOf(items.replace({ ...created, command: null }));

      expect(state).toBe(CHECK_VIOLATION);
      expect(await items.findOwned(created.id, owner)).toEqual(created);
    });

    it('does not replace an item on behalf of another owner', async () => {
      const { items, owner, seed } = await setup();
      const other = (
        await new PostgresUsersRepository(database.db).create('other@example.com', 'hash')
      ).id;
      const [created] = await seed(['a']);

      await items.replace({ ...created, ownerId: other, title: 'hijacked' });

      expect(await items.findOwned(created.id, owner)).toEqual(created);
    });

    it('stores an item without a description or filename as null values', async () => {
      const { owner, seed } = await setup();
      const [created] = await seed(['a']);

      const [row] = await database.db.select().from(collectionItems);

      expect(created).toMatchObject({
        description: null,
        url: null,
        content: null,
        filename: null,
      });
      expect(row).toMatchObject({
        ownerId: owner,
        description: null,
        url: null,
        content: null,
        filename: null,
      });
    });
  });

  describe('tag cascades', () => {
    it('touches only the items that carry the tag', async () => {
      const { items, owner, add } = await setup();
      const carrying = await add(spell('a', ['docs']));
      const bystander = await add(spell('b', ['keep']));

      await items.renameTagForOwnerItems(owner, 'docs', 'guides');
      await items.removeTagFromOwnerItems(owner, 'keep');

      const stored = await items.findOwned(carrying.id, owner);
      expect(stored?.tags).toEqual(['guides']);
      expect(stored?.updatedAt).not.toBe(carrying.updatedAt);
      expect((await items.findOwned(bystander.id, owner))?.tags).toEqual([]);
    });
  });
});
