// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { describe, expect, it } from 'vitest';
import { migrationsFolder } from '../../api/db/migrate';
import { collectionItems, tagCategories, tags, themes, users } from '../../api/db/schema';
import { CHECK_VIOLATION, FOREIGN_KEY_VIOLATION, UNIQUE_VIOLATION } from '../../api/db/sqlstate';
import { buildSeedThemes } from '../../api/repositories/themeSeed';
import { sqlStateOf, setupPgliteDatabase } from './pglite';

const handle = setupPgliteDatabase();

const now = new Date('2026-01-01T00:00:00.000Z');

async function insertUser(id: string, email = `${id}@example.com`) {
  await handle.db.insert(users).values({ id, email, passwordHash: 'hash', createdAt: now });
  return id;
}

function itemRow(ownerId: string, overrides: Partial<typeof collectionItems.$inferInsert> = {}) {
  return {
    id: 'item-1',
    ownerId,
    kind: 'spell' as const,
    title: 'Title',
    command: 'echo hi',
    order: 1,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } satisfies typeof collectionItems.$inferInsert;
}

function themeRow(overrides: Partial<typeof themes.$inferInsert> = {}) {
  const [seed] = buildSeedThemes();
  return {
    ...seed,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } satisfies typeof themes.$inferInsert;
}

describe('migrations', () => {
  it('create the complete schema on an empty database', async () => {
    const result = await handle.db.execute<{ table_name: string }>(
      sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`,
    );

    expect(result.rows.map((row) => row.table_name)).toEqual([
      'collection_items',
      'tag_categories',
      'tags',
      'themes',
      'users',
    ]);
  });

  it('are not applied again when the database is up to date', async () => {
    const journal = JSON.parse(
      readFileSync(join(migrationsFolder, 'meta', '_journal.json'), 'utf8'),
    );
    await insertUser('user-a');

    await migrate(handle.db, { migrationsFolder });

    const applied = await handle.db.execute<{ total: number }>(
      sql`SELECT count(*)::int AS total FROM drizzle.__drizzle_migrations`,
    );
    expect(applied.rows[0].total).toBe(journal.entries.length);
    expect(await handle.db.select().from(users)).toHaveLength(1);
  });
});

describe('database integrity rules', () => {
  it('rejects a duplicate user email', async () => {
    await insertUser('user-a', 'same@example.com');

    const state = await sqlStateOf(
      handle.db
        .insert(users)
        .values({ id: 'user-b', email: 'same@example.com', passwordHash: 'hash', createdAt: now }),
    );

    expect(state).toBe(UNIQUE_VIOLATION);
  });

  it.each([
    ['item', () => handle.db.insert(collectionItems).values(itemRow('missing-user'))],
    [
      'tag',
      () =>
        handle.db.insert(tags).values({
          id: 'tag-1',
          ownerId: 'missing-user',
          tagName: 'docs',
          tagNameNormalized: 'docs',
          color: '#123ABC',
          order: 1,
          createdAt: now,
          updatedAt: now,
        }),
    ],
    [
      'tag category',
      () =>
        handle.db.insert(tagCategories).values({
          id: 'category-1',
          ownerId: 'missing-user',
          name: 'general',
          nameNormalized: 'general',
          order: 1,
          createdAt: now,
          updatedAt: now,
        }),
    ],
  ])('rejects a %s for an unknown owner', async (_label, insert) => {
    expect(await sqlStateOf(insert())).toBe(FOREIGN_KEY_VIOLATION);
  });

  it('deletes an owner together with the owner data', async () => {
    const ownerId = await insertUser('user-a');
    await handle.db.insert(collectionItems).values(itemRow(ownerId));

    await handle.db.delete(users);

    expect(await handle.db.select().from(collectionItems)).toHaveLength(0);
  });

  it.each([
    ['a spell without a command', { kind: 'spell' as const, command: null }],
    ['a spell that also holds a url', { kind: 'spell' as const, url: 'https://example.com' }],
    [
      'a web-link that also holds content',
      { kind: 'web-link' as const, command: null, url: 'https://example.com', content: '# Note' },
    ],
    ['a web-link without a url', { kind: 'web-link' as const, command: null, url: null }],
    [
      'a markdown item without content',
      { kind: 'markdown' as const, command: null, content: null },
    ],
    ['a file item that holds a command', { kind: 'file' as const, content: 'text' }],
  ])('rejects %s', async (_label, overrides) => {
    const ownerId = await insertUser('user-a');

    const state = await sqlStateOf(
      handle.db.insert(collectionItems).values(itemRow(ownerId, overrides)),
    );

    expect(state).toBe(CHECK_VIOLATION);
  });

  it('accepts each item kind with its own value fields', async () => {
    const ownerId = await insertUser('user-a');

    await handle.db.insert(collectionItems).values([
      itemRow(ownerId, { id: 'spell' }),
      itemRow(ownerId, {
        id: 'link',
        kind: 'web-link',
        command: null,
        url: 'https://example.com',
      }),
      itemRow(ownerId, {
        id: 'note',
        kind: 'markdown',
        command: null,
        content: '# Note',
        filename: 'note.md',
      }),
      itemRow(ownerId, { id: 'file', kind: 'file', command: null, content: 'text' }),
    ]);

    expect(await handle.db.select().from(collectionItems)).toHaveLength(4);
  });

  it.each([
    [
      'item kind',
      sql`INSERT INTO collection_items (id, owner_id, kind, title, position, created_at, updated_at) VALUES ('i', 'user-a', 'bogus', 't', 1, now(), now())`,
    ],
    [
      'user role',
      sql`INSERT INTO users (id, email, password_hash, role, created_at) VALUES ('u', 'u@example.com', 'h', 'owner', now())`,
    ],
    [
      'theme preference',
      sql`INSERT INTO users (id, email, password_hash, theme, created_at) VALUES ('u', 'u@example.com', 'h', 'sepia', now())`,
    ],
  ])('rejects an unknown %s', async (_label, statement) => {
    await insertUser('user-a');

    expect(await sqlStateOf(handle.db.execute(statement))).toBe('22P02');
  });

  it('rejects a duplicate category name for the same owner but allows it across owners', async () => {
    const first = await insertUser('user-a');
    const second = await insertUser('user-b');
    const category = (ownerId: string, id: string) => ({
      id,
      ownerId,
      name: 'work',
      nameNormalized: 'work',
      order: 1,
      createdAt: now,
      updatedAt: now,
    });
    await handle.db.insert(tagCategories).values(category(first, 'category-1'));

    const duplicate = await sqlStateOf(
      handle.db.insert(tagCategories).values(category(first, 'category-2')),
    );
    await handle.db.insert(tagCategories).values(category(second, 'category-3'));

    expect(duplicate).toBe(UNIQUE_VIOLATION);
  });

  it('allows the same tag name more than once for an owner', async () => {
    const ownerId = await insertUser('user-a');
    const tag = (id: string) => ({
      id,
      ownerId,
      tagName: 'docs',
      tagNameNormalized: 'docs',
      color: '#123ABC',
      order: 1,
      createdAt: now,
      updatedAt: now,
    });

    await handle.db.insert(tags).values([tag('tag-1'), tag('tag-2')]);

    expect(await handle.db.select().from(tags)).toHaveLength(2);
  });

  it('rejects a duplicate theme name', async () => {
    await handle.db.insert(themes).values(themeRow({ id: 'theme-1', isDefault: false }));

    const state = await sqlStateOf(
      handle.db.insert(themes).values(themeRow({ id: 'theme-2', isDefault: false })),
    );

    expect(state).toBe(UNIQUE_VIOLATION);
  });

  it('rejects a second default theme but allows any number of non-default themes', async () => {
    await handle.db
      .insert(themes)
      .values(themeRow({ id: 'theme-1', name: 'one', isDefault: true }));
    await handle.db
      .insert(themes)
      .values(themeRow({ id: 'theme-2', name: 'two', isDefault: false }));
    await handle.db
      .insert(themes)
      .values(themeRow({ id: 'theme-3', name: 'three', isDefault: false }));

    const state = await sqlStateOf(
      handle.db.insert(themes).values(themeRow({ id: 'theme-4', name: 'four', isDefault: true })),
    );

    expect(state).toBe(UNIQUE_VIOLATION);
  });
});
