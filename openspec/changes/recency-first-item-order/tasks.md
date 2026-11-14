# Tasks

## 1. Manual-position storage

- [x] 1.1 Add the `manuallyOrdered` boolean column (not null, default false) to `collection_items` in `src/api/db/schema.ts`, generate the migration with `npm run db:generate`, and confirm `npm run test -- src/tests/api/items.postgres.test.ts` applies it through PGlite
- [x] 1.2 Extend `StoredCollectionItem` and the in-memory repository with the flag, strip it in `toPublicItem`, and verify an API test asserts item responses expose no manual-position field while the repository keeps it

## 2. Recency-first placement

- [x] 2.1 Change `nextOrder` in both repositories to return the position above the current first item, and verify API and repository tests that a created item is returned first with the previous first item second
- [x] 2.2 Reposition items on save when they are not manually placed (`ItemsService.update` passes the new top order) and keep the stored order when they are; verify tests for both branches, including that a save moves the item above every other item
- [x] 2.3 Mark the moved item as manually placed inside the item reorder path without changing the shared renumbering helper, and verify a test that reordering to position 7, then saving that item, keeps it at position 7

## 3. Push-down and existing expectations

- [x] 3.1 Add tests that a newly created item pushes a manually placed item from position 7 to 8 and that saving another item below it preserves its manual state; verify `npm run test -- src/tests/api/items`
- [x] 3.2 Relax `CollectionItem.order` to any integer, make drag and keyboard reorder send the 1-based target position (`targetIndex + 1`), and update fixtures/mocks that assumed bottom insertion; verify `npm run test -- src/web/pages/__tests__/CollectionPage.test.tsx src/web/components/__tests__/CollectionList.test.tsx src/tests/shared/validation.test.ts` passes

## 4. Verification

- [x] 4.1 Run `npm run check` (lint → test → build) and confirm it passes
- [x] 4.2 Browser smoke test: create an item (appears first), save an old item (moves first), drag an item to position 7 and save it (stays 7), then create another item (the manual one moves to 8)

## Workflow follow-up

- Archive the change with `openspec-archive-change` after review.
