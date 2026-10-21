// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { describe, expect, it } from 'vitest';
import { migrationsFolder } from '../../api/db/migrate';

const journal = JSON.parse(
  readFileSync(join(migrationsFolder, 'meta', '_journal.json'), 'utf8'),
) as { entries: { tag: string }[] };

const migrationFile = (tag: string) => readFileSync(join(migrationsFolder, `${tag}.sql`), 'utf8');

const tags = journal.entries.map((entry) => entry.tag);
const renameMigrationIndex = tags.findIndex((tag) => tag.startsWith('0004_'));
const previousMigrations = tags.slice(0, renameMigrationIndex);
const renameMigration = tags[renameMigrationIndex];

async function createPreRenameDatabase() {
  const client = new PGlite();
  for (const tag of previousMigrations) {
    await client.exec(migrationFile(tag));
  }
  return client;
}

async function insertLegacyData(client: PGlite) {
  await client.exec(`
    INSERT INTO users (id, email, password_hash, role, theme, created_at)
    VALUES ('user-1', 'old@example.com', 'hash', 'user', 'light', now());

    INSERT INTO collection_items
      (id, owner_id, kind, title, tags, related_item_ids, position, command, created_at, updated_at)
    VALUES
      ('item-old', 'user-1', 'spell', 'Old command', '{}', '{}', 1, 'echo old', now(), now());

    INSERT INTO themes
      (id, name, label, colors, font_sizes, fonts, icon_assets, kind_colors, tag_color_palette, is_default, created_at, updated_at)
    VALUES
      (
        'theme-old', 'old', 'Old',
        '{}'::jsonb, '{}'::jsonb, '{}'::jsonb,
        '{"spell":{"path":"M0 0","viewBox":"0 0 24 24"},"copy":{"path":"M1 1","viewBox":"0 0 24 24"}}'::jsonb,
        '{"spell":"#123456","webLink":"#2563eb","markdown":"#b45309","file":"#0d9488"}'::jsonb,
        ARRAY['#123456'], false, now(), now()
      ),
      (
        'theme-both', 'both', 'Both',
        '{}'::jsonb, '{}'::jsonb, '{}'::jsonb,
        '{"spell":{"path":"M2 2","viewBox":"0 0 24 24"},"command":{"path":"M3 3","viewBox":"0 0 24 24"}}'::jsonb,
        '{"spell":"#111111","command":"#222222","webLink":"#2563eb","markdown":"#b45309","file":"#0d9488"}'::jsonb,
        ARRAY['#222222'], false, now(), now()
      ),
      (
        'theme-array', 'array', 'Array',
        '{}'::jsonb, '{}'::jsonb, '{}'::jsonb,
        '["spell","copy"]'::jsonb,
        '{"command":"#333333","webLink":"#2563eb","markdown":"#b45309","file":"#0d9488"}'::jsonb,
        ARRAY['#333333'], false, now(), now()
      ),
      (
        'theme-command', 'command', 'Command',
        '{}'::jsonb, '{}'::jsonb, '{}'::jsonb,
        '{"command":{"path":"M4 4","viewBox":"0 0 24 24"}}'::jsonb,
        '{"command":"#444444","webLink":"#2563eb","markdown":"#b45309","file":"#0d9488"}'::jsonb,
        ARRAY['#444444'], false, now(), now()
      );
  `);
}

describe('rename spell to command migration', () => {
  it('renames stored item kinds and theme keys without losing values', async () => {
    if (!renameMigration) throw new Error('The rename migration is missing');
    const client = await createPreRenameDatabase();
    try {
      await insertLegacyData(client);
      await client.exec(migrationFile(renameMigration));

      const items = await client.query<{ kind: string; command: string }>(
        `SELECT kind::text AS kind, command FROM collection_items WHERE id = 'item-old'`,
      );
      expect(items.rows).toEqual([{ kind: 'command', command: 'echo old' }]);

      const oldTheme = await client.query<{
        color: string;
        old_color: boolean;
        path: string;
        old_path: boolean;
      }>(`
        SELECT
          kind_colors ->> 'command' AS color,
          kind_colors ? 'spell' AS old_color,
          icon_assets -> 'command' ->> 'path' AS path,
          icon_assets ? 'spell' AS old_path
        FROM themes
        WHERE id = 'theme-old'
      `);
      expect(oldTheme.rows).toEqual([
        { color: '#123456', old_color: false, path: 'M0 0', old_path: false },
      ]);

      const bothTheme = await client.query<{ color: string; path: string }>(`
        SELECT kind_colors ->> 'command' AS color, icon_assets -> 'command' ->> 'path' AS path
        FROM themes
        WHERE id = 'theme-both'
      `);
      expect(bothTheme.rows).toEqual([{ color: '#222222', path: 'M3 3' }]);

      const arrayTheme = await client.query<{
        has_command: boolean;
        has_spell: boolean;
      }>(`
        SELECT
          icon_assets @> '["command"]'::jsonb AS has_command,
          icon_assets @> '["spell"]'::jsonb AS has_spell
        FROM themes
        WHERE id = 'theme-array'
      `);
      expect(arrayTheme.rows).toEqual([{ has_command: true, has_spell: false }]);

      const untouchedTheme = await client.query<{ color: string; path: string }>(`
        SELECT kind_colors ->> 'command' AS color, icon_assets -> 'command' ->> 'path' AS path
        FROM themes
        WHERE id = 'theme-command'
      `);
      expect(untouchedTheme.rows).toEqual([{ color: '#444444', path: 'M4 4' }]);
    } finally {
      await client.close();
    }
  });
});
