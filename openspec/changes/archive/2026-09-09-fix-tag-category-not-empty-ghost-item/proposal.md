## Why

Deleting a tag or tag category from the Manage tags view surfaces the backend `400 VALIDATION_ERROR "Tag category is not empty"` as a persistent dashed-frame `ErrorState` at the top of both the main collection list and the Manage tags list, where it looks like a ghost first list item. This is not the expected behavior: a scoped delete failure must not pollute unrelated lists.

## What Changes

- Scope Manage tags delete failures (tag and non-empty category) to the Manage tags context; the main collection list SHALL NOT render them.
- Keep the delete confirmation dialog open on failure and surface the error in a scoped, dismissible place tied to that flow (not as a first-row list frame).
- Clear the scoped delete error on dialog close, retry/success, or view close so no ghost entry persists.
- No change to delete lifecycle rules: non-empty categories remain rejected with `400`, `general` remains protected, successful deletes still refresh tags and categories.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `tag-management`: delete-failure error scoping and dismissal in the Manage tags view (no ghost entry in tag list).
- `tag-category`: delete-failure error scoping for non-empty category deletes (error stays in the category delete flow, never in the collection list).

## Impact

- Affected code: `src/web/pages/CollectionPage.tsx` (`actionError`, `confirmTagDelete`, `confirmCategoryDelete`, `ErrorState` placements), `src/web/pages/TagsPage.tsx` (same pattern), `TagList` / `DeleteConfirmDialog` error wiring if adjusted, frontend tests in `src/web/pages/__tests__/` and `src/web/components/__tests__/`.
- APIs: no change (`DELETE /api/tag-categories/:id` still returns `400 VALIDATION_ERROR "Tag category is not empty"`; `DELETE /api/tags/:id` unchanged).
- Dependencies/systems: none; React Query invalidation behavior unchanged.
