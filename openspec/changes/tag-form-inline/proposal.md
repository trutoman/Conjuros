## Why

Adding or editing a tag currently requires leaving the collection: "Manage tags" navigates to the standalone `TagsPage`, breaking focus and forcing a "<- Collection" back-navigation to return. The item form already opens inline, replacing the main content frame exactly like "Add item" does (item-fullscreen-mode). Making the tag form behave the same way keeps the user in the collection context and extends the established fullscreen-form pattern to tags.

## What Changes

- When the user opens the tag form from inside the collection (add new tag or edit a tag), it will completely replace all content within the `.main-content-frame` div — including the subheader with search/filters and the collection list — exactly as "Add item" does for the item form.
- Clicking Save or Cancel will return the user to the full collection view (subheader + list) they left, preserving the search box in its original position.
- The standalone `TagsPage` remains for full tag management (list, reorder, delete). Only the add/edit tag form is surfaced inline within the collection; it is no longer opened by navigating away for that action.

## Capabilities

### New Capabilities

<!-- No new capabilities -->

### Modified Capabilities

- `collection-layout-and-navigation`: Tag form replaces the entire main content frame content (subheader and collection view) when adding or editing a tag from within the collection, mirroring the item form fullscreen behavior

## Impact

- `src/web/pages/CollectionPage.tsx`: Extend rendering logic so the tag form can also swap in within `.main-content-frame`, alongside the existing item-form swap (subheader + list ↔ form view)
- `src/web/components/TagForm.tsx`: No structural change required; it already uses `.item-form` shared styles so it occupies the frame like `ItemForm` (minor layout verification)
- `src/web/pages/CollectionPage.css`: Ensure tag form takes full frame space (same styles as `.item-form` already in place)
- `src/web/components/Sidebar.tsx`: Surface an inline add/edit tag action on the collection page so the tag form opens in place instead of navigating to the standalone tags page