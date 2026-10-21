## MODIFIED Requirements

### Requirement: Markdown card action button opens the viewer

A `markdown` item card SHALL offer a "View markdown" action button in the card's item-actions row, identical in placement and styling to the command "Copy command" and web-link "Open link" action buttons, using an eye icon as its glyph. Clicking it SHALL open the markdown viewer panel for that item as a floating modal above the collection page while the item list remains visible behind it. Only `markdown` items SHALL have this action; command and web-link cards SHALL NOT show it.

#### Scenario: View markdown button appears on markdown cards

- **WHEN** a collection contains a `markdown` item
- **THEN** its card shows a "View markdown" action button with an eye icon in the item-actions row

#### Scenario: View markdown button is absent on other kinds

- **WHEN** a card is for a `command` or `web-link` item
- **THEN** no "View markdown" button is shown

#### Scenario: Markdown card still omits command and web-link actions

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

### Requirement: Markdown item cards render the content

An item card for a `markdown` item SHALL display a "Markdown" type badge with a distinct icon and SHALL show a single-line slug of the item's `content` as the inline content, keeping the card to a single row like command and web-link cards. The slug SHALL be derived from the first non-empty line of `content`, with markdown formatting stripped (headings, emphasis, links, inline code, list markers, images) and whitespace collapsed. A markdown card SHALL NOT offer the command "Copy command" action or the web-link "Open link" action, but SHALL offer the "View markdown" action that opens the markdown viewer. The full `content` SHALL remain stored and editable unchanged.

#### Scenario: Markdown card shows badge and content slug

- **WHEN** a collection contains a `markdown` item
- **THEN** its card shows a "Markdown" type badge
- **AND** the card displays a single-line slug of the item's `content` as the inline content

#### Scenario: Markdown card stays on a single row

- **WHEN** a `markdown` item has multi-line content
- **THEN** the card's inline content shows only the slug of the first non-empty line
- **AND** the card occupies a single row like command and web-link cards

#### Scenario: Slug strips markdown formatting

- **WHEN** the first non-empty line of `content` contains markdown (for example, a heading `# Heading` or emphasis `**bold**`)
- **THEN** the inline content slug shows the plain text without the markdown markers

#### Scenario: Slug skips empty leading lines

- **WHEN** the `content` starts with blank lines before the first non-empty line
- **THEN** the inline content slug is derived from that first non-empty line

#### Scenario: Markdown card omits command and web-link actions only

- **WHEN** a user views a `markdown` item card
- **THEN** no "Copy command" button is shown
- **AND** no "Open link" button is shown
- **AND** each "View markdown" action button is shown

#### Scenario: Full markdown content remains unchanged

- **WHEN** a `markdown` item is edited after its card shows a slug
- **THEN** the full original `content` is still stored and editable

### Requirement: Markdown card offers a Download action

A `markdown` item card SHALL offer a "Download markdown" action button in the card's item-actions row, identical in placement and styling to the other icon-action buttons, using a download icon as its glyph. It SHALL be rendered between the "View markdown" button and the "Item menu" trigger of the card. Clicking it SHALL NOT open the viewer or navigate away; instead it SHALL trigger the browser's standard file-save flow for the item's stored `content` as a UTF-8 Markdown text file (MIME type `text/markdown`), suggesting the item's `filename` as the default file name. When the item has no `filename`, the suggested name SHALL fall back to a name derived from the item `title` (lowercased, with spaces replaced by hyphens) ending in `.md`. Only `markdown` items SHALL render this button; command and web-link cards SHALL NOT show it.

#### Scenario: Download button appears on markdown cards

- **WHEN** a collection contains a `markdown` item
- **THEN** its card shows a "Download markdown" action button with a download icon in the item-actions row
- **AND** the button is positioned between the "View markdown" button and the "Menu item" trigger

#### Scenario: Download button is absent on other kinds

- **WHEN** a card is for a `command` or `web-link` item
- **THEN** no "Download markdown" button is shown

#### Scenario: Clicking Download saves the note as a markdown file

- **WHEN** a user clicks the "Download markdown" action button on a markdown item card
- **THEN** the browser initiates the download of the item's `content` as a Markdown text file
- **AND** the viewer panel does not open
- **AND** the page does not navigate away

#### Scenario: Suggested file name uses the item filename

- **WHEN** a `markdown` item has a `filename` set (for example, `"notes.md"`)
- **THEN** the download suggests `"notes.md"` as the file name

#### Scenario: Suggested file name falls back when the item has no filename

- **WHEN** a `markdown` item has no `filename` (for example, a legacy item) and a title of `"My Ideas"`
- **THEN** the download suggests `"my-ideas.md"` as the file name

## ADDED Requirements

### Requirement: Command cards present the command identity

A `command` item card SHALL display a `Command` type badge using the `command` icon asset and SHALL offer a `Copy command` action that copies the stored command text. The card SHALL NOT use `Spell` as its type label and SHALL NOT read the former `spell` icon key.

#### Scenario: Command card shows the Command badge

- **WHEN** a collection contains a `command` item
- **THEN** its card shows a `Command` type badge
- **AND** the badge renders the `command` icon asset

#### Scenario: Command card copies the command text

- **WHEN** a user activates the `Copy command` action on a command card
- **THEN** the exact stored command text is copied
- **AND** the card reports the copy result
