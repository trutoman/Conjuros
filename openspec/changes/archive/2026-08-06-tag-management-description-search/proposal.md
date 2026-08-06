## Why

Tags can carry a description, but the tag management view does not show it — only the pill, category, and color hex are displayed per row. Users have no way to identify tags by their description without opening the edit form. Additionally, the manage tags view has no search, so finding a tag in a large list requires scrolling.

## What Changes

- Show each tag's description inside its `tag-row` in the tag management view, as a muted secondary line under the tag label.
- Add a search box to the `tag-management-header`, visually identical to the collection list search field, that filters the tag list by tag name and tag category as the user types.
- Add a clear button to the search box that empties the query, mirroring the collection search field.
- Preserve the existing row interactions (pill rendering, dropdown menu, drag-and-drop reorder).

## Capabilities

### New Capabilities

- none

### Modified Capabilities

- `tag-management`: tag rows display their description, and the tag management view provides a search box that filters tags by name and category.

## Impact

- `src/web/components/TagList.tsx`: render `tag.description` in each row.
- `src/web/pages/CollectionPage.tsx`: add the search box to the `tag-management-header` and pass a `filter`/`query` value to `TagList`, or filter `tagsState.tags` before passing to `TagList`.
- `src/web/pages/TagsPage.tsx`: apply the same filtering if it renders `TagList`.
- `src/web/index.css`: minor styles for the tag description line and search field placement inside the management header.
- `src/web/components/__tests__/TagList.test.tsx` and `src/web/pages/__tests__/CollectionPage.manageTags.test.tsx`: update/extend tests.
- No API or contract changes; the tag `description` field already exists in the contract.
