## ADDED Requirements

### Requirement: No inline tag creation entry point in the sidebar

The sidebar footer SHALL NOT provide an "Add tag" button or any other control that opens the tag creation form from the sidebar. Tag creation SHALL be available only from within the tag management view.

#### Scenario: Sidebar footer shows no tag creation control

- **WHEN** a user views the expanded sidebar footer
- **THEN** no button labeled "Add tag" is present
- **AND** the only tag-related action offered is "Manage tags"

#### Scenario: Tags are created from the tag management view

- **WHEN** a user wants to create a tag
- **THEN** they open the tag management view
- **AND** create the tag using the "Add tag" control in the tag management header

### Requirement: Single heading in the tag management view

The tag management view SHALL render exactly one heading: the "Manage tags" heading of the tag management header. The tags panel SHALL NOT render its own "Tags" heading.

#### Scenario: Tag management view displays a single heading

- **WHEN** a user opens the tag management view
- **THEN** the view shows the "Manage tags" heading from the tag management header
- **AND** no separate "Tags" heading is rendered above the tag list

#### Scenario: Accessible heading structure is preserved

- **WHEN** a user using assistive technology navigates the tag management view
- **THEN** the "Manage tags" heading remains the sole heading that labels the tag list
