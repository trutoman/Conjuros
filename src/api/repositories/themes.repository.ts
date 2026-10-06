import { randomUUID } from 'node:crypto';
import { and, asc, count, desc, eq, ilike, ne, or, sql } from 'drizzle-orm';
import type { Theme, ThemeQuery } from '@conjuros/contracts';
import type { Database } from '../db/client';
import { themes } from '../db/schema';
import { containsPattern } from '../db/sql';

export type StoredTheme = Theme;

export interface ThemesRepository {
  list(query: ThemeQuery): Promise<{ items: StoredTheme[]; total: number }>;
  findAll(): Promise<StoredTheme[]>;
  findById(id: string): Promise<StoredTheme | null>;
  findByName(name: string): Promise<StoredTheme | null>;
  findDefault(): Promise<StoredTheme | null>;
  count(): Promise<number>;
  create(theme: StoredTheme): Promise<StoredTheme>;
  replace(theme: StoredTheme): Promise<StoredTheme>;
  delete(id: string): Promise<boolean>;
  setDefault(id: string): Promise<StoredTheme | null>;
}

function matchesQuery(theme: StoredTheme, query: ThemeQuery): boolean {
  if (!query.search) return true;
  const value = query.search.toLowerCase();
  return `${theme.name} ${theme.label}`.toLowerCase().includes(value);
}

function compareThemes(left: StoredTheme, right: StoredTheme, sort: ThemeQuery['sort']) {
  if (sort === 'label') return left.label.localeCompare(right.label);
  if (sort === 'updatedAt') return right.updatedAt.localeCompare(left.updatedAt);
  return left.name.localeCompare(right.name);
}

export class InMemoryThemesRepository implements ThemesRepository {
  private readonly themes = new Map<string, StoredTheme>();

  async list(query: ThemeQuery) {
    const matching = [...this.themes.values()]
      .filter((theme) => matchesQuery(theme, query))
      .sort((left, right) => compareThemes(left, right, query.sort));
    return { items: matching.slice(query.skip, query.skip + query.limit), total: matching.length };
  }

  async findAll() {
    return [...this.themes.values()];
  }

  async findById(id: string) {
    return this.themes.get(id) ?? null;
  }

  async findByName(name: string) {
    return [...this.themes.values()].find((theme) => theme.name === name) ?? null;
  }

  async findDefault() {
    return [...this.themes.values()].find((theme) => theme.isDefault) ?? null;
  }

  async count() {
    return this.themes.size;
  }

  async create(theme: StoredTheme) {
    const stored = { ...theme, id: theme.id || randomUUID() };
    this.themes.set(stored.id, stored);
    return stored;
  }

  async replace(theme: StoredTheme) {
    this.themes.set(theme.id, theme);
    return theme;
  }

  async delete(id: string) {
    return this.themes.delete(id);
  }

  async setDefault(id: string) {
    const target = this.themes.get(id);
    if (!target) return null;
    for (const [key, theme] of this.themes.entries()) {
      if (theme.isDefault && key !== id) {
        this.themes.set(key, { ...theme, isDefault: false, updatedAt: new Date().toISOString() });
      }
    }
    const updated = { ...target, isDefault: true, updatedAt: new Date().toISOString() };
    this.themes.set(id, updated);
    return updated;
  }
}

function toStoredTheme(row: typeof themes.$inferSelect): StoredTheme {
  return {
    id: row.id,
    name: row.name,
    label: row.label,
    colors: row.colors,
    fonts: row.fonts,
    fontSizes: row.fontSizes,
    iconAssets: row.iconAssets,
    kindColors: row.kindColors,
    tagColorPalette: row.tagColorPalette,
    isDefault: row.isDefault,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toThemeColumns(theme: StoredTheme) {
  return {
    name: theme.name,
    label: theme.label,
    colors: theme.colors,
    fonts: theme.fonts,
    fontSizes: theme.fontSizes,
    iconAssets: theme.iconAssets,
    kindColors: theme.kindColors,
    tagColorPalette: theme.tagColorPalette,
    isDefault: theme.isDefault,
    createdAt: new Date(theme.createdAt),
    updatedAt: new Date(theme.updatedAt),
  };
}

export class PostgresThemesRepository implements ThemesRepository {
  constructor(private readonly db: Database) {}

  async list(query: ThemeQuery) {
    const pattern = query.search ? containsPattern(query.search) : undefined;
    const where = pattern
      ? or(ilike(themes.name, pattern), ilike(themes.label, pattern))
      : undefined;
    const sort =
      query.sort === 'label'
        ? asc(themes.label)
        : query.sort === 'updatedAt'
          ? desc(themes.updatedAt)
          : asc(themes.name);
    const [rows, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(themes)
        .where(where)
        .orderBy(sort, asc(themes.id))
        .limit(query.limit)
        .offset(query.skip),
      this.db.select({ total: count() }).from(themes).where(where),
    ]);
    return { items: rows.map(toStoredTheme), total };
  }

  async findAll() {
    const rows = await this.db.select().from(themes).orderBy(asc(themes.createdAt), asc(themes.id));
    return rows.map(toStoredTheme);
  }

  async findById(id: string) {
    const [row] = await this.db.select().from(themes).where(eq(themes.id, id));
    return row ? toStoredTheme(row) : null;
  }

  async findByName(name: string) {
    const [row] = await this.db.select().from(themes).where(eq(themes.name, name));
    return row ? toStoredTheme(row) : null;
  }

  async findDefault() {
    const [row] = await this.db.select().from(themes).where(eq(themes.isDefault, true));
    return row ? toStoredTheme(row) : null;
  }

  async count() {
    const [{ total }] = await this.db.select({ total: count() }).from(themes);
    return total;
  }

  async create(theme: StoredTheme) {
    const stored = { ...theme, id: theme.id || randomUUID() };
    await this.db.insert(themes).values({ id: stored.id, ...toThemeColumns(stored) });
    return stored;
  }

  async replace(theme: StoredTheme) {
    await this.db.update(themes).set(toThemeColumns(theme)).where(eq(themes.id, theme.id));
    return theme;
  }

  async delete(id: string) {
    const deleted = await this.db
      .delete(themes)
      .where(eq(themes.id, id))
      .returning({ id: themes.id });
    return deleted.length === 1;
  }

  async setDefault(id: string) {
    // Demote before promoting: the partial unique index allows only one default row at a time.
    return this.db.transaction(async (tx) => {
      // Serializes concurrent activations so the later one demotes the earlier one instead of hitting the index.
      await tx.execute(sql`LOCK TABLE ${themes} IN SHARE ROW EXCLUSIVE MODE`);
      const [target] = await tx.select({ id: themes.id }).from(themes).where(eq(themes.id, id));
      if (!target) return null;
      const updatedAt = new Date();
      await tx
        .update(themes)
        .set({ isDefault: false, updatedAt })
        .where(and(eq(themes.isDefault, true), ne(themes.id, id)));
      const [row] = await tx
        .update(themes)
        .set({ isDefault: true, updatedAt })
        .where(eq(themes.id, id))
        .returning();
      return toStoredTheme(row);
    });
  }
}
