# Item Card Experience

## Purpose

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

### Requirement: Markdown item cards render the content

An item card for a `markdown` item SHALL display a "Markdown" type badge with a distinct icon and SHALL show a single-line slug of the item's `content` as the inline content, keeping the card to a single row like spell and web-link cards. The slug SHALL be derived from the first non-empty line of `content`, with markdown formatting stripped (headings, emphasis, links, inline code, list markers, images) and whitespace collapsed. A markdown card SHALL NOT offer the spell "Copy command" action or the web-link "Open link" action, but SHALL offer the "View markdown" action that opens the markdown viewer. The full `content` SHALL remain stored and editable unchanged.

#### Scenario: Markdown card shows badge and content slug

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
- **THEN** the full original `content` is still stored and editable

### Requirement: Markdown card offers a Download action

A `markdown` item card SHALL offer a "Download markdown" action button in the card's item-actions row, identical in placement and styling to the other icon-action buttons, using a download icon as its glyph. It SHALL be rendered between the "View markdown" button and the "Item menu" trigger of the card. Clicking it SHALL NOT open the viewer or navigate away; instead it SHALL trigger the browser's standard file-save flow for the item's stored `content` as a UTF-8 Markdown text file (MIME type `text/markdown`), suggesting the item's `filename` as the default file name. When the item has no `filename`, the suggested name SHALL fall back to a name derived from the item `title` (lowercased, with spaces replaced by hyphens) ending in `.md`. Only `markdown` items SHALL render this button; spell and web-link cards SHALL NOT show it.

#### Scenario: Download button appears on markdown cards

- **WHEN** a collection contains a `markdown` item
- **THEN** its card shows a "Download markdown" action button with a download icon in the item-actions row
- **AND** the button is positioned between the "View markdown" button and the "Menu item" trigger

#### Scenario: Download button is absent on other kinds

- **WHEN** a card is for a `spell` or `web-link` item
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

### Requirement: File card uses dedicated action and badge glyphs

A `file` item card SHALL render its three glyphs from stroke-based outline SVGs, consistent with the application's outline icon style. The card badge SHALL use a dedicated document page glyph (a file document with folded corner, `0 0 24 24` viewBox); the "View file" action SHALL use exactly the same eye icon SVG path as the "View markdown" action; and the "Download file" action SHALL use exactly the same download icon SVG path as the "Download markdown" action. The file badge SHALL NOT be the markdown glyph or a merged glyph. The `icon-style` capability supersedes the prior filled-path and `0 -960 960 960` viewBox constraints.

#### Scenario: File badge uses the dedicated document glyph

- **WHEN** a collection contains a `file` item
- **THEN** the card badge renders the dedicated document page outline glyph
- **AND** the badge glyph is not the markdown glyph or a merged glyph

#### Scenario: View file uses the markdown eye glyph

- **WHEN** a card shows a "View file" action button
- **THEN** its SVG path is identical to the "View markdown" action button's eye icon path

#### Scenario: Download file uses the markdown download glyph

- **WHEN** a card shows a "Download file" action button
- **THEN** its SVG path is identical to the "Download markdown" action button's download icon path

