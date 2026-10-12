// @vitest-environment node
import { sql } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { setupPgliteDatabase } from './pglite';

const handle = setupPgliteDatabase();

describe('row level security', () => {
  it('is enabled on every application table', async () => {
    const result = await handle.db.execute<{ relname: string; relrowsecurity: boolean }>(
      sql`SELECT c.relname, c.relrowsecurity FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = 'public' AND c.relkind = 'r'`,
    );
    const tables = result.rows.map((row) => row.relname).sort();

    expect(tables).toEqual([
      'collection_items',
      'password_reset_tokens',
      'tag_categories',
      'tags',
      'themes',
      'users',
    ]);
    expect(result.rows.every((row) => row.relrowsecurity)).toBe(true);
  });
});
