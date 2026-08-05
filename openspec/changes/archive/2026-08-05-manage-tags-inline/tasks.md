## 1. Inline tag management state in CollectionPage

- [x] 1.1 Add `manageTags` boolean state in `CollectionPage`, plus `deleteTag` and a `saveTag` handler using `tagsState.create`/`tagsState.update` (reuse existing `formTag`)
- [x] 1.2 Extend the `.main-content-frame` condition to render the tag management view first (`manageTags`), then `TagForm`, then `ItemForm`, then the collection view (subheader + list); opening any view clears the others
- [x] 1.3 Render the inline management view as a `.item-form`-styled container with an explicit exit action that sets `manageTags = false` and restores the collection view

## 2. Move tag management content into the frame

- [x] 2.1 Render `TagList` (list + edit + delete + reorder via `tagsState`) inside the management view container, reusing the same handlers as `TagsPage`
- [x] 2.2 Surface an "Add tag" action inside the management view that opens the inline `TagForm` (`formTag = null`)
- [x] 2.3 Wire `DeleteConfirmDialog` for tag deletion within the frame; on Save/Cancel of `TagForm`, return to the management list (not the collection)
- [x] 2.4 Confirm the sidebar "Manage tags" button triggers the inline view (`setManageTags(true)`) instead of `onNavigateToTags`

## 3. Remove standalone navigation for "Manage tags"

- [x] 3.1 Stop routing `onNavigateToTags` to the `tags` page in `App.tsx` and remove the now-unused `tags` page branch/import (unless a test depends on it)
- [x] 3.2 Update `Sidebar.tsx`/`CollectionPage.tsx` prop wiring so "Manage tags" no longer navigates away

## 4. Style the management frame

- [x] 4.1 Ensure the management view uses the `.item-form` shared frame styles (surface, border, rounded corners, full height, scrollable)
- [x] 4.2 Adjust `index.css` only if the inner `TagList`/actions need tweaks to sit correctly in the frame
- [x] 4.3 Confirm the sidebar tags column remains visible while the management view is open

## 5. Test all scenarios

- [x] 5.1 Test opening "Manage tags" hides the item collection and shows the management view as the sole frame content with the sidebar still visible
- [x] 5.2 Test add/edit tag from the management view, returning to the list after Save/Cancel
- [x] 5.3 Test deleting a tag from the management view
- [x] 5.4 Test reorder within the management view
- [x] 5.5 Test the explicit exit action restores the item collection (subheader + list)
- [x] 5.6 Test the item form, tag form, and management view are mutually exclusive (no overlap)
- [x] 5.7 Run existing frontend tests and update `CollectionPage`, `Sidebar`, and `TagsPage` tests as needed; ensure no regressions
