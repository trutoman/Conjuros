## 1. Tag list interaction rewrite

- [x] 1.1 In `src/web/components/TagList.tsx`, render each tag as a `tag-filter-pill` with inline `color`/`borderColor`/`color-mix` background, showing the tag name and compact muted category/color metadata
- [x] 1.2 In `src/web/components/TagList.tsx`, remove the inline Edit, Delete, Move up, and Move down buttons and add a three-dot dropdown menu (reusing `item-menu-wrapper`/`item-menu-dropdown`/`icon-action` markup) exposing Edit and Delete, with at most one menu open at a time
- [x] 1.3 In `src/web/components/TagList.tsx`, add drag-and-drop reordering mirroring `CollectionList` (draggable rows, drag/drop handlers, Alt+ArrowUp/ArrowDown keyboard reorder) that calls `onMove(sourceId, targetOrder)` and keeps focus on the moved row

## 2. Styles

- [x] 2.1 In `src/web/index.css`, restyle `.tag-list`/`.tag-panel` rows to the pill/form visual language, including drag affordances (cursor, drop-target highlight) and the tag row dropdown menu placement

## 3. Page wiring

- [x] 3.1 In `src/web/pages/CollectionPage.tsx` and `src/web/pages/TagsPage.tsx`, adapt `TagList` usage to any changed props while keeping the existing `onMove` persistence and delete-confirm flow

## 4. Tests

- [x] 4.1 In `src/web/components/__tests__/TagList.test.tsx`, update tests to assert pill rendering, the dropdown menu Edit/Delete actions, and drag-and-drop / keyboard reorder calling `onMove`

## 5. Validate

- [x] 5.1 Run `npm run check` and confirm lint, tests, and build pass
