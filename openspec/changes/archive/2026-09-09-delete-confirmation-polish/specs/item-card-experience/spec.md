## ADDED Requirements

### Requirement: Item menu Delete opens the delete confirmation directly

Activating the Delete action in an item card menu SHALL invoke the delete action immediately (opening the delete confirmation dialog) and close the menu. The menu SHALL NOT show an intermediate inline tick/cross confirm step. Cancelling remains possible through the confirmation dialog's Cancel control (and its backdrop/Escape dismissal), which discards the delete without side effects.

#### Scenario: Delete menu item opens the confirmation dialog

- **WHEN** a user opens an item card menu and activates Delete
- **THEN** the menu closes
- **AND** the delete confirmation dialog opens for that item

#### Scenario: No inline tick/cross step in the menu

- **WHEN** a user opens an item card menu and activates Delete
- **THEN** no inline confirm/cancel controls appear inside the menu

#### Scenario: Cancelling the dialog deletes nothing

- **WHEN** a user cancels the delete confirmation dialog opened from the item menu
- **THEN** the item is unchanged
- **AND** the menu stays closed
