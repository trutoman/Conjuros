## ADDED Requirements

### Requirement: Item form tag selector sits below the command field

In the item form, the tag selector SHALL render after the Command/URL field and before the action buttons. The visible field order SHALL be: item type selector, Title, Description, Command/URL, tag selector, action buttons.

#### Scenario: Add form shows command field above tags

- **WHEN** a user opens the Add item form
- **THEN** the Command/URL field renders above the tag selector
- **AND** the tag selector renders directly above the action buttons

#### Scenario: Edit form shows command field above tags

- **WHEN** a user opens the Edit item form
- **THEN** the Command/URL field renders above the tag selector
- **AND** the tag selector renders directly above the action buttons
