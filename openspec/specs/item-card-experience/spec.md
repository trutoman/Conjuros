# Item Card Experience

## Summary

This capability covers the visual and interactive experience of individual collection items, including card layout, contextual actions, and the primary interaction affordances.

## Requirements

- Item cards must present clear content, title, and type information.
- Users must be able to access the main action and supporting actions without unnecessary friction.
- The interface must remain accessible and keyboard-friendly.
- The visual treatment should support clear feedback for copy, open, edit, and delete actions.

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

### Requirement: Markdown item cards render the content

An item card for a `markdown` item SHALL display a "Markdown" type badge with a distinct icon and SHALL show the item's `content` text as the inline content, matching how spell commands are shown. A markdown card SHALL NOT offer the spell "Copy command" action or the web-link "Open link" action.

#### Scenario: Markdown card shows badge and content

- **WHEN** a collection contains a `markdown` item
- **THEN** its card shows a "Markdown" type badge
- **AND** the card displays the item's `content` text as the inline content

#### Scenario: Markdown card omits kind-specific actions

- **WHEN** a user views a `markdown` item card
- **THEN** no "Copy command" button is shown
- **AND** no "Open link" button is shown
