## 1. Reproduce and lock regression coverage

- [x] 1.1 Add a failing regression test in `CollectionPage` (or its test harness) proving a rejected non-empty category delete renders no `ErrorState` above the main `CollectionList` and keeps lists intact
- [x] 1.2 Extend `TagsPage.test.tsx` (`keeps the view open when deleting a non-empty category fails`) to assert the scoped error is dismissible on dialog cancel and does not render as a first-row ghost entry

## 2. Scope Manage tags delete errors in CollectionPage

- [x] 2.1 Split `actionError` in `src/web/pages/CollectionPage.tsx` into collection vs Manage tags scoped state and route `confirmTagDelete` / `confirmCategoryDelete` failures to the scoped state only
- [x] 2.2 Bind the main-frame `ErrorState` to the collection error and the Manage tags modal / delete dialog to the scoped error; keep the delete dialog open on failure
- [x] 2.3 Clear the scoped error on dialog cancel, `closeManageTags`, and delete success

## 3. Mirror the fix in TagsPage

- [x] 3.1 Apply the same error-state split and scoped rendering in `src/web/pages/TagsPage.tsx`
- [x] 3.2 Verify successful tag/category deletes still refresh `TagList` groups (including empty categories) with no stale error

## 4. Validation

- [x] 4.1 Run `npm run check` (lint → test → build) and fix regressions
- [x] 4.2 Manually verify: delete non-empty category from Manage tags shows scoped error only, dialog stays open, cancel clears it, main list never shows the ghost frame
