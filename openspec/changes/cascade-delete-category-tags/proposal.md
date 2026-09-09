## Why

Deleting a tag category that still contains tags is rejected with `400 VALIDATION_ERROR "Tag category is not empty"`, forcing users to delete tags one by one before the category can go. The expected default is cascade: deleting a category deletes its tags first, then the category.

## What Changes

- `DELETE /api/tag-categories/:id` on a non-empty category deletes every member tag first (sequentially, reusing the existing single-tag delete semantics including item cleanup), then deletes the category, returning `204`.
- **BREAKING**: deleting a non-empty category no longer returns `400 "Tag category is not empty"`; it succeeds and removes the tags. The `general` category remains protected (still `400`, never deleted).
- The Manage tags delete confirmation communicates the cascade (deleting a category also deletes its N tags) before confirming; on success both the tags and categories lists refresh with no stale error.
- Empty-category delete and all other lifecycle rules (create, rename, reorder, `general` auto-creation) are unchanged.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `tag-category`: category delete lifecycle changes from empty-only to cascade (delete member tags first, then the category); `general` stays non-deletable.
- `tag-management`: Manage tags delete flow confirms the cascade consequence and refreshes both lists on success instead of surfacing a non-empty error.

## Impact

- Affected code: `src/api/services/tag-categories.service.ts` (`delete`), DI wiring in `src/api/app.ts` (category service needs tag-deletion capability), `src/api/controllers/tag-categories.controller.ts` (no shape change, still `204`), `src/web/pages/CollectionPage.tsx` + `src/web/pages/TagsPage.tsx` (confirm dialog copy, list refresh), frontend tests, API tests in `src/tests/api/tag-categories.test.ts`.
- APIs: `DELETE /api/tag-categories/:id` behavior change only (still `204` on success); no contract shape change in `packages/contracts`.
- Dependencies/systems: none; React Query invalidation behavior unchanged (both `tags` and `tag-categories` already invalidated together).
