import { randomUUID } from 'node:crypto';
import type { Collection, Db, Filter, Sort } from 'mongodb';
import { normalizeTagName, type Tag, type TagInput, type TagQuery } from '@conjuros/contracts';

export interface StoredTag extends Tag {
  ownerId: string;
  tagNameNormalized: string;
}

export interface TagsRepository {
  list(ownerId: string, query: TagQuery): Promise<{ items: StoredTag[]; total: number }>;
  findOwned(id: string, ownerId: string): Promise<StoredTag | null>;
  findOwnedByNormalized(ownerId: string, tagNameNormalized: string): Promise<StoredTag | null>;
  findOwnedByNormalizedNames(ownerId: string, tagNamesNormalized: string[]): Promise<StoredTag[]>;
  nextOrder(ownerId: string): Promise<number>;
  create(ownerId: string, input: TagInput, order: number): Promise<StoredTag>;
  replace(tag: StoredTag): Promise<StoredTag>;
  delete(id: string, ownerId: string): Promise<boolean>;
  reorder(id: string, ownerId: string, order: number): Promise<StoredTag | null>;
}

function compareTags(left: StoredTag, right: StoredTag, sort: TagQuery['sort']) {
  if (sort === 'tagName') return left.tagName.localeCompare(right.tagName);
  if (sort === 'updatedAt') return right.updatedAt.localeCompare(left.updatedAt);
  return left.order - right.order;
}

function matchesQuery(tag: StoredTag, query: TagQuery): boolean {
  if (!query.search) return true;
  const value = query.search.toLowerCase();
  return [tag.tagName, tag.description].join(' ').toLowerCase().includes(value);
}

export class InMemoryTagsRepository implements TagsRepository {
  private readonly tags = new Map<string, StoredTag>();

  async list(ownerId: string, query: TagQuery) {
    const matching = [...this.tags.values()]
      .filter((tag) => tag.ownerId === ownerId && matchesQuery(tag, query))
      .sort((left, right) => compareTags(left, right, query.sort));
    return { items: matching.slice(query.skip, query.skip + query.limit), total: matching.length };
  }

  async findOwned(id: string, ownerId: string) {
    const tag = this.tags.get(id);
    return tag?.ownerId === ownerId ? tag : null;
  }

  async findOwnedByNormalized(ownerId: string, tagNameNormalized: string) {
    return [...this.tags.values()].find((tag) => tag.ownerId === ownerId && tag.tagNameNormalized === tagNameNormalized) ?? null;
  }

  async findOwnedByNormalizedNames(ownerId: string, tagNamesNormalized: string[]) {
    const wanted = new Set(tagNamesNormalized);
    return [...this.tags.values()].filter((tag) => tag.ownerId === ownerId && wanted.has(tag.tagNameNormalized));
  }

  async nextOrder(ownerId: string) {
    return [...this.tags.values()].filter((tag) => tag.ownerId === ownerId).length + 1;
  }

  async create(ownerId: string, input: TagInput, order: number) {
    const timestamp = new Date().toISOString();
    const tag: StoredTag = {
      id: randomUUID(),
      ownerId,
      tagName: input.tagName,
      tagNameNormalized: normalizeTagName(input.tagName),
      description: input.description,
      color: input.color,
      order,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.tags.set(tag.id, tag);
    return tag;
  }

  async replace(tag: StoredTag) {
    this.tags.set(tag.id, tag);
    return tag;
  }

  async delete(id: string, ownerId: string) {
    const tag = await this.findOwned(id, ownerId);
    if (!tag) return false;
    this.tags.delete(id);
    return true;
  }

  async reorder(id: string, ownerId: string, order: number) {
    const tag = await this.findOwned(id, ownerId);
    if (!tag) return null;
    const ordered = [...this.tags.values()]
      .filter((candidate) => candidate.ownerId === ownerId && candidate.id !== id)
      .sort((left, right) => left.order - right.order);
    ordered.splice(Math.min(order - 1, ordered.length), 0, tag);
    const timestamp = new Date().toISOString();
    ordered.forEach((candidate, index) => this.tags.set(candidate.id, { ...candidate, order: index + 1, updatedAt: timestamp }));
    return this.tags.get(id) ?? null;
  }
}

export class MongoTagsRepository implements TagsRepository {
  private readonly tags: Collection<StoredTag>;

  constructor(database: Db) {
    this.tags = database.collection<StoredTag>('tags');
  }

  async list(ownerId: string, query: TagQuery) {
    const filter: Filter<StoredTag> = { ownerId };
    if (query.search) {
      const expression = { $regex: query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
      filter.$or = [{ tagName: expression }, { description: expression }];
    }

    const sort: Sort = query.sort === 'tagName' ? { tagName: 1 } : query.sort === 'updatedAt' ? { updatedAt: -1 } : { order: 1 };
    const [items, total] = await Promise.all([
      this.tags.find(filter).sort(sort).skip(query.skip).limit(query.limit).toArray(),
      this.tags.countDocuments(filter),
    ]);
    return { items, total };
  }

  async findOwned(id: string, ownerId: string) {
    return this.tags.findOne({ id, ownerId });
  }

  async findOwnedByNormalized(ownerId: string, tagNameNormalized: string) {
    return this.tags.findOne({ ownerId, tagNameNormalized });
  }

  async findOwnedByNormalizedNames(ownerId: string, tagNamesNormalized: string[]) {
    return this.tags.find({ ownerId, tagNameNormalized: { $in: tagNamesNormalized } }).toArray();
  }

  async nextOrder(ownerId: string) {
    return (await this.tags.countDocuments({ ownerId })) + 1;
  }

  async create(ownerId: string, input: TagInput, order: number) {
    const timestamp = new Date().toISOString();
    const tag: StoredTag = {
      id: randomUUID(),
      ownerId,
      tagName: input.tagName,
      tagNameNormalized: normalizeTagName(input.tagName),
      description: input.description,
      color: input.color,
      order,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await this.tags.insertOne(tag);
    return tag;
  }

  async replace(tag: StoredTag) {
    await this.tags.replaceOne({ id: tag.id, ownerId: tag.ownerId }, tag);
    return tag;
  }

  async delete(id: string, ownerId: string) {
    return (await this.tags.deleteOne({ id, ownerId })).deletedCount === 1;
  }

  async reorder(id: string, ownerId: string, order: number) {
    const tag = await this.findOwned(id, ownerId);
    if (!tag) return null;
    const all = await this.tags.find({ ownerId }).sort({ order: 1 }).toArray();
    const reordered = all.filter((candidate) => candidate.id !== id);
    reordered.splice(Math.min(order - 1, reordered.length), 0, tag);
    const timestamp = new Date().toISOString();
    await this.tags.bulkWrite(
      reordered.map((candidate, index) => ({
        updateOne: {
          filter: { id: candidate.id, ownerId },
          update: { $set: { order: index + 1, updatedAt: timestamp } },
        },
      })),
    );
    return { ...tag, order: reordered.findIndex((candidate) => candidate.id === id) + 1, updatedAt: timestamp };
  }
}
