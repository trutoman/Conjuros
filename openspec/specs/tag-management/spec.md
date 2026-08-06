# Tag Management

## Summary

This capability covers configurable tags, categories, and ownership-scoped tag usage across items.

## Requirements

- Tags must be configurable per user and associated with the relevant collection items.
- Tag categories must be supported where applicable.
- Tag assignment and validation must remain scoped to the current user.
- Tag-based filtering and search behavior must remain consistent with the collection experience.

### Requirement: Add tag form close button

The Add tag form SHALL provide a borderless floating close button displaying an "X" in the top-right corner of the form. Activating it SHALL dismiss the form and return to the collection view, with the same behavior as the Cancel button.

#### Scenario: Closing the Add tag form

- **WHEN** a user activates the close button on the Add tag form
- **THEN** the form closes
- **AND** the collection view is shown again

#### Scenario: Close button equals Cancel behavior

- **WHEN** a user activates the close button instead of the Cancel button
- **THEN** no tag is saved
- **AND** any typed input is discarded
- **AND** the user returns to the collection view

#### Scenario: Accessible close button

- **WHEN** a user using assistive technology reaches the close button
- **THEN** the button is announced with an accessible label identifying it as the close action for the form

### Requirement: Tag management view close button

The tag management view SHALL replace its text back control ("← Collection") with a borderless floating close button displaying an "X" in the top-right corner of the view. Activating it SHALL dismiss the view and return to the collection view, with the same behavior as the replaced back control.

#### Scenario: Closing the tag management view

- **WHEN** a user activates the close button on the tag management view
- **THEN** the view closes
- **AND** the collection view is shown again

#### Scenario: No unsaved data loss on close

- **WHEN** a user activates the close button on the tag management view
- **THEN** no tag is created or modified
- **AND** the user returns to the collection view

#### Scenario: Accessible tag management close button

- **WHEN** a user using assistive technology reaches the close button on the tag management view
- **THEN** the button is announced with an accessible label identifying it as the close action for the tag management view

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
