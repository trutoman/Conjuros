# Tasks

## 1. Fixed sidebar width

- [x] 1.1 Replace `width: auto` with `width: 280px` on `.app-sidebar` in `src/web/index.css`, keeping `max-width: 280px` and the collapsed `max-width: 70px`; verify with a grep that no other rule sets a content-driven sidebar width and that `npm run build` succeeds
- [x] 1.2 Confirm the mobile drawer rule still sets 280px and that `.tags-sidebar` inherits the parent width; verify `npm run test -- src/web/components/__tests__/Sidebar.test.tsx src/web/pages/__tests__/CollectionPage.test.tsx` passes

## 2. Verification

- [x] 2.1 Run `npm run check` (lint → test → build) and confirm it passes
- [x] 2.2 Browser check with no tags, a short tag list, and more than 40 tags: the expanded sidebar measures 280px in all three cases and the collection column keeps the same left edge; with a long tag name no horizontal scrollbar appears; collapsing gives 70px and expanding returns to 280px; the narrow drawer measures 280px

## Workflow follow-up

- Archive the change with `openspec-archive-change` after review.
