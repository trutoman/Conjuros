import { asc, eq, sql } from 'drizzle-orm';
import type { Database } from './client';
import type { collectionItems, tagCategories, tags } from './schema';

type OrderedTable = typeof collectionItems | typeof tags | typeof tagCategories;

// Moves one row of an owner's list to `order` (clamped to the end), renumbers the whole list 1..n and
// bumps `updated_at` on every row. Call it inside a transaction; returns false when the owner has no such row.
export async function renumberOwnedRows(
  tx: Database,
  table: OrderedTable,
  ownerId: string,
  id: string,
  order: number,
): Promise<boolean> {
  // Lock first and read the order afterwards: a reorder that waited on the lock then sees the committed positions.
  await tx
    .select({ id: table.id })
    .from(table)
    .where(eq(table.ownerId, ownerId))
    .orderBy(asc(table.id))
    .for('update');
  const rows = await tx
    .select({ id: table.id })
    .from(table)
    .where(eq(table.ownerId, ownerId))
    .orderBy(asc(table.order), asc(table.id));

  const ids = rows.map((row) => row.id).filter((rowId) => rowId !== id);
  if (ids.length === rows.length) return false;
  ids.splice(Math.min(order - 1, ids.length), 0, id);

  const positions = sql.join(
    ids.map((rowId, index) => sql`(${rowId}::text, ${index + 1}::integer)`),
    sql`, `,
  );
  // The three ordered tables share these physical column names.
  await tx.execute(sql`
    UPDATE ${table} AS target
    SET position = ordering.position, updated_at = ${new Date().toISOString()}::timestamptz
    FROM (VALUES ${positions}) AS ordering(id, position)
    WHERE target.id = ordering.id AND target.owner_id = ${ownerId}
  `);
  return true;
}
