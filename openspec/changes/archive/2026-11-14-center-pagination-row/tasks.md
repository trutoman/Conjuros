# Tasks

## 1. Center the pagination group

- [x] 1.1 Change `.collection-pagination` in `src/web/index.css` to center its contents (`justify-content: center`) while keeping the gap and the narrow-viewport wrap, and confirm no other selector overrides the alignment; verify with a grep for `collection-pagination` and a successful `npm run build`
- [x] 1.2 Confirm the counter still precedes the buttons in the rendered row and that the three controls keep their accessible names and disabled states; verify `npm run test -- src/web/components/__tests__/CollectionPagination.test.tsx src/web/pages/__tests__/CollectionPage.test.tsx` passes

## 2. Verification

- [x] 2.1 Run `npm run check` (lint → test → build) and confirm it passes
- [x] 2.2 Browser check with more than 27 items on a wide and a narrow viewport: measure that the group's horizontal midpoint matches the list's midpoint, the counter renders left of the buttons, and a wrapped row stays centered

## Workflow follow-up

- Archive the change with `openspec-archive-change` after review.
