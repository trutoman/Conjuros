## Why

Tag documents still carry `tagCategory` and `tagCategoryNormalized` fields, so category membership is stored in two places: on each tag and (derived) in the `TagCategory` entity. This dual source of truth forces every tag read/write to hydrate and reconcile legacy string fields and blocks the "category carries its set of tags" model. A one-shot migration converts the legacy fields into real `TagCategory` entities and then removes the fields from tags.

## What Changes

- One-shot migration `scripts/migrate-tag-category-storage.mjs`: per owner, groups existing tags by normalized legacy category, ensures one `TagCategory` entity per group (plus guaranteed `general`), persists each tag id into its category's `tagIds` set, then `$unset`s `tagCategory` and `tagCategoryNormalized` from every tag document. The script is idempotent, supports `--dry-run`, and ends with a verification pass (zero tags with legacy fields, every tag id in exactly one category).
- `TagCategory.tagIds` becomes the single source of truth for membership (stored, not derived by querying tags).
- Tag reads/writes stop using the legacy fields: repositories drop `hydrateTag` reconciliation, `TagsService` resolves membership through the categories service, and public tag payloads keep exposing a derived `tagCategory` resolved from membership (no **BREAKING** API change, no frontend change).
- The legacy `scripts/backfill-tag-categories.mjs` (entity creation without field removal) is superseded by the new script.

## Capabilities

### New Capabilities

- `tag-category-migration`: one-shot storage migration converting legacy per-tag category strings into `TagCategory` entities with stored membership, removing the legacy fields, with idempotency, dry-run, verification, and rollback guidance.

### Modified Capabilities

- `tag-management`: tag category validation/normalization now persists membership in the `TagCategory` entity instead of on the tag; legacy-field hydration rules are replaced by the migration end-state (tags carry no category fields, `general` membership is stored).

## Impact

- Affected code: `packages/contracts` (stored tag shape drops category fields; `TagCategory.tagIds` persisted), `src/api/repositories/tags.repository.ts` + `tag-categories.repository.ts` (both InMemory and Mongo), `src/api/services/tags.service.ts` + `tag-categories.service.ts` (membership writes move to categories), new `scripts/migrate-tag-category-storage.mjs`.
- Data: destructive field removal on `tags` (`$unset`) — requires backup before running; rollback is restore-from-backup (documented in the script header and design).
- APIs/frontend: unchanged payloads (`tagCategory` still present in responses, now derived); no frontend changes expected.
- Ordering dependency: archive `tag-category-entity` before this change so `tag-category` exists in main specs (see design.md).
