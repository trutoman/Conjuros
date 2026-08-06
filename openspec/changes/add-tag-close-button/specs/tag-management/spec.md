## ADDED Requirements

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
The tag management view SHALL replace its text back control ("← Collection") with a borderless floating close button displaying an "X" in the top-left corner of the view. Activating it SHALL dismiss the view and return to the collection view, with the same behavior as the replaced back control.

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
