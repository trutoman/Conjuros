## ADDED Requirements

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