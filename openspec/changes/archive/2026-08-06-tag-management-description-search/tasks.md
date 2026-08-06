## 1. Tag row description

- [x] 1.1 In `src/web/components/TagList.tsx`, render the tag's `description` as a muted secondary line inside each `tag-row`, shown only when the description is non-empty

## 2. Tag management search

- [x] 2.1 In `src/web/pages/CollectionPage.tsx`, add a `tagQuery` state to the manage-tags branch and filter `tagsState.tags` by `tagName`/`tagCategory` before passing to `TagList`
- [x] 2.2 In `src/web/pages/CollectionPage.tsx`, add a `.search-field` search box to the `tag-management-header` (magnifier icon, input, clear button) that updates `tagQuery`, mirroring the collection search field
- [x] 2.3 In `src/web/pages/TagsPage.tsx`, apply the same `tagQuery` filtering and search box to the standalone tags page

## 3. Styles

- [x] 3.1 In `src/web/index.css`, add styles for the `.tag-description` line and ensure the search field lays out cleanly within the `tag-management-header`

## 4. Tests

- [x] 4.1 In `src/web/components/__tests__/TagList.test.tsx`, add a test asserting the description renders when present and is absent when empty
- [x] 4.2 In `src/web/pages/__tests__/CollectionPage.manageTags.test.tsx`, add tests for filtering by name and by category, and clearing the search

## 5. Validate

- [x] 5.1 Run `npm run check` and confirm lint, tests, and build pass
