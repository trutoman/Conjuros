// Pure, testable helpers for scripts/migrate-tag-category-storage.mjs.
// These functions operate on plain tag/category documents and perform no I/O.

export const GENERAL_CATEGORY = 'general';

export function normalizeLegacyCategory(value) {
  return (value ?? GENERAL_CATEGORY).trim().toLowerCase() || GENERAL_CATEGORY;
}

export function legacyCategoryOf(tagDoc) {
  return normalizeLegacyCategory(tagDoc.tagCategory ?? tagDoc.tagCategoryNormalized);
}

function ownerKey(ownerId, category) {
  return `${ownerId}\0${category}`;
}

/**
 * Builds the migration plan from plain tag/category documents.
 * Tag docs need { id, ownerId, tagCategory?, tagCategoryNormalized?, _id? }.
 * Category docs need { id, ownerId, name?, nameNormalized?, tagIds? }.
 */
export function planMigration({ tags, categories }) {
  const existingByOwner = new Map();
  for (const category of categories) {
    const ownerId = category.ownerId;
    const name = normalizeLegacyCategory(category.name ?? category.nameNormalized);
    if (!existingByOwner.has(ownerId)) existingByOwner.set(ownerId, new Set());
    existingByOwner.get(ownerId).add(name);
  }

  const groups = new Map();
  const owners = new Set();
  const unsetIds = [];
  for (const tag of tags) {
    owners.add(tag.ownerId);
    const category = legacyCategoryOf(tag);
    const key = ownerKey(tag.ownerId, category);
    if (!groups.has(key)) groups.set(key, { ownerId: tag.ownerId, name: category, tagIds: [] });
    groups.get(key).tagIds.push(tag.id);
    if (tag.tagCategory !== undefined || tag.tagCategoryNormalized !== undefined) {
      unsetIds.push(tag._id ?? tag.id);
    }
  }
  for (const ownerId of owners) {
    const key = ownerKey(ownerId, GENERAL_CATEGORY);
    if (!groups.has(key)) groups.set(key, { ownerId, name: GENERAL_CATEGORY, tagIds: [] });
  }

  const entitiesToCreate = [];
  for (const group of groups.values()) {
    const existing = existingByOwner.get(group.ownerId);
    if (!existing || !existing.has(group.name)) {
      entitiesToCreate.push({ ownerId: group.ownerId, name: group.name });
      if (!existingByOwner.has(group.ownerId)) existingByOwner.set(group.ownerId, new Set());
      existingByOwner.get(group.ownerId).add(group.name);
    }
  }

  return {
    owners: [...owners],
    entitiesToCreate,
    assignments: [...groups.values()],
    unsetIds,
  };
}

/**
 * Verifies the post-migration end state. Returns { ok, errors }.
 */
export function verifyMigration({ tags, categories }) {
  const errors = [];

  for (const tag of tags) {
    if (tag.tagCategory !== undefined || tag.tagCategoryNormalized !== undefined) {
      errors.push(`tag ${tag.id} still carries legacy category fields`);
    }
  }

  const membershipsByOwner = new Map();
  for (const category of categories) {
    const name = normalizeLegacyCategory(category.name ?? category.nameNormalized);
    for (const tagId of category.tagIds ?? []) {
      const key = ownerKey(category.ownerId, tagId);
      if (!membershipsByOwner.has(key)) membershipsByOwner.set(key, []);
      membershipsByOwner.get(key).push(name);
    }
  }

  for (const tag of tags) {
    const found = membershipsByOwner.get(ownerKey(tag.ownerId, tag.id)) ?? [];
    if (found.length === 0) {
      errors.push(`tag ${tag.id} is missing from every category`);
    } else if (found.length > 1) {
      errors.push(`tag ${tag.id} appears in multiple categories: ${found.join(', ')}`);
    }
  }

  return { ok: errors.length === 0, errors };
}
