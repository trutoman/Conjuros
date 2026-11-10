## 1. Backend verification

- [x] 1.1 Add/confirm tests: categories list ascending by `order`, reorder renumbers contiguously, cross-user reorder returns 404 (in-memory and Postgres repositories)

## 2. Frontend ordering

- [x] 2.1 Sort category groups in `TagList` by `category.order`, uncategorized groups last
- [x] 2.2 Make category titles draggable with drop targets; call `onMoveCategory` with the target order
- [x] 2.3 Add keyboard reordering on category titles and disable it while a search filter is active
- [x] 2.4 Wire `reorder` from `useTagCategories` through `TagsPage`; show an error and restore order on failure

## 3. Styling

- [x] 3.1 Set category title font size to `1rem` and tag pills to `0.7rem` in `src/web/index.css`
- [x] 3.2 Add dragging and drop-target styles for category blocks

## 4. Tests and validation

- [x] 4.1 Add `TagList`/`TagsPage` tests for order rendering, drag reorder, failure handling
- [x] 4.2 Run `npm run check`
