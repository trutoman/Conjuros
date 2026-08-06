## Why

The tag management view currently looks like a plain list: each tag row shows Edit, Delete, Move up, and Move down text buttons, which is visually inconsistent with the rest of the app and forces many small controls onto the row. Collection items use a cleaner pattern — a three-dot menu for actions and drag-and-drop for ordering. Aligning the tag list with those patterns improves consistency and removes the cluttered button row.

## What Changes

- Restyle the tag list rows to match the item form / add-tag visual language and render each tag as a `tag-filter-pill` colored by the tag's color.
- Remove the inline **Edit**, **Delete**, **Move up**, and **Move down** buttons from each tag row.
- Add the collection item's three-dot dropdown menu to each tag row, exposing **Edit** and **Delete** actions (same behavior as item cards).
- Replace Move up/Move down with drag-and-drop ordering, mirroring the collection list (including its keyboard reorder support).
- Preserve the tag management view's "Manage tags" heading, Add tag action, and DeleteConfirmDialog confirm flow.

## Capabilities

### New Capabilities

- none

### Modified Capabilities

- `tag-management`: the tag list rows use the pill styling, the three-dot dropdown menu replaces the inline action buttons, and drag-and-drop replaces Move up/Move down for ordering.

## Impact

- `src/web/components/TagList.tsx`: rewrite rows to render pill-styled tags, a three-dot menu (Edit/Delete), and drag-and-drop reordering; drop `onMove` button usage or rework props as needed.
- `src/web/index.css`: restyle `.tag-list`/`.tag-panel` to the form/pill language; add tag-list menu and drag affordances.
- `src/web/pages/CollectionPage.tsx` / `src/web/pages/TagsPage.tsx`: adapt `TagList` usage if props change.
- `src/web/components/__tests__/TagList.test.tsx`: update tests for the new menu and drag interactions.
- No API or contract changes.
