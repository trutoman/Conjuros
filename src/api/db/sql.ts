import { sql, type SQL } from 'drizzle-orm';

// Builds a case-insensitive substring pattern for ILIKE; `\`, `%` and `_` in the term match literally.
export function containsPattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, '\\$&')}%`;
}

// A JS array inside `sql` expands to a tuple, which cannot be cast to `text[]`, so build it element by element.
export function textArray(values: readonly string[]): SQL {
  return sql`ARRAY[${sql.join(
    values.map((value) => sql`${value}`),
    sql`, `,
  )}]::text[]`;
}
