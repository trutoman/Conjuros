// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const migrationUrl = new URL('../../../drizzle/0010_dear_king_bedlam.sql', import.meta.url);

describe('user preferences migration', () => {
  it('copies legacy light/dark selections before dropping users.theme', async () => {
    const database = new PGlite();
    try {
      await database.exec(`
        CREATE TYPE theme_preference AS ENUM ('light', 'dark');
        CREATE TABLE users (id text PRIMARY KEY, email text NOT NULL, theme theme_preference);
        CREATE TABLE themes (id text PRIMARY KEY, name text NOT NULL);
        INSERT INTO themes (id, name) VALUES ('light-id', 'light'), ('dark-id', 'dark');
        INSERT INTO users (id, email, theme) VALUES
          ('user-light', 'light@example.com', 'light'),
          ('user-dark', 'dark@example.com', 'dark'),
          ('user-none', 'none@example.com', NULL);
      `);

      const migration = await readFile(migrationUrl, 'utf8');
      for (const statement of migration.split('--> statement-breakpoint').map((part) => part.trim()).filter(Boolean)) {
        await database.exec(statement);
      }

      const preferences = await database.query<{ user_id: string; theme_id: string | null; tags_panel_expanded: boolean }>(
        'SELECT user_id, theme_id, tags_panel_expanded FROM user_preferences ORDER BY user_id',
      );
      expect(preferences.rows).toEqual([
        { user_id: 'user-dark', theme_id: 'dark-id', tags_panel_expanded: true },
        { user_id: 'user-light', theme_id: 'light-id', tags_panel_expanded: true },
        { user_id: 'user-none', theme_id: null, tags_panel_expanded: true },
      ]);
      const columns = await database.query<{ column_name: string }>(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'users'",
      );
      expect(columns.rows.map((row) => row.column_name)).not.toContain('theme');
    } finally {
      await database.close();
    }
  });
});
