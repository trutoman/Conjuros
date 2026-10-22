// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { describe, expect, it } from 'vitest';
import { migrationsFolder } from '../../api/db/migrate';

const journal = JSON.parse(
  readFileSync(join(migrationsFolder, 'meta', '_journal.json'), 'utf8'),
) as { entries: { tag: string }[] };

const tags = journal.entries.map((entry) => entry.tag);
const attachmentEnumIndex = tags.findIndex((tag) => tag.startsWith('0005_'));
const attachmentStorageIndex = tags.findIndex((tag) => tag.startsWith('0006_'));
const previousMigrations = tags.slice(0, attachmentEnumIndex);
const attachmentEnumMigration = tags[attachmentEnumIndex];
const attachmentStorageMigration = tags[attachmentStorageIndex];

const migrationFile = (tag: string) => readFileSync(join(migrationsFolder, `${tag}.sql`), 'utf8');

describe('attachment item migration', () => {
  it('adds the attachment kind, storage path, and theme color without changing existing rows', async () => {
    if (!attachmentEnumMigration || !attachmentStorageMigration) {
      throw new Error('Attachment migrations are missing');
    }
    const client = new PGlite();
    try {
      for (const tag of previousMigrations) {
        await client.exec(migrationFile(tag));
      }

      await client.exec(`
        INSERT INTO users (id, email, password_hash, role, theme, created_at)
        VALUES ('user-1', 'owner@example.com', 'hash', 'user', 'light', now());

        INSERT INTO collection_items
          (id, owner_id, kind, title, tags, related_item_ids, position, command, created_at, updated_at)
        VALUES
          ('item-1', 'user-1', 'command', 'Existing', '{}', '{}', 1, 'echo old', now(), now());

        INSERT INTO themes
          (id, name, label, colors, font_sizes, fonts, icon_assets, kind_colors, tag_color_palette, is_default, created_at, updated_at)
        VALUES
          (
            'theme-old', 'old', 'Old',
            '{}'::jsonb, '{}'::jsonb, '{}'::jsonb,
            '{"command":{"path":"M0 0","viewBox":"0 0 24 24"}}'::jsonb,
            '{"command":"#7c3aed","webLink":"#2563eb","markdown":"#b45309","file":"#0d9488"}'::jsonb,
            ARRAY['#123456'], false, now(), now()
          );
      `);

      await client.exec(migrationFile(attachmentEnumMigration));
      await client.exec(migrationFile(attachmentStorageMigration));

      const kinds = await client.query<{ kind: string }>(
        `SELECT unnest(enum_range(NULL::item_kind)) AS kind`,
      );
      expect(kinds.rows.map((row) => row.kind)).toEqual([
        'command',
        'web-link',
        'markdown',
        'file',
        'attachment',
      ]);

      const column = await client.query<{ total: number }>(`
        SELECT count(*)::int AS total
        FROM information_schema.columns
        WHERE table_name = 'collection_items' AND column_name = 'storage_path'
      `);
      expect(column.rows[0].total).toBe(1);

      await client.exec(`
        INSERT INTO collection_items
          (id, owner_id, kind, title, tags, related_item_ids, position, filename, created_at, updated_at)
        VALUES
          ('attachment-1', 'user-1', 'attachment', 'Report', '{}', '{}', 2, 'report.pdf', now(), now());
      `);

      const attachments = await client.query<{
        kind: string;
        filename: string;
        storage_path: string | null;
      }>(`
        SELECT kind::text AS kind, filename, storage_path
        FROM collection_items
        WHERE id = 'attachment-1'
      `);
      expect(attachments.rows).toEqual([
        { kind: 'attachment', filename: 'report.pdf', storage_path: null },
      ]);

      const existing = await client.query<{ kind: string; command: string }>(
        `SELECT kind::text AS kind, command FROM collection_items WHERE id = 'item-1'`,
      );
      expect(existing.rows).toEqual([{ kind: 'command', command: 'echo old' }]);

      const theme = await client.query<{ color: string }>(`
        SELECT kind_colors ->> 'attachment' AS color FROM themes WHERE id = 'theme-old'
      `);
      expect(theme.rows).toEqual([{ color: '#be123c' }]);
    } finally {
      await client.close();
    }
  });
});
