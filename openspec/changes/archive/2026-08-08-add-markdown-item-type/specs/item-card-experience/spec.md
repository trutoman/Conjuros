## ADDED Requirements

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
