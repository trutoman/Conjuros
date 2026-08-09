import { randomUUID } from 'node:crypto';
import type { Collection, Db, Filter, Sort } from 'mongodb';
import type { Theme, ThemeQuery } from '@conjuros/contracts';

export type StoredTheme = Theme;

type StoredThemeDocument = StoredTheme & { _id?: unknown };

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
  private readonly themes = new Map<string, StoredThemeDocument>();

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

export class MongoThemesRepository implements ThemesRepository {
  private readonly themes: Collection<StoredThemeDocument>;

  constructor(database: Db) {
    this.themes = database.collection<StoredThemeDocument>('themes');
  }

  async list(query: ThemeQuery) {
    const filter: Filter<StoredTheme> = {};
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
        { label: { $regex: query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
      ];
    }
    const sort: Sort =
      query.sort === 'label'
        ? { label: 1 }
        : query.sort === 'updatedAt'
          ? { updatedAt: -1 }
          : { name: 1 };
    const [items, total] = await Promise.all([
      this.themes.find(filter).sort(sort).skip(query.skip).limit(query.limit).toArray(),
      this.themes.countDocuments(filter),
    ]);
    return { items, total };
  }

  async findAll() {
    return this.themes.find({}).toArray();
  }

  async findById(id: string) {
    return this.themes.findOne({ id });
  }

  async findByName(name: string) {
    return this.themes.findOne({ name });
  }

  async findDefault() {
    return this.themes.findOne({ isDefault: true });
  }

  async count() {
    return this.themes.countDocuments({});
  }

  async create(theme: StoredTheme) {
    const stored = { ...theme, id: theme.id || randomUUID() };
    await this.themes.insertOne(stored);
    return stored;
  }

  async replace(theme: StoredTheme) {
    await this.themes.replaceOne({ id: theme.id }, theme);
    return theme;
  }

  async delete(id: string) {
    return (await this.themes.deleteOne({ id })).deletedCount === 1;
  }

  async setDefault(id: string) {
    const target = await this.findById(id);
    if (!target) return null;
    const timestamp = new Date().toISOString();
    await this.themes.updateMany({ isDefault: true, id: { $ne: id } }, { $set: { isDefault: false, updatedAt: timestamp } });
    return this.themes.findOneAndUpdate(
      { id },
      { $set: { isDefault: true, updatedAt: timestamp } },
      { returnDocument: 'after' },
    );
  }
}