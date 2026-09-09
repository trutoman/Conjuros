import {
  DEFAULT_TAG_CATEGORY,
  normalizeTagCategory,
  normalizeTagCategoryName,
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
import type { ThemesService } from './themes.service';
import type { TagCategoriesService } from './tag-categories.service';

function toPublicTag(tag: StoredTag, tagCategory: string): Tag {
  const { ownerId, tagNameNormalized, ...rest } = tag;
  void ownerId;
  void tagNameNormalized;
  return { ...rest, tagCategory };
}

function matchesQuery(tag: Tag, query: TagQuery): boolean {
  if (!query.search) return true;
  const value = query.search.toLowerCase();
  return [tag.tagName, tag.description, tag.tagCategory].join(' ').toLowerCase().includes(value);
}

function compareTags(left: Tag, right: Tag, sort: TagQuery['sort']) {
  if (sort === 'tagName') return left.tagName.localeCompare(right.tagName);
  if (sort === 'tagCategory') return left.tagCategory.localeCompare(right.tagCategory);
  if (sort === 'updatedAt') return right.updatedAt.localeCompare(left.updatedAt);
  return left.order - right.order;
}

export class TagsService {
  constructor(
    private readonly tags: TagsRepository,
    private readonly items: ItemsRepository,
    private readonly themes: ThemesService | null,
    private readonly categories: TagCategoriesService,
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
    const [tags, nameByTagId] = await Promise.all([
      this.tags.findAllOwned(ownerId),
      this.categories.categoryNameMap(ownerId),
    ]);
    const enriched = tags.map((tag) =>
      toPublicTag(tag, nameByTagId.get(tag.id) ?? DEFAULT_TAG_CATEGORY),
    );
    const matching = enriched
      .filter((tag) => matchesQuery(tag, query))
      .sort((left, right) => compareTags(left, right, query.sort));
    return { items: matching.slice(query.skip, query.skip + query.limit), total: matching.length };
  }

  async get(ownerId: string, id: string) {
    const tag = await this.requireOwned(ownerId, id);
    const category = (await this.categories.categoryNameForTag(ownerId, id)) ?? DEFAULT_TAG_CATEGORY;
    return toPublicTag(tag, category);
  }

  async create(ownerId: string, input: TagInput) {
    const normalizedName = normalizeTagName(input.tagName);
    const normalizedCategory = normalizeTagCategory(input.tagCategory ?? DEFAULT_TAG_CATEGORY);
    // Uniqueness is checked before creating anything so failed writes leave no residue.
    await this.assertUnique(ownerId, normalizedName, normalizedCategory);
    await this.assertPaletteColor(ownerId, input.color);
    const order = await this.tags.nextOrder(ownerId);
    const created = await this.tags.create(
      ownerId,
      { tagName: input.tagName, description: input.description, color: input.color },
      order,
    );
    await this.categories.addTagToCategory(ownerId, normalizedCategory, created.id);
    return toPublicTag(created, normalizedCategory);
  }

  async update(ownerId: string, id: string, update: TagUpdate) {
    const current = await this.requireOwned(ownerId, id);
    const currentCategory =
      (await this.categories.categoryNameForTag(ownerId, id)) ?? DEFAULT_TAG_CATEGORY;
    const nextTagName = update.tagName ?? current.tagName;
    const nextTagCategory = update.tagCategory ?? currentCategory;
    const nextNormalized = normalizeTagName(nextTagName);
    const nextNormalizedCategory = normalizeTagCategory(nextTagCategory);
    const currentNormalizedCategory = normalizeTagCategory(currentCategory);

    if (nextNormalized !== current.tagNameNormalized || nextNormalizedCategory !== currentNormalizedCategory) {
      await this.assertUnique(ownerId, nextNormalized, nextNormalizedCategory, id);
    }
    if (update.color !== undefined) {
      await this.assertPaletteColor(ownerId, update.color);
    }
    if (nextNormalizedCategory !== currentNormalizedCategory) {
      await this.categories.moveTagToCategory(ownerId, id, nextNormalizedCategory);
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

    return toPublicTag(updated, nextNormalizedCategory);
  }

  async delete(ownerId: string, id: string) {
    const tag = await this.requireOwned(ownerId, id);
    await this.categories.removeTagFromCategories(ownerId, id);
    await this.items.removeTagFromOwnerItems(ownerId, tag.tagNameNormalized);
    if (!(await this.tags.delete(id, ownerId))) {
      throw new AppError(404, 'NOT_FOUND', 'Tag not found');
    }
  }

  async deleteCategoryWithTags(ownerId: string, categoryId: string) {
    const category = await this.categories.get(ownerId, categoryId);
    if (normalizeTagCategoryName(category.name) === DEFAULT_TAG_CATEGORY) {
      throw new AppError(400, 'VALIDATION_ERROR', 'The general category cannot be deleted');
    }
    for (const tagId of [...category.tagIds]) {
      await this.delete(ownerId, tagId);
    }
    await this.categories.delete(ownerId, categoryId);
  }

  async reorder(ownerId: string, id: string, order: number) {
    const tag = await this.tags.reorder(id, ownerId, order);
    if (!tag) throw new AppError(404, 'NOT_FOUND', 'Tag not found');
    const category = (await this.categories.categoryNameForTag(ownerId, id)) ?? DEFAULT_TAG_CATEGORY;
    return toPublicTag(tag, category);
  }

  async assertOwnedTagNames(ownerId: string, tagNamesNormalized: string[]) {
    if (tagNamesNormalized.length === 0) return;
    const uniqueTagNames = [...new Set(tagNamesNormalized)];
    const owned = await this.tags.findOwnedByNormalizedNames(ownerId, uniqueTagNames);
    if (owned.length !== uniqueTagNames.length) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Tags must belong to the current user');
    }
  }

  private async assertUnique(
    ownerId: string,
    normalizedName: string,
    normalizedCategory: string,
    currentId?: string,
  ) {
    const [candidates, nameByTagId] = await Promise.all([
      this.tags.findOwnedByNormalizedNames(ownerId, [normalizedName]),
      this.categories.categoryNameMap(ownerId),
    ]);
    const conflict = candidates.find(
      (candidate) => candidate.id !== currentId && nameByTagId.get(candidate.id) === normalizedCategory,
    );
    if (conflict) {
      throw new AppError(409, 'CONFLICT', 'Tag name and category already exist');
    }
  }

  private async requireOwned(ownerId: string, id: string) {
    const tag = await this.tags.findOwned(id, ownerId);
    if (!tag) throw new AppError(404, 'NOT_FOUND', 'Tag not found');
    return tag;
  }

  private async assertPaletteColor(ownerId: string, color: string) {
    if (!this.themes) return;
    await this.themes.assertTagColorInPalette(ownerId, color);
  }
}
