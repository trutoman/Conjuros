import { randomUUID } from 'node:crypto';
import type { Collection, Db } from 'mongodb';
import { normalizeTagName, type TagInput } from '@conjuros/contracts';

// Stored tags carry no category fields. Category membership lives on the
// TagCategory entity (StoredTagCategory.tagIds) and is resolved in services.
export interface StoredTag {
  id: string;
  ownerId: string;
  tagName: string;
  tagNameNormalized: string;
  description: string;
  color: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type TagCreateInput = Omit<TagInput, 'tagCategory'>;

export interface TagsRepository {
  findOwned(id: string, ownerId: string): Promise<StoredTag | null>;
  findOwnedByNormalizedNames(ownerId: string, tagNamesNormalized: string[]): Promise<StoredTag[]>;
  findAllOwned(ownerId: string): Promise<StoredTag[]>;
  nextOrder(ownerId: string): Promise<number>;
  create(ownerId: string, input: TagCreateInput, order: number): Promise<StoredTag>;
  replace(tag: StoredTag): Promise<StoredTag>;
  delete(id: string, ownerId: string): Promise<boolean>;
  reorder(id: string, ownerId: string, order: number): Promise<StoredTag | null>;
}

export class InMemoryTagsRepository implements TagsRepository {
  private readonly tags = new Map<string, StoredTag>();

  async findOwned(id: string, ownerId: string) {
    const tag = this.tags.get(id);
    return tag?.ownerId === ownerId ? tag : null;
  }

  async findOwnedByNormalizedNames(ownerId: string, tagNamesNormalized: string[]) {
    const wanted = new Set(tagNamesNormalized);
    return [...this.tags.values()].filter(
      (tag) => tag.ownerId === ownerId && wanted.has(tag.tagNameNormalized),
    );
  }

  async findAllOwned(ownerId: string) {
    return [...this.tags.values()].filter((tag) => tag.ownerId === ownerId);
  }

  async nextOrder(ownerId: string) {
    return [...this.tags.values()].filter((tag) => tag.ownerId === ownerId).length + 1;
  }

  async create(ownerId: string, input: TagCreateInput, order: number) {
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
    ordered.forEach((candidate, index) =>
      this.tags.set(candidate.id, { ...candidate, order: index + 1, updatedAt: timestamp }),
    );
    return this.tags.get(id) ?? null;
  }
}

export class MongoTagsRepository implements TagsRepository {
  private readonly tags: Collection<StoredTag>;

  constructor(database: Db) {
    this.tags = database.collection<StoredTag>('tags');
  }

  async findOwned(id: string, ownerId: string) {
    return (await this.tags.findOne({ id, ownerId })) ?? null;
  }

  async findOwnedByNormalizedNames(ownerId: string, tagNamesNormalized: string[]) {
    return this.tags.find({ ownerId, tagNameNormalized: { $in: tagNamesNormalized } }).toArray();
  }

  async findAllOwned(ownerId: string) {
    return this.tags.find({ ownerId }).toArray();
  }

  async nextOrder(ownerId: string) {
    return (await this.tags.countDocuments({ ownerId })) + 1;
  }

  async create(ownerId: string, input: TagCreateInput, order: number) {
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
    return {
      ...tag,
      order: reordered.findIndex((candidate) => candidate.id === id) + 1,
      updatedAt: timestamp,
    };
  }
}
