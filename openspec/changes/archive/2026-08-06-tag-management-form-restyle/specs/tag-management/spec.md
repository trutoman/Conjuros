## ADDED Requirements

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
