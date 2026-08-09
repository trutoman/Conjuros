## ADDED Requirements

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