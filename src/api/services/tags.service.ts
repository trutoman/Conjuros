import {
  normalizeTagName,
  reorderItemSchema,
  tagInputSchema,
  tagQuerySchema,
  tagUpdateSchema,
  type Tag,
  type TagInput,
  type TagQuery,
  type TagUpdate,
} from '@conjuros/contracts';
import { AppError } from '../errors';
import type { ItemsRepository } from '../repositories/items.repository';
import type { StoredTag, TagsRepository } from '../repositories/tags.repository';

function toPublicTag(tag: StoredTag): Tag {
  const { ownerId, tagNameNormalized, ...publicTag } = tag;
  void ownerId;
  void tagNameNormalized;
  return publicTag;
}

export class TagsService {
  constructor(
    private readonly tags: TagsRepository,
    private readonly items: ItemsRepository,
  ) {}

  parseQuery(input: unknown): TagQuery {
    return tagQuerySchema.parse(input);
  }

  parseCreate(input: unknown): TagInput {
    return tagInputSchema.parse(input);
  }

  parseUpdate(input: unknown): TagUpdate {
    return tagUpdateSchema.parse(input);
  }

  parseReorder(input: unknown): number {
    return reorderItemSchema.parse(input).order;
  }

  async list(ownerId: string, query: TagQuery) {
    const result = await this.tags.list(ownerId, query);
    return { items: result.items.map(toPublicTag), total: result.total };
  }

  async get(ownerId: string, id: string) {
    const tag = await this.requireOwned(ownerId, id);
    return toPublicTag(tag);
  }

  async create(ownerId: string, input: TagInput) {
    const normalized = normalizeTagName(input.tagName);
    await this.assertUnique(ownerId, normalized);
    const order = await this.tags.nextOrder(ownerId);
    const created = await this.tags.create(ownerId, input, order);
    return toPublicTag(created);
  }

  async update(ownerId: string, id: string, update: TagUpdate) {
    const current = await this.requireOwned(ownerId, id);
    const nextTagName = update.tagName ?? current.tagName;
    const nextNormalized = normalizeTagName(nextTagName);

    if (nextNormalized !== current.tagNameNormalized) {
      await this.assertUnique(ownerId, nextNormalized, id);
    }

    const updated = await this.tags.replace({
      ...current,
      tagName: nextTagName,
      tagNameNormalized: nextNormalized,
      description: update.description ?? current.description,
      color: update.color ?? current.color,
      updatedAt: new Date().toISOString(),
    });

    if (nextNormalized !== current.tagNameNormalized) {
      await this.items.renameTagForOwnerItems(ownerId, current.tagNameNormalized, nextNormalized);
    }

    return toPublicTag(updated);
  }

  async delete(ownerId: string, id: string) {
    const tag = await this.requireOwned(ownerId, id);
    await this.items.removeTagFromOwnerItems(ownerId, tag.tagNameNormalized);
    if (!(await this.tags.delete(id, ownerId))) {
      throw new AppError(404, 'NOT_FOUND', 'Tag not found');
    }
  }

  async reorder(ownerId: string, id: string, order: number) {
    const tag = await this.tags.reorder(id, ownerId, order);
    if (!tag) throw new AppError(404, 'NOT_FOUND', 'Tag not found');
    return toPublicTag(tag);
  }

  async assertOwnedTagNames(ownerId: string, tagNamesNormalized: string[]) {
    if (tagNamesNormalized.length === 0) return;
    const uniqueTagNames = [...new Set(tagNamesNormalized)];
    const owned = await this.tags.findOwnedByNormalizedNames(ownerId, uniqueTagNames);
    if (owned.length !== uniqueTagNames.length) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Tags must belong to the current user');
    }
  }

  private async assertUnique(ownerId: string, normalizedName: string, currentId?: string) {
    const existing = await this.tags.findOwnedByNormalized(ownerId, normalizedName);
    if (existing && existing.id !== currentId) {
      throw new AppError(409, 'CONFLICT', 'Tag name already exists');
    }
  }

  private async requireOwned(ownerId: string, id: string) {
    const tag = await this.tags.findOwned(id, ownerId);
    if (!tag) throw new AppError(404, 'NOT_FOUND', 'Tag not found');
    return tag;
  }
}
