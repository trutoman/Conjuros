# Tasks

## 1. End-align the settings control

- [x] 1.1 Add the `tags-manage-btn` class to the `Manage tags` button in `src/web/components/Sidebar.tsx` and add `.sidebar-header .tags-manage-btn { margin-left: auto; }` to `src/web/index.css`; verify `npm run build` succeeds and the rule is the only declaration adding an auto left margin in the header
- [x] 1.2 Confirm the header order and accessible names are unchanged and no other selector targets the new class; verify `npm run test -- src/web/components/__tests__/Sidebar.test.tsx` passes

## 2. Verification

- [x] 2.1 Run `npm run check` (lint → test → build) and confirm it passes
- [x] 2.2 Browser check: on a wide viewport the `Manage tags` button's right edge matches the header's right padding edge, the clear button still sits between the tags toggle and the match selector, and switching the sidebar to a narrow drawer keeps the close button rightmost with `Manage tags` immediately before it

## Workflow follow-up

- Archive the change with `openspec-archive-change` after review.
