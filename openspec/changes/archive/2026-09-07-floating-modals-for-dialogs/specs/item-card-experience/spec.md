## MODIFIED Requirements

### Requirement: Markdown card action button opens the viewer

A `markdown` item card SHALL offer a "View markdown" action button in the card's item-actions row, identical in placement and styling to the spell "Copy command" and web-link "Open link" action buttons, using an eye icon as its glyph. Clicking it SHALL open the markdown viewer panel for that item as a floating modal above the collection page while the item list remains visible behind it. Only `markdown` items SHALL have this action; spell and web-link cards SHALL NOT show it.

#### Scenario: View markdown button appears on markdown cards

- **WHEN** a collection contains a `markdown` item
- **THEN** its card shows a "View markdown" action button with an eye icon in the item-actions row

#### Scenario: View markdown button is absent on other kinds

- **WHEN** a card is for a `spell` or `web-link` item
- **THEN** no "View markdown" button is shown

#### Scenario: Markdown card still omits spell and web-link actions

- **WHEN** a user views a `markdown` item card
- **THEN** no "Copy command" button is shown
- **AND** no "Open link" button is shown

#### Scenario: Clicking the button opens the viewer

- **WHEN** a user clicks the "View markdown" action button on a markdown item card
- **THEN** the markdown viewer panel opens for that item as a floating modal
- **AND** the collection subheader and item list remain visible behind the modal backdrop

#### Scenario: Closing the viewer reveals the unchanged list

- **WHEN** the user closes the markdown viewer (backdrop click, Escape, or Close control)
- **THEN** the viewer is removed
- **AND** the same item list state shown before opening is visible again
