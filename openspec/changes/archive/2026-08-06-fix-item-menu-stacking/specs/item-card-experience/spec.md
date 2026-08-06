## ADDED Requirements

### Requirement: Open item menu stays above sibling cards

When the contextual menu on an item card is open, the card SHALL be raised above all other collection cards so the menu always renders in the foreground. The menu SHALL remain fully visible and its actions operable even when another card is hovered or focused.

#### Scenario: Menu stays on top over a hovered sibling card

- **WHEN** a user opens the contextual menu on an item card
- **AND** the user hovers over a different collection card below it
- **THEN** the open menu remains fully visible
- **AND** the hovered card does not paint over the menu
- **AND** the menu's Edit and Delete actions remain clickable

#### Scenario: Menu stays on top when focus is inside the card

- **WHEN** a user opens the contextual menu on an item card
- **AND** focus moves into the card (e.g., to the menu)
- **THEN** the card's menu-open elevation is applied
- **AND** the menu renders above all sibling cards

#### Scenario: Menu-open elevation does not affect other cards

- **WHEN** a collection card does not have its contextual menu open
- **THEN** the card's hover and focus lift behavior is unchanged
- **AND** sibling cards with an open menu still render above it
