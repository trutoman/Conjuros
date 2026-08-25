## ADDED Requirements

### Requirement: Add tag button style and position

The tag management header's "Add tag" control SHALL render as an icon-style button using the same `+` icon used by the collection "Add item" button, instead of plain text. The button SHALL be positioned at the left of the tag management header, before the "Manage tags" heading, and the tag search box SHALL follow after the heading.

#### Scenario: Add tag button uses an add icon

- **WHEN** a user opens the tag management view
- **THEN** the "Add tag" control in the header displays a `+` icon
- **AND** the control does not render a plain text label

#### Scenario: Add tag button is left aligned

- **WHEN** a user opens the tag management view
- **THEN** the "Add tag" button is the first element at the left of the tag management header
- **AND** the "Manage tags" heading appears to its right
- **AND** the tag search box appears after the heading

#### Scenario: Add tag button remains accessible

- **WHEN** a user using assistive technology reaches the "Add tag" control in the tag management header
- **THEN** the control is announced with an accessible label identifying it as the action to add a tag
