## 1. Backend cascade

- [x] 1.1 Add `TagsService.deleteCategoryWithTags(ownerId, categoryId)`: require owned category, reject `general` with the existing `400`, sequentially delete each member tag via the existing single-tag delete, then delete the (now empty) category
- [x] 1.2 Rewire `DELETE /api/tag-categories/:id` to the cascade method; keep `TagCategoriesService.delete` empty-guard as safety invariant
- [x] 1.3 Update `src/tests/api/tag-categories.test.ts`: non-empty delete now returns `204`, removes member tags, and cleans item tag references; keep `general`-protection (`400`) and empty-delete (`204`) assertions

## 2. Frontend cascade confirmation

- [x] 2.1 Communicate the cascade in the Manage tags category delete confirmation (`CollectionPage.tsx` + `TagsPage.tsx`): state that member tags will also be deleted
- [x] 2.2 Rework frontend delete-failure tests into cascade-success assertions (dialog closes, groups/tags gone, no stale error); keep a dialog-scoped error test for the `general` case
- [x] 2.3 Verify successful cascade refreshes both tags and categories lists with no stale error

## 3. Validation

- [x] 3.1 Run `npm run check` (lint → test → build) and fix regressions
- [x] 3.2 Manually verify: delete a non-empty category from Manage tags deletes its tags then the category, both lists refresh, `general` still refuses
