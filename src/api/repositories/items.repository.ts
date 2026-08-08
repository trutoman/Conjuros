import { randomUUID } from 'node:crypto';
import type { Collection, Db, Filter, Sort } from 'mongodb';
import type { CollectionItem, CollectionItemInput, CollectionQuery } from '@conjuros/contracts';

export interface StoredCollectionItem extends CollectionItem {
  ownerId: string;
}

export interface ItemsRepository {
  list(ownerId: string, query: CollectionQuery): Promise<{ items: StoredCollectionItem[]; total: number }>;
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
    const hasTag = query.tagFilterMode === 'any'
      ? query.tags.some((tag) => item.tags.includes(tag))
      : query.tags.every((tag) => item.tags.includes(tag));
    if (!hasTag) return false;
  }
  if (!query.search) return true;
  const value = query.search.toLowerCase();
  return [item.title, item.description, item.command ?? '', item.url ?? '', item.content ?? '', ...item.tags]
    .join(' ')
    .toLowerCase()
    .includes(value);
}

function compareItems(left: StoredCollectionItem, right: StoredCollectionItem, sort: CollectionQuery['sort']) {
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
    return [...this.items.values()].filter((item) => item.ownerId === ownerId && tags.every((tag) => item.tags.includes(tag)));
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
      description: input.description,
      tags: input.tags,
      relatedItemIds: input.relatedItemIds,
      order,
      command: input.kind === 'spell' ? input.command : null,
      url: input.kind === 'web-link' ? input.url : null,
      content: input.kind === 'markdown' ? input.content : null,
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
    ordered.forEach((candidate, index) => this.items.set(candidate.id, { ...candidate, order: index + 1, updatedAt: timestamp }));
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

export class MongoItemsRepository implements ItemsRepository {
  private readonly items: Collection<StoredCollectionItem>;

  constructor(database: Db) {
    this.items = database.collection<StoredCollectionItem>('collectionItems');
  }

  private static normalizeRead(doc: StoredCollectionItem): StoredCollectionItem {
    return {
      ...doc,
      command: doc.command ?? null,
      url: doc.url ?? null,
      content: doc.content ?? null,
    };
  }

  async list(ownerId: string, query: CollectionQuery) {
    const filter: Filter<StoredCollectionItem> = { ownerId };
    if (query.kind) filter.kind = query.kind;
    if (query.tags && query.tags.length > 0) {
      filter.tags = query.tagFilterMode === 'any' ? { $in: query.tags } : { $all: query.tags };
    }
    if (query.search) {
      const expression = { $regex: query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
      filter.$or = [{ title: expression }, { description: expression }, { command: expression }, { url: expression }, { content: expression }, { tags: expression }];
    }
    const sort: Sort = query.sort === 'title' ? { title: 1 } : query.sort === 'updatedAt' ? { updatedAt: -1 } : { order: 1 };
    const [items, total] = await Promise.all([
      this.items.find(filter).sort(sort).skip(query.skip).limit(query.limit).toArray(),
      this.items.countDocuments(filter),
    ]);
    return { items: items.map(MongoItemsRepository.normalizeRead), total };
  }

  async findOwned(id: string, ownerId: string) {
    const doc = await this.items.findOne({ id, ownerId });
    return doc ? MongoItemsRepository.normalizeRead(doc) : null;
  }

  async findOwnedByIds(ids: string[], ownerId: string) {
    const docs = await this.items.find({ id: { $in: ids }, ownerId }).toArray();
    return docs.map(MongoItemsRepository.normalizeRead);
  }

  async findOwnedByTags(ownerId: string, tags: string[]) {
    if (tags.length === 0) return [];
    const docs = await this.items.find({ ownerId, tags: { $all: tags } }).toArray();
    return docs.map(MongoItemsRepository.normalizeRead);
  }

  async nextOrder(ownerId: string) {
    return (await this.items.countDocuments({ ownerId })) + 1;
  }

  async create(ownerId: string, input: CollectionItemInput, order: number) {
    const timestamp = new Date().toISOString();
    const item: StoredCollectionItem = {
      id: randomUUID(), ownerId, kind: input.kind, title: input.title, description: input.description,
      tags: input.tags, relatedItemIds: input.relatedItemIds, order,
      command: input.kind === 'spell' ? input.command : null,
      url: input.kind === 'web-link' ? input.url : null,
      content: input.kind === 'markdown' ? input.content : null,
      createdAt: timestamp, updatedAt: timestamp,
    };
    await this.items.insertOne(item);
    return item;
  }

  async replace(item: StoredCollectionItem) {
    await this.items.replaceOne({ id: item.id, ownerId: item.ownerId }, item);
    return item;
  }

  async delete(id: string, ownerId: string) {
    return (await this.items.deleteOne({ id, ownerId })).deletedCount === 1;
  }

  async reorder(id: string, ownerId: string, order: number) {
    const item = await this.findOwned(id, ownerId);
    if (!item) return null;
    const all = await this.items.find({ ownerId }).sort({ order: 1 }).toArray();
    const reordered = all.filter((candidate) => candidate.id !== id).map(MongoItemsRepository.normalizeRead);
    reordered.splice(Math.min(order - 1, reordered.length), 0, item);
    const timestamp = new Date().toISOString();
    await this.items.bulkWrite(reordered.map((candidate, index) => ({
      updateOne: { filter: { id: candidate.id, ownerId }, update: { $set: { order: index + 1, updatedAt: timestamp } } },
    })));
    return { ...item, order: reordered.findIndex((candidate) => candidate.id === id) + 1, updatedAt: timestamp };
  }

  async removeTagFromOwnerItems(ownerId: string, tag: string) {
    const result = await this.items.updateMany(
      { ownerId, tags: tag },
      { $pull: { tags: tag }, $set: { updatedAt: new Date().toISOString() } },
    );
    return result.modifiedCount;
  }

  async renameTagForOwnerItems(ownerId: string, oldTag: string, newTag: string) {
    if (oldTag === newTag) return 0;

    const taggedItems = await this.items.find({ ownerId, tags: oldTag }).toArray();
    if (taggedItems.length === 0) return 0;

    const timestamp = new Date().toISOString();
    await this.items.bulkWrite(
      taggedItems.map((item) => ({
        updateOne: {
          filter: { id: item.id, ownerId },
          update: {
            $set: {
              tags: [...new Set(item.tags.map((candidate) => (candidate === oldTag ? newTag : candidate)))],
              updatedAt: timestamp,
            },
          },
        },
      })),
    );

    return taggedItems.length;
  }
}