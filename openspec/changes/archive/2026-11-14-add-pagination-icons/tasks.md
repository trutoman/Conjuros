# Tasks

## 1. Pagination icons in the icon catalogue

- [x] 1.1 Add `previous-page`, `next-page`, and `last-page` to `iconAssetKeys` in `packages/contracts/src/theme.ts` and their outline paths to `ICON_ASSETS` in `src/web/lib/iconAssets.ts`; verify a contract test accepts a 27-key `iconAssets` record and rejects an unknown key
- [x] 1.2 Update the theme API tests that assert the exact icon key set and the seeded/backfilled record (including the legacy-array and active-theme cases) to expect the three new keys; verify `npm run test -- src/tests/api/themes` passes with each new key carrying a non-empty `path` and `viewBox`
- [x] 1.3 Confirm `ThemeForm` renders editable fields for the new keys and add an assertion to its test; verify the theme form test lists `previous-page`, `next-page`, and `last-page` inputs

## 2. Icon controls and last-page jump

- [x] 2.1 Add an `onLast` prop to `CollectionPagination` and render `Previous`, `Next`, and `Last` as icon-only buttons using `ThemeIcon` with `previous-page`, `next-page`, and `last-page`, keeping the `aria-label`s and disabling `Last` on the last page; verify component tests for the three accessible names, the disabled boundaries (first page, last page, single page), and each click callback
- [x] 2.2 Pass `onLast` from `CollectionPage` with the target page `max(1, ceil(total / pageSize))`; verify a page test where activating `Last` on a 60-item collection requests `skip=54` and leaves `Next` and `Last` disabled
- [x] 2.3 Render the pagination row after `CollectionList` instead of before it; verify a page test asserting the pagination element follows the last item card in DOM order and that it is still absent while empty, loading, or in error

## 3. Styling the icon-only row

- [x] 3.1 Update `src/web/index.css` so the pagination row sits below the list with the range on one side and three square icon buttons on the other, wrapping cleanly on narrow viewports; verify the narrow-viewport collection tests pass and `npm run build` succeeds

## 4. Integration verification

- [x] 4.1 Run `npm run check` (lint → test → build) and confirm it passes
- [x] 4.2 Smoke test in the browser with more than 27 items and both bundled themes: the row renders below the last card, `Previous`/`Next`/`Last` render the theme's icons (icons change when the theme changes), `Last` jumps to the final page, and no pagination element appears above the list

## Workflow follow-up

- Archive the change with `openspec-archive-change` after review.
- Verify the archived specs with `openspec validate --strict`.
