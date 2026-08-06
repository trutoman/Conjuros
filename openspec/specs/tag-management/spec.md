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

### Requirement: Tag management rows render as pills

In the tag management view, each tag SHALL render as a `tag-filter-pill` styled element using the tag's color for text and border, with a `color-mix` tinted background, consistent with the sidebar and item form pills. Rows SHALL NOT render inline Edit, Delete, Move up, or Move down buttons.

#### Scenario: Tag renders as a colored pill

- **WHEN** a user opens the tag management view with existing tags
- **THEN** each tag renders as a pill using its tag color for text and border
- **AND** no inline Edit, Delete, Move up, or Move down buttons are shown

### Requirement: Tag actions use a dropdown menu

Each tag row in the tag management view SHALL provide the same three-dot dropdown menu used by collection items, exposing Edit and Delete actions. Selecting Edit SHALL open the tag form for that tag; selecting Delete SHALL initiate the existing delete confirmation flow.

#### Scenario: Edit a tag from the dropdown

- **WHEN** a user opens the three-dot menu on a tag row
- **AND** activates the Edit action
- **THEN** the tag form opens for that tag

#### Scenario: Delete a tag from the dropdown

- **WHEN** a user opens the three-dot menu on a tag row
- **AND** activates the Delete action
- **THEN** the delete confirmation dialog opens for that tag

### Requirement: Tag ordering via drag and drop

Tags in the tag management view SHALL be reorderable by dragging and dropping a tag onto another tag, persisting the new order through the existing tag reorder API. The keyboard reorder interaction used by the collection list SHALL also apply to the tag list.

#### Scenario: Reorder a tag by dragging

- **WHEN** a user drags a tag and drops it on another tag in the tag management view
- **THEN** the tag is moved to the dropped position
- **AND** the new order is persisted

#### Scenario: Reorder a tag by keyboard

- **WHEN** a user focuses a tag row in the tag management view
- **AND** presses the same keyboard shortcut used to reorder collection items
- **THEN** the tag moves to the adjacent position
- **AND** the new order is persisted

### Requirement: Tag management search filters by name and category

The tag management view SHALL provide a search box in its header, visually consistent with the collection search field, that filters the visible tags by tag name and tag category as the user types. The search SHALL be case-insensitive and match when the query appears in the tag name or the tag category.

#### Scenario: Search filters tags by name

- **WHEN** a user types text in the tag management search box
- **AND** the text matches a tag's name
- **THEN** only tags whose name or category contains the text remain visible

#### Scenario: Search filters tags by category

- **WHEN** a user types text in the tag management search box
- **AND** the text matches a tag's category but not its name
- **THEN** the tag remains visible

#### Scenario: Clearing the search shows all tags

- **WHEN** a user clears the tag management search box
- **THEN** all tags are visible again

#### Scenario: No matches shows an empty result

- **WHEN** a user types text that matches no tag name or category
- **THEN** the tag list shows no tags

### Requirement: Tag description renders inline

In the tag management view, each tag row SHALL render the tag description on the same line as the tag name, category, and color. When the description overflows the available row width, it SHALL be truncated with an ellipsis rather than wrapping onto a new line.

#### Scenario: Description fits on the tag row

- **WHEN** a tag has a short description
- **THEN** the description renders on the same line as the tag name, category, and color

#### Scenario: Description overflows the tag row

- **WHEN** a tag has a description longer than the available row width
- **THEN** the description is truncated with an ellipsis
- **AND** no new line is introduced in the tag row

#### Scenario: Tag without a description

- **WHEN** a tag has no description
- **THEN** no description element is rendered in the tag row

### Requirement: Tag search box fills the header width

In the tag management header, the tag search box SHALL stretch to fill all available width, matching the layout of the collection search box.

#### Scenario: Tag search box uses available width

- **WHEN** a user opens the tag management view
- **THEN** the tag search box expands to fill the available header space next to the Add tag control
