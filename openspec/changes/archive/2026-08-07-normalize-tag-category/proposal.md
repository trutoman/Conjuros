## Why

Tag categories and tag names are meant to be the same kind of label, but today only tag names are constrained to alphanumeric characters plus dots, trimmed, and lowercased. Categories accept arbitrary text and preserve whatever casing the user typed, so the same category can appear multiple times in the UI (e.g., "General" vs. "general"), producing duplicate-looking groups in the sidebar and inconsistent displays across components.

## What Changes

- Apply the exact same validation and normalization rules used for tag names to tag categories: only alphanumeric characters and dots, trimmed, and lowercased via `toLowerCase()`.
- Enforce these rules everywhere a tag or tag category is added or edited (contracts, API, and frontend forms).
- Normalize tag categories on write so stored category values are always lowercase and trimmed.
- Display every tag name and tag category in lowercase in every frame or component (sidebar, tag management, item cards, forms, search).
- Remove the legacy `General` backfill casing so legacy uncategorized tags resolve to the normalized lowercase `general`.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `tag-management`: Extends tag name validation rules to tag categories, normalizes category values on write, and requires lowercase display of tag names and categories across all components.

## Impact

- `packages/contracts/src/tags.ts` — `tagCategorySchema`, `normalizeTagCategory`, and any shared normalization helpers.
- `src/api/repositories/tags.repository.ts` — legacy `General` backfill value and hydration.
- `src/api/services/tags.service.ts` — category validation/normalization on create and update.
- `src/web/` — TagForm, TagList, Sidebar, ItemForm, CollectionPage, TagsPage: validate/normalize input and render tags and categories in lowercase.
- Existing persisted tags with mixed-case categories ("General", "general", etc.) may need a data migration to a single normalized lowercase category.
- Tests in `src/tests/api/tags.test.ts`, `src/tests/shared/validation.test.ts`, and frontend component tests.
