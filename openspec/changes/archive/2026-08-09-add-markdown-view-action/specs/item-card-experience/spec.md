## Purpose

Adds a read-only panel that renders a markdown item's stored `content` as sanitized HTML so users can read the full note from the collection without opening the edit form.

## ADDED Requirements

### Requirement: Markdown card action button opens the viewer

A `markdown` item card SHALL offer a "View markdown" action button in the card's item-actions row, identical in placement and styling to the spell "Copy command" and web-link "Open link" action buttons, using an eye icon as its glyph. Clicking it SHALL open the markdown viewer panel for that item inside the collection item area. Only `markdown` items SHALL have this action; spell and web-link cards SHALL NOT show it.

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
- **THEN** the markdown viewer panel opens for that item inside the collection item area

## MODIFIED Requirements

### Requirement: Markdown item cards render the content

An item card for a `markdown` item SHALL display a "Markdown" type badge with a distinct icon and SHALL show a single-line slug of the item's `content` as the inline content, keeping the card to a single row like spell and web-link cards. The slug SHALL be derived from the first non-empty line of `content`, with markdown formatting stripped (headings, emphasis, links, inline code, list markers, images) and whitespace collapsed. A markdown card SHALL NOT offer the spell "Copy command" action or the web-link "Open link" action, but SHALL offer the "View markdown" action that opens the markdown viewer. The full `content` SHALL remain stored and editable unchanged.

#### Scenario: Markdown card shows content and badge

- **WHEN** a collection contains a `markdown` item
- **THEN** its card shows a "Markdown" type badge
- **AND** the card displays a single-line slug of the item's `content` as the inline content

#### Scenario: Markdown card stays on a single row

- **WHEN** a `markdown` item has multi-line content
- **THEN** the card's inline content shows only the slug of the first non-empty line
- **AND** the card occupies a single row like spell and web-link cards

#### Scenario: Slug strips markdown formatting

- **WHEN** the first non-empty line of `content` contains markdown (for example, a heading `# Heading` or emphasis `**bold**`)
- **THEN** the inline content slug shows the plain text without the markdown markers

#### Scenario: Slug skips empty leading lines

- **WHEN** the `content` starts with blank lines before the first non-empty line
- **THEN** the inline content slug is derived from that first non-empty line

#### Scenario: Markdown card omits spell and web-link actions only

- **WHEN** a user views a `markdown` item card
- **THEN** no "Copy command" button is shown
- **AND** no "Open link" button is shown
- **AND** each "View markdown" action button is shown

#### Scenario: Full markdown content remains unchanged

- **WHEN** a `markdown` item is edited after its card shows a slug
- **THEN** the full stored `content` is still stored and editable