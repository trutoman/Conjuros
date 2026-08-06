# Collection Layout and Navigation

## Summary

This capability covers the collection shell, sidebar behavior, search and filter placement, and layout adjustments that improve navigation and focus.

## Requirements

- The main collection layout must support a clear shell with sidebar and content regions.
- Tags and collection content must be navigable without rebuilding the full view unnecessarily.
- Search and filter controls must remain discoverable and usable from the main content experience.
- Sidebar collapse and expand behaviors must preserve usability and accessibility.

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
