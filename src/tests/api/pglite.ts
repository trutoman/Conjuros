import { PGlite } from '@electric-sql/pglite';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { afterAll, beforeAll, beforeEach } from 'vitest';
import type { Database } from '../../api/db/client';
import { migrationsFolder } from '../../api/db/migrate';
import * as schema from '../../api/db/schema';
import { findSqlState } from '../../api/db/sqlstate';

// Test files using this helper must run in the node environment (`// @vitest-environment node`).
export async function createPgliteDatabase() {
  const client = new PGlite();
  const db = drizzle({ client, schema, casing: 'snake_case' });
  await migrate(db, { migrationsFolder });
  return { db, client };
}

export async function resetDatabase(db: Database) {
  await db.execute(
    sql`TRUNCATE TABLE users, collection_items, tags, tag_categories, themes CASCADE`,
  );
}

// One PGlite instance per test file, with every table emptied before each test.
export function setupPgliteDatabase() {
  let handle: Awaited<ReturnType<typeof createPgliteDatabase>>;

  beforeAll(async () => {
    handle = await createPgliteDatabase();
  });
  afterAll(async () => {
    await handle.client.close();
  });
  beforeEach(async () => {
    await resetDatabase(handle.db);
  });

  return {
    get db() {
      return handle.db;
    },
  };
}

// Resolves with the SQLSTATE of the error the operation fails with, or undefined when it succeeds.
export async function sqlStateOf(operation: PromiseLike<unknown>) {
  try {
    await operation;
  } catch (error) {
    return findSqlState(error);
  }
  return undefined;
}
