# Tasks

## 1. Wide-viewport sidebar

- [x] 1.1 In `src/web/index.css` remove `max-height: calc(100vh - 4rem)`, `position: sticky`, and `top: 1rem` from `.tags-sidebar`, and change `.sidebar-content` to `overflow-y: visible`; verify with a grep that neither property remains on those selectors and `npm run build` succeeds
- [x] 1.2 Confirm no other rule re-caps the sidebar or re-enables its inner scroll (search for `tags-sidebar`, `sidebar-content`, and `max-height` in the stylesheet); verify the grep output shows only the intended rules

## 2. Narrow drawer

- [x] 2.1 In the `max-width: 768px` block, keep `.app-sidebar .tags-sidebar` at `height: 100vh` and add `overflow-y: auto` so the drawer is the single scrolling surface; verify `npm run test -- src/web/components/__tests__/Sidebar.test.tsx src/web/pages/__tests__/CollectionPage.test.tsx` passes and `npm run build` succeeds

## 3. Verification

- [x] 3.1 Run `npm run check` (lint → test → build) and confirm it passes
- [x] 3.2 Browser check with more than 60 tags on a wide viewport: `.sidebar-content` has `scrollHeight === clientHeight` (no inner overflow), the sidebar renders every category, the window scrollbar reaches the sidebar's end, and the sidebar is not pinned while scrolling; then on a narrow viewport with the drawer open confirm `.tags-sidebar` scrolls as a whole and `.sidebar-content` still does not scroll

## Workflow follow-up

- Archive the change with `openspec-archive-change` after review.
