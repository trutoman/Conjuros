import { randomUUID } from 'node:crypto';
import { and, asc, count, eq, inArray } from 'drizzle-orm';
import { normalizeTagName, type TagInput } from '@conjuros/contracts';
import type { Database } from '../db/client';
import { renumberOwnedRows } from '../db/reorder';
import { tags } from '../db/schema';

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

function toStoredTag(row: typeof tags.$inferSelect): StoredTag {
  return {
    id: row.id,
    ownerId: row.ownerId,
    tagName: row.tagName,
    tagNameNormalized: row.tagNameNormalized,
    description: row.description,
    color: row.color,
    order: row.order,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function owned(ownerId: string, id: string) {
  return and(eq(tags.id, id), eq(tags.ownerId, ownerId));
}

export class PostgresTagsRepository implements TagsRepository {
  constructor(private readonly db: Database) {}

  async findOwned(id: string, ownerId: string) {
    const [row] = await this.db.select().from(tags).where(owned(ownerId, id));
    return row ? toStoredTag(row) : null;
  }

  async findOwnedByNormalizedNames(ownerId: string, tagNamesNormalized: string[]) {
    if (tagNamesNormalized.length === 0) return [];
    const rows = await this.db
      .select()
      .from(tags)
      .where(and(eq(tags.ownerId, ownerId), inArray(tags.tagNameNormalized, tagNamesNormalized)))
      .orderBy(asc(tags.order), asc(tags.id));
    return rows.map(toStoredTag);
  }

  async findAllOwned(ownerId: string) {
    const rows = await this.db
      .select()
      .from(tags)
      .where(eq(tags.ownerId, ownerId))
      .orderBy(asc(tags.order), asc(tags.id));
    return rows.map(toStoredTag);
  }

  async nextOrder(ownerId: string) {
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(tags)
      .where(eq(tags.ownerId, ownerId));
    return total + 1;
  }

  async create(ownerId: string, input: TagCreateInput, order: number) {
    const timestamp = new Date();
    const [row] = await this.db
      .insert(tags)
      .values({
        id: randomUUID(),
        ownerId,
        tagName: input.tagName,
        tagNameNormalized: normalizeTagName(input.tagName),
        description: input.description,
        color: input.color,
        order,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning();
    return toStoredTag(row);
  }

  async replace(tag: StoredTag) {
    await this.db
      .update(tags)
      .set({
        tagName: tag.tagName,
        tagNameNormalized: tag.tagNameNormalized,
        description: tag.description,
        color: tag.color,
        order: tag.order,
        createdAt: new Date(tag.createdAt),
        updatedAt: new Date(tag.updatedAt),
      })
      .where(owned(tag.ownerId, tag.id));
    return tag;
  }

  async delete(id: string, ownerId: string) {
    const deleted = await this.db.delete(tags).where(owned(ownerId, id)).returning({ id: tags.id });
    return deleted.length === 1;
  }

  async reorder(id: string, ownerId: string, order: number) {
    return this.db.transaction(async (tx) => {
      if (!(await renumberOwnedRows(tx, tags, ownerId, id, order))) return null;
      const [row] = await tx.select().from(tags).where(owned(ownerId, id));
      return toStoredTag(row);
    });
  }
}
