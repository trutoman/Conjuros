## 1. Tag row description layout

- [x] 1.1 In `src/web/index.css`, change `.tag-row-label` to `flex-wrap: nowrap` so the row content stays on a single line
- [x] 1.2 In `src/web/index.css`, update `.tag-description` to render inline and truncate with an ellipsis when it overflows (`flex: 0 1 auto`, `min-width: 0`, `white-space: nowrap`, `overflow: hidden`, `text-overflow: ellipsis`), removing `flex-basis: 100%` and `overflow-wrap: anywhere`

## 2. Tag search box width

- [x] 2.1 In `src/web/index.css`, update `.tag-management-actions .search-field` to `flex: 1 1 auto; min-width: 0` so the tag search box fills the available header width

## 3. Tests

- [x] 3.1 In `src/web/components/__tests__/TagList.test.tsx`, extend the description test to assert the description renders inline (same line) and that the truncation style is applied (e.g., `toHaveStyle` checking `text-overflow: ellipsis`), while remaining absent when empty
- [x] 3.2 In `src/web/pages/__tests__/CollectionPage.manageTags.test.tsx`, add a test asserting the tag search box expands to fill the available header width (e.g., its computed flex style grows to fill available space)

## 4. Validate

- [x] 4.1 Run `npm run check` and confirm lint, tests, and build pass