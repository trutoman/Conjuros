## ADDED Requirements

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