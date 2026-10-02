import { fileURLToPath } from 'node:url';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import type * as schema from './schema';

// Resolved from this module so it does not depend on the process working directory.
export const migrationsFolder = fileURLToPath(new URL('../../../drizzle', import.meta.url));

export async function runMigrations(db: NodePgDatabase<typeof schema>) {
  await migrate(db, { migrationsFolder });
}
