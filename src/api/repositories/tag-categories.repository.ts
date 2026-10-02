import { randomUUID } from 'node:crypto';
import { and, arrayContains, asc, count, desc, eq, ilike, or, sql } from 'drizzle-orm';
import {
  normalizeTagCategoryName,
  type TagCategoryInput,
  type TagCategoryQuery,
} from '@conjuros/contracts';
import type { Database } from '../db/client';
import { renumberOwnedRows } from '../db/reorder';
import { tagCategories } from '../db/schema';
import { containsPattern, textArray } from '../db/sql';
import { AppError } from '../errors';

export interface StoredTagCategory {
  id: string;
  ownerId: string;
  name: string;
  nameNormalized: string;
  description: string;
  tagIds: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

function hydrateCategory(record: StoredTagCategory): StoredTagCategory {
  const normalized = normalizeTagCategoryName(record.name);
  if (record.name !== normalized || record.nameNormalized !== normalized) {
    return { ...record, name: normalized, nameNormalized: normalized };
  }
  return record;
}

export interface TagCategoriesRepository {
  list(
    ownerId: string,
    query: TagCategoryQuery,
  ): Promise<{ items: StoredTagCategory[]; total: number }>;
  findAllOwned(ownerId: string): Promise<StoredTagCategory[]>;
  findOwned(id: string, ownerId: string): Promise<StoredTagCategory | null>;
  findOwnedByNormalizedName(
    ownerId: string,
    nameNormalized: string,
  ): Promise<StoredTagCategory | null>;
  findOwnedByMemberTag(ownerId: string, tagId: string): Promise<StoredTagCategory | null>;
  nextOrder(ownerId: string): Promise<number>;
  create(ownerId: string, input: TagCategoryInput, order: number): Promise<StoredTagCategory>;
  replace(category: StoredTagCategory): Promise<StoredTagCategory>;
  addMembers(
    ownerId: string,
    categoryId: string,
    tagIds: string[],
  ): Promise<StoredTagCategory | null>;
  removeMember(
    ownerId: string,
    categoryId: string,
    tagId: string,
  ): Promise<StoredTagCategory | null>;
  delete(id: string, ownerId: string): Promise<boolean>;
  reorder(id: string, ownerId: string, order: number): Promise<StoredTagCategory | null>;
}

function compareCategories(
  left: StoredTagCategory,
  right: StoredTagCategory,
  sort: TagCategoryQuery['sort'],
) {
  if (sort === 'name') return left.name.localeCompare(right.name);
  if (sort === 'updatedAt') return right.updatedAt.localeCompare(left.updatedAt);
  return left.order - right.order;
}

function matchesQuery(category: StoredTagCategory, query: TagCategoryQuery): boolean {
  if (!query.search) return true;
  const value = query.search.toLowerCase();
  return [category.name, category.description].join(' ').toLowerCase().includes(value);
}

export class InMemoryTagCategoriesRepository implements TagCategoriesRepository {
  private readonly categories = new Map<string, StoredTagCategory>();

  private persistHydrated(record: StoredTagCategory): StoredTagCategory {
    const hydrated = hydrateCategory(record);
    if (hydrated.name !== record.name || hydrated.nameNormalized !== record.nameNormalized) {
      this.categories.set(hydrated.id, hydrated);
    }
    return hydrated;
  }

  async list(ownerId: string, query: TagCategoryQuery) {
    const matching = [...this.categories.values()]
      .map((category) => this.persistHydrated(category))
      .filter((category) => category.ownerId === ownerId && matchesQuery(category, query))
      .sort((left, right) => compareCategories(left, right, query.sort));
    return { items: matching.slice(query.skip, query.skip + query.limit), total: matching.length };
  }

  async findAllOwned(ownerId: string) {
    return [...this.categories.values()]
      .map((category) => this.persistHydrated(category))
      .filter((category) => category.ownerId === ownerId);
  }

  async findOwned(id: string, ownerId: string) {
    const category = this.categories.get(id);
    return category?.ownerId === ownerId ? this.persistHydrated(category) : null;
  }

  async findOwnedByNormalizedName(ownerId: string, nameNormalized: string) {
    return (
      [...this.categories.values()]
        .map((category) => this.persistHydrated(category))
        .find(
          (category) => category.ownerId === ownerId && category.nameNormalized === nameNormalized,
        ) ?? null
    );
  }

  async findOwnedByMemberTag(ownerId: string, tagId: string) {
    return (
      [...this.categories.values()]
        .map((category) => this.persistHydrated(category))
        .find((category) => category.ownerId === ownerId && category.tagIds.includes(tagId)) ?? null
    );
  }

  async nextOrder(ownerId: string) {
    return (
      [...this.categories.values()].filter((category) => category.ownerId === ownerId).length + 1
    );
  }

  async create(ownerId: string, input: TagCategoryInput, order: number) {
    const timestamp = new Date().toISOString();
    const name = normalizeTagCategoryName(input.name);
    const category: StoredTagCategory = {
      id: randomUUID(),
      ownerId,
      name,
      nameNormalized: name,
      description: input.description ?? '',
      tagIds: [],
      order,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.categories.set(category.id, category);
    return category;
  }

  async replace(category: StoredTagCategory) {
    this.categories.set(category.id, category);
    return category;
  }

  async addMembers(ownerId: string, categoryId: string, tagIds: string[]) {
    const category = await this.findOwned(categoryId, ownerId);
    if (!category) return null;
    const merged = [...new Set([...category.tagIds, ...tagIds])];
    const updated = { ...category, tagIds: merged, updatedAt: new Date().toISOString() };
    this.categories.set(category.id, updated);
    return updated;
  }

  async removeMember(ownerId: string, categoryId: string, tagId: string) {
    const category = await this.findOwned(categoryId, ownerId);
    if (!category) return null;
    const updated = {
      ...category,
      tagIds: category.tagIds.filter((member) => member !== tagId),
      updatedAt: new Date().toISOString(),
    };
    this.categories.set(category.id, updated);
    return updated;
  }

  async delete(id: string, ownerId: string) {
    const category = await this.findOwned(id, ownerId);
    if (!category) return false;
    this.categories.delete(id);
    return true;
  }

  async reorder(id: string, ownerId: string, order: number) {
    const category = await this.findOwned(id, ownerId);
    if (!category) return null;
    const ordered = [...this.categories.values()]
      .map((candidate) => this.persistHydrated(candidate))
      .filter((candidate) => candidate.ownerId === ownerId && candidate.id !== id)
      .sort((left, right) => left.order - right.order);
    ordered.splice(Math.min(order - 1, ordered.length), 0, category);
    const timestamp = new Date().toISOString();
    ordered.forEach((candidate, index) =>
      this.categories.set(candidate.id, { ...candidate, order: index + 1, updatedAt: timestamp }),
    );
    const reordered = this.categories.get(id);
    return reordered ? this.persistHydrated(reordered) : null;
  }
}

function toStoredCategory(row: typeof tagCategories.$inferSelect): StoredTagCategory {
  return hydrateCategory({
    id: row.id,
    ownerId: row.ownerId,
    name: row.name,
    nameNormalized: row.nameNormalized,
    description: row.description,
    tagIds: row.tagIds,
    order: row.order,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

function owned(ownerId: string, id: string) {
  return and(eq(tagCategories.id, id), eq(tagCategories.ownerId, ownerId));
}

export class PostgresTagCategoriesRepository implements TagCategoriesRepository {
  constructor(private readonly db: Database) {}

  async list(ownerId: string, query: TagCategoryQuery) {
    const pattern = query.search ? containsPattern(query.search) : undefined;
    const where = and(
      eq(tagCategories.ownerId, ownerId),
      pattern
        ? or(ilike(tagCategories.name, pattern), ilike(tagCategories.description, pattern))
        : undefined,
    );
    const sort =
      query.sort === 'name'
        ? asc(tagCategories.name)
        : query.sort === 'updatedAt'
          ? desc(tagCategories.updatedAt)
          : asc(tagCategories.order);
    const [rows, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(tagCategories)
        .where(where)
        .orderBy(sort, asc(tagCategories.id))
        .limit(query.limit)
        .offset(query.skip),
      this.db.select({ total: count() }).from(tagCategories).where(where),
    ]);
    return { items: rows.map(toStoredCategory), total };
  }

  async findAllOwned(ownerId: string) {
    const rows = await this.db
      .select()
      .from(tagCategories)
      .where(eq(tagCategories.ownerId, ownerId))
      .orderBy(asc(tagCategories.order), asc(tagCategories.id));
    return rows.map(toStoredCategory);
  }

  async findOwned(id: string, ownerId: string) {
    const [row] = await this.db.select().from(tagCategories).where(owned(ownerId, id));
    return row ? toStoredCategory(row) : null;
  }

  async findOwnedByNormalizedName(ownerId: string, nameNormalized: string) {
    const [row] = await this.db
      .select()
      .from(tagCategories)
      .where(
        and(eq(tagCategories.ownerId, ownerId), eq(tagCategories.nameNormalized, nameNormalized)),
      );
    return row ? toStoredCategory(row) : null;
  }

  async findOwnedByMemberTag(ownerId: string, tagId: string) {
    const [row] = await this.db
      .select()
      .from(tagCategories)
      .where(and(eq(tagCategories.ownerId, ownerId), arrayContains(tagCategories.tagIds, [tagId])))
      .orderBy(asc(tagCategories.order), asc(tagCategories.id))
      .limit(1);
    return row ? toStoredCategory(row) : null;
  }

  async nextOrder(ownerId: string) {
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(tagCategories)
      .where(eq(tagCategories.ownerId, ownerId));
    return total + 1;
  }

  async create(ownerId: string, input: TagCategoryInput, order: number) {
    const timestamp = new Date();
    const name = normalizeTagCategoryName(input.name);
    const [row] = await this.db
      .insert(tagCategories)
      .values({
        id: randomUUID(),
        ownerId,
        name,
        nameNormalized: name,
        description: input.description ?? '',
        tagIds: [],
        order,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .onConflictDoNothing({ target: [tagCategories.ownerId, tagCategories.nameNormalized] })
      .returning();
    if (row) return toStoredCategory(row);
    // A concurrent request created the same category first; return it like a sequential retry would.
    const existing = await this.findOwnedByNormalizedName(ownerId, name);
    if (existing) return existing;
    throw new AppError(409, 'CONFLICT', 'Tag category already exists');
  }

  async replace(category: StoredTagCategory) {
    await this.db
      .update(tagCategories)
      .set({
        name: category.name,
        nameNormalized: category.nameNormalized,
        description: category.description,
        tagIds: category.tagIds,
        order: category.order,
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt),
      })
      .where(owned(category.ownerId, category.id));
    return category;
  }

  async addMembers(ownerId: string, categoryId: string, tagIds: string[]) {
    // Appends the ids that are not members yet, in the given order.
    const [row] = await this.db
      .update(tagCategories)
      .set({
        tagIds: sql`${tagCategories.tagIds} || ARRAY(
          SELECT added.tag_id
          FROM unnest(${textArray(tagIds)}) WITH ORDINALITY AS added(tag_id, position)
          WHERE added.tag_id <> ALL (${tagCategories.tagIds})
          GROUP BY added.tag_id
          ORDER BY min(added.position)
        )`,
        updatedAt: new Date(),
      })
      .where(owned(ownerId, categoryId))
      .returning();
    return row ? toStoredCategory(row) : null;
  }

  async removeMember(ownerId: string, categoryId: string, tagId: string) {
    const [row] = await this.db
      .update(tagCategories)
      .set({ tagIds: sql`array_remove(${tagCategories.tagIds}, ${tagId})`, updatedAt: new Date() })
      .where(owned(ownerId, categoryId))
      .returning();
    return row ? toStoredCategory(row) : null;
  }

  async delete(id: string, ownerId: string) {
    const deleted = await this.db
      .delete(tagCategories)
      .where(owned(ownerId, id))
      .returning({ id: tagCategories.id });
    return deleted.length === 1;
  }

  async reorder(id: string, ownerId: string, order: number) {
    return this.db.transaction(async (tx) => {
      if (!(await renumberOwnedRows(tx, tagCategories, ownerId, id, order))) return null;
      const [row] = await tx.select().from(tagCategories).where(owned(ownerId, id));
      return toStoredCategory(row);
    });
  }
}
