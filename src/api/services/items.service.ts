import {
  attachmentUpdateCandidateSchema,
  collectionItemInputSchema,
  collectionItemUpdateSchema,
  fileUpdateCandidateSchema,
  markdownUpdateCandidateSchema,
  normalizeTagName,
  type CollectionItem,
  type CollectionItemInput,
  type CollectionItemUpdate,
  type CollectionQuery,
} from '@conjuros/contracts';
import { AppError } from '../errors';
import type { AttachmentsRepository } from '../repositories/attachments.repository';
import type { ItemsRepository, StoredCollectionItem } from '../repositories/items.repository';
import type { AttachmentStorage } from '../storage/storage';
import type { TagsService } from './tags.service';

export function toPublicItem(item: StoredCollectionItem): CollectionItem {
  const { ownerId, ...publicItem } = item;
  void ownerId;
  return publicItem;
}

export class ItemsService {
  constructor(
    private readonly repository: ItemsRepository,
    private readonly tags: Pick<TagsService, 'assertOwnedTagNames'>,
    private readonly files?: { attachments: AttachmentsRepository; storage: AttachmentStorage | null },
  ) {}

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
    await this.assertOwnedTags(ownerId, input.tags);
    const order = await this.repository.nextOrder(ownerId);
    return toPublicItem(await this.repository.create(ownerId, input, order));
  }

  async update(ownerId: string, id: string, update: CollectionItemUpdate) {
    const current = await this.requireOwned(ownerId, id);
    const kind = update.kind ?? current.kind;
    if (current.storagePath && kind !== 'attachment') {
      throw new AppError(
        409,
        'CONFLICT',
        'Remove the attached file before changing the item type',
      );
    }
    const candidate =
      kind === 'markdown'
        ? markdownUpdateCandidateSchema.parse({
            kind,
            title: update.title ?? current.title,
            description: update.description ?? current.description ?? undefined,
            tags: update.tags ?? current.tags,
            relatedItemIds: update.relatedItemIds ?? current.relatedItemIds,
            content: update.content ?? current.content,
            filename: update.filename ?? current.filename ?? '',
          })
        : kind === 'file'
          ? fileUpdateCandidateSchema.parse({
              kind,
              title: update.title ?? current.title,
              description: update.description ?? current.description ?? undefined,
              tags: update.tags ?? current.tags,
              relatedItemIds: update.relatedItemIds ?? current.relatedItemIds,
              content: update.content ?? current.content,
              filename: update.filename ?? current.filename ?? '',
            })
          : kind === 'attachment'
            ? attachmentUpdateCandidateSchema.parse({
                kind,
                title: update.title ?? current.title,
                description: update.description ?? current.description ?? undefined,
                tags: update.tags ?? current.tags,
                relatedItemIds: update.relatedItemIds ?? current.relatedItemIds,
                filename: update.filename ?? current.filename ?? '',
              })
            : collectionItemInputSchema.parse({
              kind,
              title: update.title ?? current.title,
              description: update.description ?? current.description ?? undefined,
              tags: update.tags ?? current.tags,
              relatedItemIds: update.relatedItemIds ?? current.relatedItemIds,
              ...(kind === 'command'
                ? { command: update.command ?? current.command }
                : { url: update.url ?? current.url }),
            });
    await this.assertRelatedItemsOwned(ownerId, candidate.relatedItemIds);
    await this.assertOwnedTags(ownerId, candidate.tags);
    const textLike = candidate.kind === 'markdown' || candidate.kind === 'file';
    return toPublicItem(await this.repository.replace({
      ...current,
      kind: candidate.kind,
      title: candidate.title,
      description: candidate.description ?? null,
      tags: candidate.tags,
      relatedItemIds: candidate.relatedItemIds,
      command: candidate.kind === 'command' ? candidate.command : null,
      url: candidate.kind === 'web-link' ? candidate.url : null,
      content: textLike ? candidate.content : null,
      filename:
        candidate.kind === 'markdown' ||
        candidate.kind === 'file' ||
        candidate.kind === 'attachment'
          ? candidate.filename || null
          : null,
      storagePath: current.storagePath,
      updatedAt: new Date().toISOString(),
    }));
  }

  async delete(ownerId: string, id: string) {
    const attachment = await this.files?.attachments.findByItem(ownerId, id);
    if (!(await this.repository.delete(id, ownerId))) {
      throw new AppError(404, 'NOT_FOUND', 'Collection item not found');
    }
    if (attachment && this.files?.storage) {
      try {
        await this.files.storage.remove([attachment.objectPath]);
      } catch (error) {
        console.error('Could not remove attachment object from storage', attachment.objectPath, error);
      }
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

  private async assertOwnedTags(ownerId: string, tags: string[]) {
    const normalizedTags = [...new Set(tags.map((tag) => normalizeTagName(tag)))];
    await this.tags.assertOwnedTagNames(ownerId, normalizedTags);
  }
}