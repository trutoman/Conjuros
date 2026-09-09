## 1. Grouped tag list

- [x] 1.1 Extend `TagList` with a `categories` prop and derive alphabetically ordered groups (seeded from categories so empties appear), preserving each tag's persisted relative order within its group
- [x] 1.2 Render each group with the left-aligned category name header and its tags stacked vertically right-aligned beneath it, reusing the existing tag row, pill, and description truncation
- [x] 1.3 Keep drag-and-drop plus keyboard reorder working on the flattened grouped order via the existing `onMove` API without changing a tag's category on cross-group drops
- [x] 1.4 Apply the header search filter at group level (group visible only when its name or at least one of its tags matches)

## 2. Category action menus

- [x] 2.1 Add a three-dot dropdown menu to each category group header reusing the tag menu pattern, exposing Rename and Delete (no menu actions for `general`)
- [x] 2.2 Wire Rename to a small modal form calling `categoriesState.update` and Delete to the delete-confirmation flow calling `categoriesState.remove`, surfacing backend validation errors through the existing error path

## 3. Page integration

- [x] 3.1 Pass real categories into `TagList` in the `CollectionPage` Manage tags modal and remove its separate empty-categories section
- [x] 3.2 Pass real categories into `TagList` in legacy `TagsPage` and remove its separate empty-categories section

## 4. Tests and validation

- [x] 4.1 Add/extend `TagList` tests: grouping, group layout, empty-category groups, search filtering at group level, category menu actions and `general` protection, reorder without category change
- [x] 4.2 Update page tests (`CollectionPage.manageTags`, `TagsPage`, `TagList`) affected by the grouped layout and the sanctioned category menus
- [x] 4.3 Run `npm run check` and fix resulting failures
