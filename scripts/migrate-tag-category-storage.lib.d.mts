export const GENERAL_CATEGORY: string;

export interface LegacyTagDoc {
  _id?: unknown;
  id: string;
  ownerId: string;
  tagName?: string;
  tagCategory?: string;
  tagCategoryNormalized?: string;
  [key: string]: unknown;
}

export interface CategoryDoc {
  id: string;
  ownerId: string;
  name?: string;
  nameNormalized?: string;
  tagIds?: string[];
  [key: string]: unknown;
}

export interface MigrationGroup {
  ownerId: string;
  name: string;
  tagIds: string[];
}

export interface EntityToCreate {
  ownerId: string;
  name: string;
}

export interface MigrationPlan {
  owners: string[];
  entitiesToCreate: EntityToCreate[];
  assignments: MigrationGroup[];
  unsetIds: unknown[];
}

export interface MigrationVerification {
  ok: boolean;
  errors: string[];
}

export function normalizeLegacyCategory(value: unknown): string;

export function legacyCategoryOf(tagDoc: LegacyTagDoc): string;

export function planMigration(docs: { tags: LegacyTagDoc[]; categories: CategoryDoc[] }): MigrationPlan;

export function verifyMigration(docs: { tags: LegacyTagDoc[]; categories: CategoryDoc[] }): MigrationVerification;
