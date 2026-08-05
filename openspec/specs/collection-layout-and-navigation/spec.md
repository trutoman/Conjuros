# Collection Layout and Navigation

## Summary

This capability covers the collection shell, sidebar behavior, search and filter placement, and layout adjustments that improve navigation and focus.

## Requirements

- The main collection layout must support a clear shell with sidebar and content regions.
- Tags and collection content must be navigable without rebuilding the full view unnecessarily.
- Search and filter controls must remain discoverable and usable from the main content experience.
- Sidebar collapse and expand behaviors must preserve usability and accessibility.

### Requirement: Full tag management view opens inside the main content frame

When the user activates the "Manage tags" action from the sidebar, the system SHALL display the full tag management view (list, reorder, delete) inside the `.main-content-frame` element, replacing the item collection content but keeping the sidebar tags column visible. This mirrors how the item and tag forms open inline, so the user never leaves the collection shell. When the user exits the management view, the item collection (search subheader + list) SHALL be restored in the main content frame.

#### Scenario: User opens the tag management view

- **WHEN** the user clicks "Manage tags" in the sidebar
- **THEN** the item collection (subheader + list) is replaced in the main content frame
- **AND** the full tag management view is displayed as the only content in the main content frame
- **AND** the sidebar tags column remains visible alongside it

#### Scenario: User exits the tag management view

- **WHEN** the user leaves the tag management view (explicit back action, or Save/Cancel of a tag form)
- **THEN** the tag management view is hidden
- **AND** the item collection (subheader + list) is displayed again in the main content frame

#### Scenario: Tags column remains visible while managing tags

- **WHEN** the tag management view is open
- **THEN** the view must not expand to hide the sidebar tags column
- **AND** the layout must keep the sidebar and the main content frame side by side

### Requirement: Tag form replaces entire main content frame

When adding or editing a tag from within the collection, the tag form SHALL completely replace all content within the `.main-content-frame` element, including the subheader (search box, filters, add item button) and the collection list. This mirrors the item form fullscreen behavior and lets users manage a tag without navigating away from the collection. The standalone tags page remains available for full tag management (list, reorder, delete).

#### Scenario: User opens add tag form from the collection

- **WHEN** the user triggers the inline tag add action from the collection
- **THEN** the subheader (search, filters, add item) is hidden
- **AND** the collection list is hidden
- **AND** the tag creation form is displayed as the only content in the main content frame

#### Scenario: User opens the tag edit form from the collection

- **WHEN** the user triggers an inline tag edit action for an existing tag
- **THEN** the subheader is hidden
- **AND** the collection list is hidden
- **AND** the tag edit form is displayed as the only content in the main content frame with the tag's current values

#### Scenario: User saves a tag from the inline form

- **WHEN** the user fills out the inline tag form and clicks "Save"
- **THEN** the tag is created or updated
- **AND** the form is hidden
- **AND** the subheader is displayed again
- **AND** the collection list is displayed again in the main content frame

#### Scenario: User cancels inline tag form

- **WHEN** the user clicks "Cancel" in the inline tag form
- **THEN** the form is hidden without saving changes
- **AND** the subheader is displayed again
- **AND** the collection list is displayed again in the main content frame
- **AND** any unsaved changes are discarded

### Requirement: Item form replaces entire main content frame

When creating or editing an item, the form SHALL completely replace all content within the `.main-content-frame` element, including the subheader (search box, filters, add button) and the collection list. This provides a focused editing experience with the form as the sole content in the main frame.

#### Scenario: User clicks Add Item button

- **WHEN** the user clicks the "Add Item" button
- **THEN** the subheader (search, filters, add button) is hidden
- **AND** the collection list is hidden
- **AND** the item creation form is displayed as the only content in the main content frame

#### Scenario: User clicks Edit on an item

- **WHEN** the user clicks "Edit" on an existing item
- **THEN** the subheader is hidden
- **AND** the collection list is hidden
- **AND** the item edit form is displayed as the only content in the main content frame with the item's current values

#### Scenario: User saves a new item

- **WHEN** the user fills out the form and clicks "Save"
- **THEN** the item is created
- **AND** the form is hidden
- **AND** the subheader is displayed again
- **AND** the collection list is displayed again in the main content frame

#### Scenario: User saves an edited item

- **WHEN** the user edits an item and clicks "Save"
- **THEN** the item is updated
- **AND** the form is hidden
- **AND** the subheader is displayed again
- **AND** the collection list is displayed again in the main content frame

#### Scenario: User cancels item creation or editing

- **WHEN** the user clicks "Cancel" in the form
- **THEN** the form is hidden without saving changes
- **AND** the subheader is displayed again
- **AND** the collection list is displayed again in the main content frame
- **AND** any unsaved changes are discarded
