## Why

Tag categories already carry an `order` and a reorder endpoint, but the "Manage tags" panel ignores it and always sorts categories alphabetically. Users cannot arrange categories the way they arrange items. The panel's typography also lets tag pills compete with category titles.

## What Changes

- The Manage tags panel lists category blocks sorted by their persisted `order` (lowest first, the same criterion as items) instead of by name.
- Users can drag a category block's title up or down to place it above or below other blocks; the move is persisted through the existing `PATCH /api/tag-categories/:id/reorder` endpoint and the remaining categories are renumbered.
- Category titles in the panel use a font size of `1rem`; tag pills use `0.7rem`.
- Backend: no new endpoint or contract change is expected; list/reorder behavior for categories is verified and covered by tests (lowest `order` first, owner-scoped, contiguous renumbering).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `tag-management`: the Manage tags panel orders category blocks by `order`, supports drag-and-drop (and keyboard) reordering of category blocks, and updates the category title and tag pill font sizes.

## Impact

- Frontend: `src/web/components/TagList.tsx`, `src/web/pages/TagsPage.tsx`, `src/web/index.css`, `src/web/hooks/useTagCategories.ts` (already exposes `reorder`).
- Backend: `src/api/repositories/tag-categories.repository.ts` and its service/controller are verified by tests only.
- Tests: `src/web/components/__tests__/TagList.test.tsx`, `src/web/pages/__tests__/TagsPage.test.tsx`, category repository/API tests.
