import { randomUUID } from 'node:crypto';
import type { Collection, Db, Filter, Sort } from 'mongodb';
import {
  normalizeTagCategoryName,
  type TagCategoryInput,
  type TagCategoryQuery,
} from '@conjuros/contracts';

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
  list(ownerId: string, query: TagCategoryQuery): Promise<{ items: StoredTagCategory[]; total: number }>;
  findAllOwned(ownerId: string): Promise<StoredTagCategory[]>;
  findOwned(id: string, ownerId: string): Promise<StoredTagCategory | null>;
  findOwnedByNormalizedName(ownerId: string, nameNormalized: string): Promise<StoredTagCategory | null>;
  findOwnedByMemberTag(ownerId: string, tagId: string): Promise<StoredTagCategory | null>;
  nextOrder(ownerId: string): Promise<number>;
  create(ownerId: string, input: TagCategoryInput, order: number): Promise<StoredTagCategory>;
  replace(category: StoredTagCategory): Promise<StoredTagCategory>;
  addMembers(ownerId: string, categoryId: string, tagIds: string[]): Promise<StoredTagCategory | null>;
  removeMember(ownerId: string, categoryId: string, tagId: string): Promise<StoredTagCategory | null>;
  delete(id: string, ownerId: string): Promise<boolean>;
  reorder(id: string, ownerId: string, order: number): Promise<StoredTagCategory | null>;
}

function compareCategories(left: StoredTagCategory, right: StoredTagCategory, sort: TagCategoryQuery['sort']) {
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
        .find((category) => category.ownerId === ownerId && category.nameNormalized === nameNormalized) ?? null
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
    return [...this.categories.values()].filter((category) => category.ownerId === ownerId).length + 1;
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

export class MongoTagCategoriesRepository implements TagCategoriesRepository {
  private readonly categories: Collection<StoredTagCategory>;

  constructor(database: Db) {
    this.categories = database.collection<StoredTagCategory>('tagCategories');
  }

  async list(ownerId: string, query: TagCategoryQuery) {
    const filter: Filter<StoredTagCategory> = { ownerId };
    if (query.search) {
      const expression = {
        $regex: query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        $options: 'i',
      };
      filter.$or = [{ name: expression }, { description: expression }];
    }
    const sort: Sort =
      query.sort === 'name'
        ? { name: 1 }
        : query.sort === 'updatedAt'
          ? { updatedAt: -1 }
          : { order: 1 };
    const [items, total] = await Promise.all([
      this.categories.find(filter).sort(sort).skip(query.skip).limit(query.limit).toArray(),
      this.categories.countDocuments(filter),
    ]);
    return { items: items.map(hydrateCategory), total };
  }

  async findAllOwned(ownerId: string) {
    const items = await this.categories.find({ ownerId }).toArray();
    return items.map(hydrateCategory);
  }

  async findOwned(id: string, ownerId: string) {
    const category = await this.categories.findOne({ id, ownerId });
    return category ? hydrateCategory(category) : null;
  }

  async findOwnedByNormalizedName(ownerId: string, nameNormalized: string) {
    const category = await this.categories.findOne({ ownerId, nameNormalized });
    return category ? hydrateCategory(category) : null;
  }

  async findOwnedByMemberTag(ownerId: string, tagId: string) {
    const category = await this.categories.findOne({ ownerId, tagIds: tagId });
    return category ? hydrateCategory(category) : null;
  }

  async nextOrder(ownerId: string) {
    return (await this.categories.countDocuments({ ownerId })) + 1;
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
    try {
      await this.categories.insertOne(category);
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        const existing = await this.findOwnedByNormalizedName(ownerId, name);
        if (existing) return existing;
      }
      throw error;
    }
    return category;
  }

  async replace(category: StoredTagCategory) {
    await this.categories.replaceOne({ id: category.id, ownerId: category.ownerId }, category);
    return category;
  }

  async addMembers(ownerId: string, categoryId: string, tagIds: string[]) {
    const timestamp = new Date().toISOString();
    const updated = await this.categories.findOneAndUpdate(
      { id: categoryId, ownerId },
      { $addToSet: { tagIds: { $each: tagIds } }, $set: { updatedAt: timestamp } },
      { returnDocument: 'after' },
    );
    return updated ? hydrateCategory(updated) : null;
  }

  async removeMember(ownerId: string, categoryId: string, tagId: string) {
    const timestamp = new Date().toISOString();
    const updated = await this.categories.findOneAndUpdate(
      { id: categoryId, ownerId },
      { $pull: { tagIds: tagId }, $set: { updatedAt: timestamp } },
      { returnDocument: 'after' },
    );
    return updated ? hydrateCategory(updated) : null;
  }

  async delete(id: string, ownerId: string) {
    return (await this.categories.deleteOne({ id, ownerId })).deletedCount === 1;
  }

  async reorder(id: string, ownerId: string, order: number) {
    const category = await this.findOwned(id, ownerId);
    if (!category) return null;
    const all = await this.categories.find({ ownerId }).sort({ order: 1 }).toArray();
    const reordered = all.map(hydrateCategory).filter((candidate) => candidate.id !== id);
    reordered.splice(Math.min(order - 1, reordered.length), 0, category);
    const timestamp = new Date().toISOString();
    await this.categories.bulkWrite(
      reordered.map((candidate, index) => ({
        updateOne: {
          filter: { id: candidate.id, ownerId },
          update: { $set: { order: index + 1, updatedAt: timestamp } },
        },
      })),
    );
    return {
      ...category,
      order: reordered.findIndex((candidate) => candidate.id === id) + 1,
      updatedAt: timestamp,
    };
  }
}
