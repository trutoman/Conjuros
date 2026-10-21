// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { CollectionItemInput, CollectionQuery } from '@conjuros/contracts';
import {
  InMemoryItemsRepository,
  PostgresItemsRepository,
} from '../../api/repositories/items.repository';
import {
  InMemoryUsersRepository,
  PostgresUsersRepository,
} from '../../api/repositories/users.repository';
import { setupPgliteDatabase } from './pglite';

const database = setupPgliteDatabase();

const implementations = [
  [
    'in-memory',
    () => ({ users: new InMemoryUsersRepository(), items: new InMemoryItemsRepository() }),
  ],
  [
    'postgres',
    () => ({
      users: new PostgresUsersRepository(database.db),
      items: new PostgresItemsRepository(database.db),
    }),
  ],
] as const;

const baseQuery: CollectionQuery = { limit: 25, skip: 0, sort: 'order', tagFilterMode: 'all' };

function command(
  title: string,
  overrides: Partial<Extract<CollectionItemInput, { kind: 'command' }>> = {},
): CollectionItemInput {
  return {
    kind: 'command',
    title,
    tags: [],
    relatedItemIds: [],
    command: `echo ${title}`,
    ...overrides,
  };
}

function link(
  title: string,
  overrides: Partial<Extract<CollectionItemInput, { kind: 'web-link' }>> = {},
): CollectionItemInput {
  return {
    kind: 'web-link',
    title,
    tags: [],
    relatedItemIds: [],
    url: `https://example.com/${title}`,
    ...overrides,
  };
}

function note(
  title: string,
  overrides: Partial<Extract<CollectionItemInput, { kind: 'markdown' }>> = {},
): CollectionItemInput {
  return {
    kind: 'markdown',
    title,
    tags: [],
    relatedItemIds: [],
    content: `# ${title}`,
    filename: `${title}.md`,
    ...overrides,
  };
}

function file(
  title: string,
  overrides: Partial<Extract<CollectionItemInput, { kind: 'file' }>> = {},
): CollectionItemInput {
  return {
    kind: 'file',
    title,
    tags: [],
    relatedItemIds: [],
    content: `body of ${title}`,
    filename: `${title}.txt`,
    ...overrides,
  };
}

describe.each(implementations)('%s items repository', (_name, createRepositories) => {
  async function setup() {
    const { users, items } = createRepositories();
    const owner = (await users.create('owner@example.com', 'hash')).id;
    const other = (await users.create('other@example.com', 'hash')).id;

    async function add(ownerId: string, input: CollectionItemInput) {
      return items.create(ownerId, input, await items.nextOrder(ownerId));
    }
    async function seed(ownerId: string, inputs: CollectionItemInput[]) {
      const created = [];
      for (const input of inputs) created.push(await add(ownerId, input));
      return created;
    }
    const titles = async (ownerId: string, query: Partial<CollectionQuery> = {}) =>
      (await items.list(ownerId, { ...baseQuery, ...query })).items.map((item) => item.title);
    const inOrder = async (ownerId: string) => (await items.list(ownerId, baseQuery)).items;

    return { items, owner, other, add, seed, titles, inOrder };
  }

  describe('storage', () => {
    it('stores each kind with only its own value fields', async () => {
      const { add, owner } = await setup();

      const created = [
        await add(owner, command('cast', { description: 'A command', tags: ['magic'] })),
        await add(owner, link('site')),
        await add(owner, note('notes')),
        await add(owner, file('data')),
      ];

      expect(
        created.map(({ kind, command, url, content, filename }) => ({
          kind,
          command,
          url,
          content,
          filename,
        })),
      ).toEqual([
        { kind: 'command', command: 'echo cast', url: null, content: null, filename: null },
        {
          kind: 'web-link',
          command: null,
          url: 'https://example.com/site',
          content: null,
          filename: null,
        },
        { kind: 'markdown', command: null, url: null, content: '# notes', filename: 'notes.md' },
        { kind: 'file', command: null, url: null, content: 'body of data', filename: 'data.txt' },
      ]);
      expect(created[0]).toMatchObject({
        description: 'A command',
        tags: ['magic'],
        order: 1,
        ownerId: owner,
      });
      expect(created[1].description).toBeNull();
    });

    it('returns a stored item unchanged when it is read back', async () => {
      const { add, items, owner } = await setup();
      const created = await add(
        owner,
        command('cast', { tags: ['a', 'b'], relatedItemIds: ['x', 'y'] }),
      );

      expect(await items.findOwned(created.id, owner)).toEqual(created);
      expect(created.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(created.updatedAt).toBe(created.createdAt);
    });

    it('numbers items per owner', async () => {
      const { items, owner, other, seed } = await setup();

      expect(await items.nextOrder(owner)).toBe(1);
      await seed(owner, [command('a'), command('b')]);
      await seed(other, [command('c')]);

      expect(await items.nextOrder(owner)).toBe(3);
      expect(await items.nextOrder(other)).toBe(2);
    });

    it('replaces the stored fields of an item, including its kind', async () => {
      const { items, owner, seed } = await setup();
      const [created] = await seed(owner, [command('cast')]);
      const edited = {
        ...created,
        kind: 'web-link' as const,
        title: 'Renamed',
        description: 'Now a link',
        tags: ['linked'],
        relatedItemIds: ['other'],
        command: null,
        url: 'https://example.com/new',
        updatedAt: '2026-02-03T04:05:06.007Z',
      };

      expect(await items.replace(edited)).toEqual(edited);
      expect(await items.findOwned(created.id, owner)).toEqual(edited);
    });

    it('deletes an owned item exactly once', async () => {
      const { items, owner, seed } = await setup();
      const [created] = await seed(owner, [command('cast')]);

      expect(await items.delete(created.id, owner)).toBe(true);
      expect(await items.delete(created.id, owner)).toBe(false);
      expect(await items.findOwned(created.id, owner)).toBeNull();
    });

    it('finds owned items by ids and by tags', async () => {
      const { items, owner, other, seed } = await setup();
      const [first, second] = await seed(owner, [
        command('a', { tags: ['x', 'y'] }),
        command('b', { tags: ['x'] }),
      ]);
      const [theirs] = await seed(other, [command('c', { tags: ['x', 'y'] })]);

      const byIds = await items.findOwnedByIds([first.id, second.id, theirs.id, 'missing'], owner);
      const byTags = await items.findOwnedByTags(owner, ['x', 'y']);

      expect(byIds.map((item) => item.id).sort()).toEqual([first.id, second.id].sort());
      expect(byTags.map((item) => item.id)).toEqual([first.id]);
      expect(await items.findOwnedByIds([], owner)).toEqual([]);
      expect(await items.findOwnedByTags(owner, [])).toEqual([]);
    });
  });

  describe('ownership isolation', () => {
    it('never returns, lists or changes the items of another owner', async () => {
      const { items, owner, other, seed } = await setup();
      const [mine] = await seed(owner, [command('mine', { tags: ['x'] })]);
      await seed(other, [command('theirs', { tags: ['x'] })]);

      expect(await items.findOwned(mine.id, other)).toBeNull();
      expect(await items.findOwnedByIds([mine.id], other)).toEqual([]);
      expect((await items.findOwnedByTags(other, ['x'])).map((item) => item.title)).toEqual([
        'theirs',
      ]);
      expect((await items.list(other, baseQuery)).items.map((item) => item.title)).toEqual([
        'theirs',
      ]);
      expect(await items.reorder(mine.id, other, 1)).toBeNull();
      expect(await items.delete(mine.id, other)).toBe(false);
      expect(await items.findOwned(mine.id, owner)).toEqual(mine);
    });
  });

  describe('list', () => {
    it('filters by kind', async () => {
      const { owner, seed, titles } = await setup();
      await seed(owner, [command('cast'), link('site'), note('notes'), file('data')]);

      expect(await titles(owner, { kind: 'web-link' })).toEqual(['site']);
      expect(await titles(owner, { kind: 'file' })).toEqual(['data']);
    });

    it('filters by tags requiring all of them or any of them', async () => {
      const { owner, seed, titles } = await setup();
      await seed(owner, [
        command('both', { tags: ['a', 'b'] }),
        command('only-a', { tags: ['a'] }),
        command('only-b', { tags: ['b'] }),
        command('none', { tags: ['c'] }),
      ]);

      expect(await titles(owner, { tags: ['a', 'b'], tagFilterMode: 'all' })).toEqual(['both']);
      expect(await titles(owner, { tags: ['a', 'b'], tagFilterMode: 'any' })).toEqual([
        'both',
        'only-a',
        'only-b',
      ]);
      expect(await titles(owner, { tags: [], tagFilterMode: 'all' })).toHaveLength(4);
    });

    it('searches title, description, command, url, content and tags case-insensitively', async () => {
      const { owner, seed, titles } = await setup();
      await seed(owner, [
        command('one', { command: 'Docker Compose Up' }),
        link('two', { url: 'https://example.com/Registry' }),
        note('three', { content: 'Kubernetes notes' }),
        command('four', { description: 'Terraform plan' }),
        command('Five Title'),
        command('six', { tags: ['ansible'] }),
        command('seven'),
      ]);

      expect(await titles(owner, { search: 'compose' })).toEqual(['one']);
      expect(await titles(owner, { search: 'REGISTRY' })).toEqual(['two']);
      expect(await titles(owner, { search: 'kubernetes' })).toEqual(['three']);
      expect(await titles(owner, { search: 'terraform' })).toEqual(['four']);
      expect(await titles(owner, { search: 'five title' })).toEqual(['Five Title']);
      expect(await titles(owner, { search: 'ANSIB' })).toEqual(['six']);
    });

    it('matches the wildcard characters of the search text literally', async () => {
      const { owner, seed, titles } = await setup();
      await seed(owner, [
        command('percent', { description: '100% done' }),
        command('plain', { description: '1000 items' }),
        command('underscore', { description: 'file_name' }),
        command('other', { description: 'fileXname' }),
        command('slash', { description: 'C:\\temp\\dir' }),
      ]);

      expect(await titles(owner, { search: '100%' })).toEqual(['percent']);
      expect(await titles(owner, { search: 'file_name' })).toEqual(['underscore']);
      expect(await titles(owner, { search: 'C:\\temp' })).toEqual(['slash']);
      expect(await titles(owner, { search: '%' })).toEqual(['percent']);
    });

    it('combines the kind, tag and search filters', async () => {
      const { owner, seed, titles } = await setup();
      await seed(owner, [
        command('match', { tags: ['a'], command: 'deploy now' }),
        command('wrong-search', { tags: ['a'], command: 'other' }),
        link('wrong-kind', { tags: ['a'], url: 'https://example.com/deploy' }),
        command('wrong-tag', { tags: ['b'], command: 'deploy now' }),
      ]);

      expect(await titles(owner, { kind: 'command', tags: ['a'], search: 'deploy' })).toEqual([
        'match',
      ]);
    });

    it('sorts by order, title and last update (newest first)', async () => {
      const { items, owner, seed } = await setup();
      const [charlie, alpha, bravo] = await seed(owner, [
        command('charlie'),
        command('alpha'),
        command('bravo'),
      ]);
      await items.replace({ ...charlie, updatedAt: '2026-01-01T00:00:00.000Z' });
      await items.replace({ ...alpha, updatedAt: '2026-01-03T00:00:00.000Z' });
      await items.replace({ ...bravo, updatedAt: '2026-01-02T00:00:00.000Z' });
      const titles = async (sort: CollectionQuery['sort']) =>
        (await items.list(owner, { ...baseQuery, sort })).items.map((item) => item.title);

      expect(await titles('order')).toEqual(['charlie', 'alpha', 'bravo']);
      expect(await titles('title')).toEqual(['alpha', 'bravo', 'charlie']);
      expect(await titles('updatedAt')).toEqual(['alpha', 'bravo', 'charlie']);
    });

    it('paginates with limit and skip and reports the total of all matches', async () => {
      const { items, owner, seed } = await setup();
      await seed(
        owner,
        ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((title) => command(title)),
      );

      const page = await items.list(owner, { ...baseQuery, limit: 3, skip: 3 });

      expect(page.items.map((item) => item.title)).toEqual(['d', 'e', 'f']);
      expect(page.total).toBe(7);
      expect((await items.list(owner, { ...baseQuery, limit: 3, skip: 9 })).items).toEqual([]);
    });
  });

  describe('reorder', () => {
    it('moves an item and renumbers the whole list contiguously', async () => {
      const { items, owner, seed, inOrder } = await setup();
      const [, , third] = await seed(
        owner,
        ['a', 'b', 'c', 'd', 'e'].map((title) => command(title)),
      );

      const moved = await items.reorder(third.id, owner, 1);

      expect(moved).toMatchObject({ title: 'c', order: 1 });
      const ordered = await inOrder(owner);
      expect(ordered.map((item) => item.title)).toEqual(['c', 'a', 'b', 'd', 'e']);
      expect(ordered.map((item) => item.order)).toEqual([1, 2, 3, 4, 5]);
    });

    it('places an item last when the position is past the end', async () => {
      const { items, owner, seed, inOrder } = await setup();
      const [first] = await seed(
        owner,
        ['a', 'b', 'c', 'd', 'e'].map((title) => command(title)),
      );

      const moved = await items.reorder(first.id, owner, 99);

      expect(moved).toMatchObject({ title: 'a', order: 5 });
      expect((await inOrder(owner)).map((item) => item.title)).toEqual(['b', 'c', 'd', 'e', 'a']);
    });

    it('moves an item down and keeps the other items in their relative order', async () => {
      const { items, owner, seed, inOrder } = await setup();
      const [first] = await seed(
        owner,
        ['a', 'b', 'c', 'd'].map((title) => command(title)),
      );

      await items.reorder(first.id, owner, 3);

      expect((await inOrder(owner)).map((item) => item.title)).toEqual(['b', 'c', 'a', 'd']);
    });

    it('returns null for an unknown item and leaves other owners untouched', async () => {
      const { items, owner, other, seed } = await setup();
      const [, second] = await seed(owner, [command('a'), command('b')]);
      const [theirs] = await seed(other, [command('x'), command('y')]);
      const before = await items.findOwned(theirs.id, other);

      expect(await items.reorder('missing', owner, 1)).toBeNull();
      await items.reorder(second.id, owner, 1);

      expect(await items.findOwned(theirs.id, other)).toEqual(before);
    });
  });

  describe('tag cascades', () => {
    it('removes a tag from every item of the owner only', async () => {
      const { items, owner, other, seed } = await setup();
      const [first, second, third] = await seed(owner, [
        command('a', { tags: ['docs', 'keep'] }),
        command('b', { tags: ['docs'] }),
        command('c', { tags: ['keep'] }),
      ]);
      const [theirs] = await seed(other, [command('d', { tags: ['docs'] })]);

      const updated = await items.removeTagFromOwnerItems(owner, 'docs');

      expect(updated).toBe(2);
      expect((await items.findOwned(first.id, owner))?.tags).toEqual(['keep']);
      expect((await items.findOwned(second.id, owner))?.tags).toEqual([]);
      expect(await items.findOwned(third.id, owner)).toEqual(third);
      expect(await items.findOwned(theirs.id, other)).toEqual(theirs);
    });

    it('returns zero when no item carries the tag', async () => {
      const { items, owner, seed } = await setup();
      await seed(owner, [command('a', { tags: ['keep'] })]);

      expect(await items.removeTagFromOwnerItems(owner, 'docs')).toBe(0);
    });

    it('renames a tag on every item of the owner only', async () => {
      const { items, owner, other, seed } = await setup();
      const [first, second] = await seed(owner, [
        command('a', { tags: ['old', 'keep'] }),
        command('b', { tags: ['other'] }),
      ]);
      const [theirs] = await seed(other, [command('c', { tags: ['old'] })]);

      const updated = await items.renameTagForOwnerItems(owner, 'old', 'new');

      expect(updated).toBe(1);
      expect((await items.findOwned(first.id, owner))?.tags).toEqual(['new', 'keep']);
      expect(await items.findOwned(second.id, owner)).toEqual(second);
      expect(await items.findOwned(theirs.id, other)).toEqual(theirs);
    });

    it('does not leave the same tag twice on an item when renaming onto an existing tag', async () => {
      const { items, owner, seed } = await setup();
      const [first, second] = await seed(owner, [
        command('a', { tags: ['a', 'b'] }),
        command('b', { tags: ['b', 'x', 'a'] }),
      ]);

      const updated = await items.renameTagForOwnerItems(owner, 'a', 'b');

      expect(updated).toBe(2);
      expect((await items.findOwned(first.id, owner))?.tags).toEqual(['b']);
      expect((await items.findOwned(second.id, owner))?.tags).toEqual(['b', 'x']);
    });

    it('does nothing when the new name equals the old one', async () => {
      const { items, owner, seed } = await setup();
      const [first] = await seed(owner, [command('a', { tags: ['same'] })]);

      expect(await items.renameTagForOwnerItems(owner, 'same', 'same')).toBe(0);
      expect(await items.findOwned(first.id, owner)).toEqual(first);
    });
  });
});
