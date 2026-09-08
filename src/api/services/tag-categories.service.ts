import {
  DEFAULT_TAG_CATEGORY,
  normalizeTagCategoryName,
  reorderItemSchema,
  tagCategoryInputSchema,
  tagCategoryQuerySchema,
  tagCategoryUpdateSchema,
  type TagCategory,
  type TagCategoryInput,
  type TagCategoryQuery,
  type TagCategoryUpdate,
} from '@conjuros/contracts';
import { AppError } from '../errors';
import type { StoredTagCategory, TagCategoriesRepository } from '../repositories/tag-categories.repository';

function isGeneral(normalized: string): boolean {
  return normalized === DEFAULT_TAG_CATEGORY;
}

function toPublicTagCategory(category: StoredTagCategory): TagCategory {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    tagIds: [...category.tagIds],
    tagCount: category.tagIds.length,
    order: category.order,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export class TagCategoriesService {
  constructor(private readonly categories: TagCategoriesRepository) {}

  parseQuery(input: unknown): TagCategoryQuery {
    return tagCategoryQuerySchema.parse(input);
  }

  parseCreate(input: unknown): TagCategoryInput {
    return tagCategoryInputSchema.parse(input);
  }

  parseUpdate(input: unknown): TagCategoryUpdate {
    return tagCategoryUpdateSchema.parse(input);
  }

  parseReorder(input: unknown): number {
    return reorderItemSchema.parse(input).order;
  }

  async ensureGeneral(ownerId: string): Promise<TagCategory> {
    const existing = await this.categories.findOwnedByNormalizedName(ownerId, DEFAULT_TAG_CATEGORY);
    if (existing) return toPublicTagCategory(existing);
    const order = await this.categories.nextOrder(ownerId);
    const created = await this.categories.create(ownerId, { name: DEFAULT_TAG_CATEGORY, description: '' }, order);
    return toPublicTagCategory(created);
  }

  async resolveOrCreate(ownerId: string, name: string): Promise<TagCategory> {
    const normalized = normalizeTagCategoryName(name || DEFAULT_TAG_CATEGORY);
    const existing = await this.categories.findOwnedByNormalizedName(ownerId, normalized);
    if (existing) return toPublicTagCategory(existing);
    const order = await this.categories.nextOrder(ownerId);
    const created = await this.categories.create(ownerId, { name: normalized, description: '' }, order);
    return toPublicTagCategory(created);
  }

  async list(ownerId: string, query: TagCategoryQuery) {
    await this.ensureGeneral(ownerId);
    const result = await this.categories.list(ownerId, query);
    return { items: result.items.map(toPublicTagCategory), total: result.total };
  }

  async get(ownerId: string, id: string) {
    const category = await this.requireOwned(ownerId, id);
    return toPublicTagCategory(category);
  }

  async create(ownerId: string, input: TagCategoryInput) {
    const normalized = normalizeTagCategoryName(input.name);
    const existing = await this.categories.findOwnedByNormalizedName(ownerId, normalized);
    if (existing) {
      throw new AppError(409, 'CONFLICT', 'Tag category already exists');
    }
    const order = await this.categories.nextOrder(ownerId);
    const created = await this.categories.create(
      ownerId,
      { name: normalized, description: input.description ?? '' },
      order,
    );
    return toPublicTagCategory(created);
  }

  async update(ownerId: string, id: string, update: TagCategoryUpdate) {
    const current = await this.requireOwned(ownerId, id);
    if (isGeneral(current.nameNormalized)) {
      throw new AppError(400, 'VALIDATION_ERROR', 'The general category cannot be renamed');
    }
    const nextName = update.name ?? current.name;
    const nextNormalized = normalizeTagCategoryName(nextName);
    if (nextNormalized !== current.nameNormalized) {
      const conflicting = await this.categories.findOwnedByNormalizedName(ownerId, nextNormalized);
      if (conflicting && conflicting.id !== id) {
        throw new AppError(409, 'CONFLICT', 'Tag category already exists');
      }
    }
    // Members travel with the entity: no tag documents are touched.
    const updated = await this.categories.replace({
      ...current,
      name: nextNormalized,
      nameNormalized: nextNormalized,
      description: update.description ?? current.description,
      updatedAt: new Date().toISOString(),
    });
    return toPublicTagCategory(updated);
  }

  async delete(ownerId: string, id: string) {
    const category = await this.requireOwned(ownerId, id);
    if (isGeneral(category.nameNormalized)) {
      throw new AppError(400, 'VALIDATION_ERROR', 'The general category cannot be deleted');
    }
    if (category.tagIds.length > 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Tag category is not empty');
    }
    if (!(await this.categories.delete(id, ownerId))) {
      throw new AppError(404, 'NOT_FOUND', 'Tag category not found');
    }
  }

  async reorder(ownerId: string, id: string, order: number) {
    const category = await this.categories.reorder(id, ownerId, order);
    if (!category) throw new AppError(404, 'NOT_FOUND', 'Tag category not found');
    return toPublicTagCategory(category);
  }

  async addTagToCategory(ownerId: string, normalizedName: string, tagId: string): Promise<TagCategory> {
    const resolved = await this.resolveOrCreate(ownerId, normalizedName);
    const updated = await this.categories.addMembers(ownerId, resolved.id, [tagId]);
    if (!updated) throw new AppError(404, 'NOT_FOUND', 'Tag category not found');
    return toPublicTagCategory(updated);
  }

  async moveTagToCategory(ownerId: string, tagId: string, normalizedName: string): Promise<TagCategory> {
    const target = await this.resolveOrCreate(ownerId, normalizedName);
    const current = await this.categories.findOwnedByMemberTag(ownerId, tagId);
    if (current && current.id !== target.id) {
      await this.categories.removeMember(ownerId, current.id, tagId);
    }
    if (!current || current.id !== target.id) {
      const updated = await this.categories.addMembers(ownerId, target.id, [tagId]);
      if (!updated) throw new AppError(404, 'NOT_FOUND', 'Tag category not found');
      return toPublicTagCategory(updated);
    }
    return target;
  }

  async removeTagFromCategories(ownerId: string, tagId: string): Promise<void> {
    const current = await this.categories.findOwnedByMemberTag(ownerId, tagId);
    if (current) {
      await this.categories.removeMember(ownerId, current.id, tagId);
    }
  }

  async categoryNameForTag(ownerId: string, tagId: string): Promise<string | null> {
    const category = await this.categories.findOwnedByMemberTag(ownerId, tagId);
    return category ? category.name : null;
  }

  async categoryNameMap(ownerId: string): Promise<Map<string, string>> {
    const all = await this.categories.findAllOwned(ownerId);
    const map = new Map<string, string>();
    for (const category of all) {
      for (const tagId of category.tagIds) {
        map.set(tagId, category.name);
      }
    }
    return map;
  }

  private async requireOwned(ownerId: string, id: string) {
    const category = await this.categories.findOwned(id, ownerId);
    if (!category) throw new AppError(404, 'NOT_FOUND', 'Tag category not found');
    return category;
  }
}
