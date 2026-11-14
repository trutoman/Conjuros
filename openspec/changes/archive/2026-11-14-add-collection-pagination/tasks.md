# Tasks

## 1. Page-size bound in contracts

- [x] 1.1 Add `MAX_PAGE_SIZE = 27` to `packages/contracts` and use it as `.max(MAX_PAGE_SIZE)` in `collectionQuerySchema`, `tagQuerySchema`, `tagCategoryQuerySchema`, and `themeQuerySchema`, keeping `.default(25)`; verify with contract tests that `limit=27` parses and `limit=0`, `limit=28`, and `limit=50` fail for each schema
- [x] 1.2 Update existing API tests and fixtures that request `limit: 50` (items, themes, tag palette, theme service) to the new maximum; verify `npm run test` passes for `src/tests/api`
- [x] 1.3 Update the pagination note in `AGENTS.md` to state the real default (25) and maximum (27); verify the text matches `packages/contracts/src/items.ts`

## 2. Collection paging state

- [x] 2.1 Extend `useCollectionFilters` with a 1-based `page`, a `PAGE_SIZE` derived from `MAX_PAGE_SIZE`, `skip = (page - 1) * PAGE_SIZE` in `query`, and a `setFilters` wrapper that resets `page` to 1 on every filter change; verify with a new hook test that page 2 produces `skip=27` and that changing search, type, tags, or match mode resets `skip` to 0
- [x] 2.2 Clamp the page to `max(1, ceil(total / PAGE_SIZE))` when `total` shrinks, and add `keepPreviousData` placeholder to `useCollection` so a page change does not clear the list; verify with a `CollectionPage` test that deleting the only item of the last page lands on the previous page
- [x] 2.3 Render the API page directly in `CollectionPage` (remove the redundant `visibleItems` client filter) and update the collection page tests that depended on client-side filtering; verify the search test asserts the request/response path and that `npm run test` passes for `src/web/pages/__tests__/CollectionPage*.test.tsx`

## 3. Pagination controls and counter

- [x] 3.1 Add `src/web/components/CollectionPagination.tsx` rendering `Showing X–Y of N items`, a disabled `Previous page` button on the first page, and a disabled `Next page` button on the last page, and rendering nothing while loading, on error, or when `total === 0`; verify with a component test covering the counter text, both disabled boundaries, the zero-result case, and keyboard activation
- [x] 3.2 Wire the component into `CollectionPage` above the list, moving `skip` by one page on activation while keeping filters and sidebar intact; verify page tests that `Next` requests `skip=27`, `Previous` returns to `skip=0`, and the counter reads `Showing 28–54 of 60 items` on the second page
- [x] 3.3 Style the pagination bar in `src/web/index.css` consistent with the existing collection header controls; verify the styles do not break the mobile layout (narrow-viewport collection tests pass and `npm run build` succeeds)

## 4. Complete lists keep all entries

- [x] 4.1 Add a `collectPages` helper in `src/web/lib` that accepts a page fetcher, requests `MAX_PAGE_SIZE` rows at a time, and stops at `total` or an empty page; verify with a unit test for a multi-page list and for a fetcher that returns fewer rows than expected
- [x] 4.2 Replace the inline loop in `useThemes` and add the same aggregation to `useTags` and `useTagCategories`; verify with a hook or page test that 40 tags, 30 categories, and 30 themes still render completely when each request returns at most 27 rows

## 5. Integration verification

- [x] 5.1 Run `npm run check` (lint → test → build) and confirm it passes
- [x] 5.2 Smoke test with more than 27 items: the counter shows the active range, `Previous`/`Next` move one page, changing a filter returns to page 1, deleting the last item of the last page moves back one page, and no request sends `limit` above 27

## Workflow follow-up

- Archive the change with `openspec-archive-change` after review.
- Regenerate the main `collection-pagination` spec from the archived delta and verify with `openspec validate --strict`.
