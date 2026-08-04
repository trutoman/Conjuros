## Why

Currently, the item creation form renders below the collection list in the normal document flow, which creates visual clutter and requires scrolling to see the form. Users must navigate away from the collection view context when adding items. Moving the form to replace all content within the main content frame (including subheader and collection list) would provide better focus and a clearer mental model: create/edit mode vs browse mode.

## What Changes

When the user clicks "Add Item" (or edits an item), the form will completely replace all content within the `.main-content-frame` div—including the subheader with search/filters and the collection list. The form will occupy the entire space that `.main-content-frame` currently contains. Clicking Save or Cancel will return the user to the full collection view (subheader + list) they left. This creates a dedicated, focused experience for item creation/editing.

## Capabilities

### New Capabilities
<!-- No new capabilities -->

### Modified Capabilities
- `collection-layout-and-navigation`: Form replaces entire main content frame content (subheader and collection view) when creating or editing items

## Impact

- `src/web/pages/CollectionPage.tsx`: Modify rendering logic to swap between full collection view (subheader + list) and form view within `.main-content-frame`
- `src/web/pages/CollectionPage.css`: Update styles to support form taking full frame space
- `src/web/components/ItemForm.tsx`: May need minor layout adjustments to occupy the full frame
