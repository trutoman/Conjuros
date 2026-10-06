import { drizzle } from 'drizzle-orm/node-postgres';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { Pool } from 'pg';
import * as schema from './schema';

// Repositories depend on this driver-agnostic type so tests can inject PGlite.
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

export function createDatabase(url: string) {
  const pool = new Pool({ connectionString: url });
  // An idle client dropped by the server emits 'error' on the pool; unhandled it would crash the process.
  pool.on('error', (error) => console.error('PostgreSQL pool error:', error.message));
  const db = drizzle({ client: pool, schema, casing: 'snake_case' });
  return { db, pool };
}
