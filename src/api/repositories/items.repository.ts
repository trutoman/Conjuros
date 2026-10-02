import { randomUUID } from 'node:crypto';
import {
  and,
  arrayContains,
  arrayOverlaps,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import type { CollectionItem, CollectionItemInput, CollectionQuery } from '@conjuros/contracts';
import type { Database } from '../db/client';
import { renumberOwnedRows } from '../db/reorder';
import { collectionItems } from '../db/schema';
import { containsPattern } from '../db/sql';

export interface StoredCollectionItem extends CollectionItem {
  ownerId: string;
}

export interface ItemsRepository {
  list(
    ownerId: string,
    query: CollectionQuery,
  ): Promise<{ items: StoredCollectionItem[]; total: number }>;
  findOwned(id: string, ownerId: string): Promise<StoredCollectionItem | null>;
  findOwnedByIds(ids: string[], ownerId: string): Promise<StoredCollectionItem[]>;
  findOwnedByTags(ownerId: string, tags: string[]): Promise<StoredCollectionItem[]>;
  nextOrder(ownerId: string): Promise<number>;
  create(ownerId: string, input: CollectionItemInput, order: number): Promise<StoredCollectionItem>;
  replace(item: StoredCollectionItem): Promise<StoredCollectionItem>;
  delete(id: string, ownerId: string): Promise<boolean>;
  reorder(id: string, ownerId: string, order: number): Promise<StoredCollectionItem | null>;
  removeTagFromOwnerItems(ownerId: string, tag: string): Promise<number>;
  renameTagForOwnerItems(ownerId: string, oldTag: string, newTag: string): Promise<number>;
}

function matchesQuery(item: StoredCollectionItem, query: CollectionQuery): boolean {
  if (query.kind && item.kind !== query.kind) return false;
  if (query.tags && query.tags.length > 0) {
    const hasTag =
      query.tagFilterMode === 'any'
        ? query.tags.some((tag) => item.tags.includes(tag))
        : query.tags.every((tag) => item.tags.includes(tag));
    if (!hasTag) return false;
  }
  if (!query.search) return true;
  const value = query.search.toLowerCase();
  return [
    item.title,
    item.description ?? '',
    item.command ?? '',
    item.url ?? '',
    item.content ?? '',
    ...item.tags,
  ]
    .join(' ')
    .toLowerCase()
    .includes(value);
}

function compareItems(
  left: StoredCollectionItem,
  right: StoredCollectionItem,
  sort: CollectionQuery['sort'],
) {
  if (sort === 'title') return left.title.localeCompare(right.title);
  if (sort === 'updatedAt') return right.updatedAt.localeCompare(left.updatedAt);
  return left.order - right.order;
}

export class InMemoryItemsRepository implements ItemsRepository {
  private readonly items = new Map<string, StoredCollectionItem>();

  async list(ownerId: string, query: CollectionQuery) {
    const matching = [...this.items.values()]
      .filter((item) => item.ownerId === ownerId && matchesQuery(item, query))
      .sort((left, right) => compareItems(left, right, query.sort));
    return { items: matching.slice(query.skip, query.skip + query.limit), total: matching.length };
  }

  async findOwned(id: string, ownerId: string) {
    const item = this.items.get(id);
    return item?.ownerId === ownerId ? item : null;
  }

  async findOwnedByIds(ids: string[], ownerId: string) {
    return ids.flatMap((id) => {
      const item = this.items.get(id);
      return item?.ownerId === ownerId ? [item] : [];
    });
  }

  async findOwnedByTags(ownerId: string, tags: string[]) {
    if (tags.length === 0) return [];
    return [...this.items.values()].filter(
      (item) => item.ownerId === ownerId && tags.every((tag) => item.tags.includes(tag)),
    );
  }

  async nextOrder(ownerId: string) {
    return [...this.items.values()].filter((item) => item.ownerId === ownerId).length + 1;
  }

  async create(ownerId: string, input: CollectionItemInput, order: number) {
    const timestamp = new Date().toISOString();
    const item: StoredCollectionItem = {
      id: randomUUID(),
      ownerId,
      kind: input.kind,
      title: input.title,
      description: input.description ?? null,
      tags: input.tags,
      relatedItemIds: input.relatedItemIds,
      order,
      command: input.kind === 'spell' ? input.command : null,
      url: input.kind === 'web-link' ? input.url : null,
      content: input.kind === 'markdown' || input.kind === 'file' ? input.content : null,
      filename:
        input.kind === 'markdown' || input.kind === 'file' ? (input.filename ?? null) : null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.items.set(item.id, item);
    return item;
  }

  async replace(item: StoredCollectionItem) {
    this.items.set(item.id, item);
    return item;
  }

  async delete(id: string, ownerId: string) {
    const item = await this.findOwned(id, ownerId);
    if (!item) return false;
    this.items.delete(id);
    return true;
  }

  async reorder(id: string, ownerId: string, order: number) {
    const item = await this.findOwned(id, ownerId);
    if (!item) return null;
    const ordered = [...this.items.values()]
      .filter((candidate) => candidate.ownerId === ownerId && candidate.id !== id)
      .sort((left, right) => left.order - right.order);
    ordered.splice(Math.min(order - 1, ordered.length), 0, item);
    const timestamp = new Date().toISOString();
    ordered.forEach((candidate, index) =>
      this.items.set(candidate.id, { ...candidate, order: index + 1, updatedAt: timestamp }),
    );
    return this.items.get(id) ?? null;
  }

  async removeTagFromOwnerItems(ownerId: string, tag: string) {
    const timestamp = new Date().toISOString();
    let updated = 0;
    for (const item of this.items.values()) {
      if (item.ownerId !== ownerId || !item.tags.includes(tag)) continue;
      this.items.set(item.id, {
        ...item,
        tags: item.tags.filter((candidate) => candidate !== tag),
        updatedAt: timestamp,
      });
      updated += 1;
    }
    return updated;
  }

  async renameTagForOwnerItems(ownerId: string, oldTag: string, newTag: string) {
    if (oldTag === newTag) return 0;
    const timestamp = new Date().toISOString();
    let updated = 0;
    for (const item of this.items.values()) {
      if (item.ownerId !== ownerId || !item.tags.includes(oldTag)) continue;
      const replaced = item.tags.map((candidate) => (candidate === oldTag ? newTag : candidate));
      this.items.set(item.id, {
        ...item,
        tags: [...new Set(replaced)],
        updatedAt: timestamp,
      });
      updated += 1;
    }
    return updated;
  }
}

function toStoredItem(row: typeof collectionItems.$inferSelect): StoredCollectionItem {
  return {
    id: row.id,
    ownerId: row.ownerId,
    kind: row.kind,
    title: row.title,
    description: row.description,
    tags: row.tags,
    order: row.order,
    relatedItemIds: row.relatedItemIds,
    command: row.command,
    url: row.url,
    content: row.content,
    filename: row.filename,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function owned(ownerId: string, id: string) {
  return and(eq(collectionItems.id, id), eq(collectionItems.ownerId, ownerId));
}

function listCondition(ownerId: string, query: CollectionQuery) {
  const conditions: (SQL | undefined)[] = [eq(collectionItems.ownerId, ownerId)];
  if (query.kind) conditions.push(eq(collectionItems.kind, query.kind));
  if (query.tags && query.tags.length > 0) {
    conditions.push(
      query.tagFilterMode === 'any'
        ? arrayOverlaps(collectionItems.tags, query.tags)
        : arrayContains(collectionItems.tags, query.tags),
    );
  }
  if (query.search) {
    const pattern = containsPattern(query.search);
    conditions.push(
      or(
        ilike(collectionItems.title, pattern),
        ilike(collectionItems.description, pattern),
        ilike(collectionItems.command, pattern),
        ilike(collectionItems.url, pattern),
        ilike(collectionItems.content, pattern),
        sql`EXISTS (SELECT 1 FROM unnest(${collectionItems.tags}) AS candidate(tag) WHERE candidate.tag ILIKE ${pattern})`,
      ),
    );
  }
  return and(...conditions);
}

export class PostgresItemsRepository implements ItemsRepository {
  constructor(private readonly db: Database) {}

  async list(ownerId: string, query: CollectionQuery) {
    const where = listCondition(ownerId, query);
    const sort =
      query.sort === 'title'
        ? asc(collectionItems.title)
        : query.sort === 'updatedAt'
          ? desc(collectionItems.updatedAt)
          : asc(collectionItems.order);
    // The id tie-break keeps pages stable when many rows share the sort key (a reorder gives them one updated_at).
    const [rows, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(collectionItems)
        .where(where)
        .orderBy(sort, asc(collectionItems.id))
        .limit(query.limit)
        .offset(query.skip),
      this.db.select({ total: count() }).from(collectionItems).where(where),
    ]);
    return { items: rows.map(toStoredItem), total };
  }

  async findOwned(id: string, ownerId: string) {
    const [row] = await this.db.select().from(collectionItems).where(owned(ownerId, id));
    return row ? toStoredItem(row) : null;
  }

  async findOwnedByIds(ids: string[], ownerId: string) {
    if (ids.length === 0) return [];
    const rows = await this.db
      .select()
      .from(collectionItems)
      .where(and(eq(collectionItems.ownerId, ownerId), inArray(collectionItems.id, ids)))
      .orderBy(asc(collectionItems.order), asc(collectionItems.id));
    return rows.map(toStoredItem);
  }

  async findOwnedByTags(ownerId: string, tags: string[]) {
    if (tags.length === 0) return [];
    const rows = await this.db
      .select()
      .from(collectionItems)
      .where(and(eq(collectionItems.ownerId, ownerId), arrayContains(collectionItems.tags, tags)))
      .orderBy(asc(collectionItems.order), asc(collectionItems.id));
    return rows.map(toStoredItem);
  }

  async nextOrder(ownerId: string) {
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(collectionItems)
      .where(eq(collectionItems.ownerId, ownerId));
    return total + 1;
  }

  async create(ownerId: string, input: CollectionItemInput, order: number) {
    const timestamp = new Date();
    const [row] = await this.db
      .insert(collectionItems)
      .values({
        id: randomUUID(),
        ownerId,
        kind: input.kind,
        title: input.title,
        description: input.description ?? null,
        tags: input.tags,
        relatedItemIds: input.relatedItemIds,
        order,
        command: input.kind === 'spell' ? input.command : null,
        url: input.kind === 'web-link' ? input.url : null,
        content: input.kind === 'markdown' || input.kind === 'file' ? input.content : null,
        filename:
          input.kind === 'markdown' || input.kind === 'file' ? (input.filename ?? null) : null,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning();
    return toStoredItem(row);
  }

  async replace(item: StoredCollectionItem) {
    await this.db
      .update(collectionItems)
      .set({
        kind: item.kind,
        title: item.title,
        description: item.description,
        tags: item.tags,
        relatedItemIds: item.relatedItemIds,
        order: item.order,
        command: item.command,
        url: item.url,
        content: item.content,
        filename: item.filename,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      })
      .where(owned(item.ownerId, item.id));
    return item;
  }

  async delete(id: string, ownerId: string) {
    const deleted = await this.db
      .delete(collectionItems)
      .where(owned(ownerId, id))
      .returning({ id: collectionItems.id });
    return deleted.length === 1;
  }

  async reorder(id: string, ownerId: string, order: number) {
    return this.db.transaction(async (tx) => {
      if (!(await renumberOwnedRows(tx, collectionItems, ownerId, id, order))) return null;
      const [row] = await tx.select().from(collectionItems).where(owned(ownerId, id));
      return toStoredItem(row);
    });
  }

  async removeTagFromOwnerItems(ownerId: string, tag: string) {
    const updated = await this.db
      .update(collectionItems)
      .set({ tags: sql`array_remove(${collectionItems.tags}, ${tag})`, updatedAt: new Date() })
      .where(and(eq(collectionItems.ownerId, ownerId), arrayContains(collectionItems.tags, [tag])))
      .returning({ id: collectionItems.id });
    return updated.length;
  }

  async renameTagForOwnerItems(ownerId: string, oldTag: string, newTag: string) {
    if (oldTag === newTag) return 0;
    // Replace in place, then drop repeated tags while keeping the order of first occurrences.
    const updated = await this.db
      .update(collectionItems)
      .set({
        tags: sql`ARRAY(
          SELECT renamed.tag
          FROM unnest(array_replace(${collectionItems.tags}, ${oldTag}, ${newTag})) WITH ORDINALITY AS renamed(tag, position)
          GROUP BY renamed.tag
          ORDER BY min(renamed.position)
        )`,
        updatedAt: new Date(),
      })
      .where(
        and(eq(collectionItems.ownerId, ownerId), arrayContains(collectionItems.tags, [oldTag])),
      )
      .returning({ id: collectionItems.id });
    return updated.length;
  }
}
