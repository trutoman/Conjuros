## Why

"Manage tags" currently navigates to a standalone `TagsPage` that replaces the entire application shell: the sidebar (tags column) disappears and the view takes the full width, breaking the collection context. The item form and the tag add/edit form already open inline inside the `.main-content-frame` (item-form-fullscreen-mode / tag-form-inline), so the tag management view should follow the same pattern to keep the tags column visible and keep the user in place.

## What Changes

- Clicking "Manage tags" in the sidebar opens the full tag management view (list, reorder, delete, add/edit) inside the `.main-content-frame` div instead of navigating to a standalone page.
- The sidebar tags column remains visible while the management view is open.
- Leaving the management view (e.g., an explicit back/close action, or after Save/Cancel of a tag form) restores the item collection (subheader + list) in the main content frame.
- The content shown in this frame is styled with the same frame style as the "Add tag"/"Edit tag" form (`TagForm`, `.item-form` shared styles): surface card, border, rounded corners, full frame height with scrollable content.
- The standalone `TagsPage` is no longer used for the "Manage tags" action; the inline view replaces it.

## Capabilities

### New Capabilities

<!-- No new capabilities -->

### Modified Capabilities

- `collection-layout-and-navigation`: Tag management view opens inside the `.main-content-frame` instead of navigating to a standalone page, keeping the tags sidebar visible; leaving it returns to the item collection
- `tag-management`: The inline tag management view reuses the frame styling shared with the tag form (`.item-form`) instead of the standalone page styles

## Impact

- `src/web/pages/CollectionPage.tsx`: Add state/rendering for the inline tag management view inside `.main-content-frame`, with an exit path that restores the collection view
- `src/web/components/Sidebar.tsx`: "Manage tags" triggers the inline view instead of `onNavigateToTags`
- `src/web/pages/TagsPage.tsx`: Content merged into the inline view or removed; the page no longer drives the "Manage tags" action
- `src/web/App.tsx`: Remove/stop using the `tags` page navigation for "Manage tags"
- `src/web/index.css`: Apply `.item-form`-style frame styling to the tag management view; ensure full-frame height/scroll behavior
- Tests: `CollectionPage.test.tsx`, `Sidebar.test.tsx`, `TagsPage.test.tsx` and any inline tag tests
