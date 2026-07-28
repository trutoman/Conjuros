import {
  collectionItemInputSchema,
  collectionItemUpdateSchema,
  type CollectionItem,
  type CollectionItemInput,
  type CollectionItemUpdate,
  type CollectionQuery,
} from '@conjuros/contracts';
import { AppError } from '../errors';
import type { ItemsRepository, StoredCollectionItem } from '../repositories/items.repository';

function toPublicItem(item: StoredCollectionItem): CollectionItem {
  const { ownerId, ...publicItem } = item;
  void ownerId;
  return publicItem;
}

export class ItemsService {
  constructor(private readonly repository: ItemsRepository) {}

  async list(ownerId: string, query: CollectionQuery) {
    const result = await this.repository.list(ownerId, query);
    return { items: result.items.map(toPublicItem), total: result.total };
  }

  async get(ownerId: string, id: string) {
    const item = await this.requireOwned(ownerId, id);
    return toPublicItem(item);
  }

  async create(ownerId: string, input: CollectionItemInput) {
    await this.assertRelatedItemsOwned(ownerId, input.relatedItemIds);
    const order = await this.repository.nextOrder(ownerId);
    return toPublicItem(await this.repository.create(ownerId, input, order));
  }

  async update(ownerId: string, id: string, update: CollectionItemUpdate) {
    const current = await this.requireOwned(ownerId, id);
    const kind = update.kind ?? current.kind;
    const candidate = collectionItemInputSchema.parse({
      kind,
      title: update.title ?? current.title,
      description: update.description ?? current.description,
      tags: update.tags ?? current.tags,
      relatedItemIds: update.relatedItemIds ?? current.relatedItemIds,
      ...(kind === 'spell' ? { command: update.command ?? current.command } : { url: update.url ?? current.url }),
    });
    await this.assertRelatedItemsOwned(ownerId, candidate.relatedItemIds);
    return toPublicItem(await this.repository.replace({
      ...current,
      kind: candidate.kind,
      title: candidate.title,
      description: candidate.description,
      tags: candidate.tags,
      relatedItemIds: candidate.relatedItemIds,
      command: candidate.kind === 'spell' ? candidate.command : null,
      url: candidate.kind === 'web-link' ? candidate.url : null,
      updatedAt: new Date().toISOString(),
    }));
  }

  async delete(ownerId: string, id: string) {
    if (!(await this.repository.delete(id, ownerId))) {
      throw new AppError(404, 'NOT_FOUND', 'Collection item not found');
    }
  }

  async reorder(ownerId: string, id: string, order: number) {
    const item = await this.repository.reorder(id, ownerId, order);
    if (!item) throw new AppError(404, 'NOT_FOUND', 'Collection item not found');
    return toPublicItem(item);
  }

  parseCreate(input: unknown) {
    return collectionItemInputSchema.parse(input);
  }

  parseUpdate(input: unknown) {
    return collectionItemUpdateSchema.parse(input);
  }

  private async requireOwned(ownerId: string, id: string) {
    const item = await this.repository.findOwned(id, ownerId);
    if (!item) throw new AppError(404, 'NOT_FOUND', 'Collection item not found');
    return item;
  }

  private async assertRelatedItemsOwned(ownerId: string, ids: string[]) {
    if (ids.length === 0) return;
    const related = await this.repository.findOwnedByIds(ids, ownerId);
    if (related.length !== ids.length) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Related items must belong to the current user');
    }
  }
}