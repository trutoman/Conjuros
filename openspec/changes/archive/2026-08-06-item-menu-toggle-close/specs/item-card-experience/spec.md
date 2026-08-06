## ADDED Requirements

### Requirement: Item menu toggles closed on its own trigger

When the contextual menu on an item card is open, clicking the same "Item menu" trigger SHALL close the menu and return focus to the trigger. The menu-open elevation SHALL be removed when the menu closes.

#### Scenario: Second click on the same trigger closes the menu

- **WHEN** a user opens the contextual menu on an item card
- **AND** the user clicks the same "Item menu" trigger again
- **THEN** the menu is closed
- **AND** focus returns to the trigger

#### Scenario: Menu-open elevation is removed on close

- **WHEN** a user closes an open item menu by clicking its trigger again
- **THEN** the card no longer has the menu-open elevation

### Requirement: Only one item menu open at a time

The collection SHALL allow at most one item contextual menu to be open at any time. Opening a menu on one item card SHALL close any other open item menu.

#### Scenario: Opening a second menu closes the first

- **WHEN** a user opens the contextual menu on one item card
- **AND** the user opens the contextual menu on a different item card
- **THEN** the first card's menu is closed
- **AND** only the second card's menu remains open

#### Scenario: Opening the same menu again keeps it as the only open menu

- **WHEN** a user opens the contextual menu on an item card that is already the only open menu
- **AND** the user clicks its trigger again
- **THEN** the menu is closed
- **AND** no other item menu is open
