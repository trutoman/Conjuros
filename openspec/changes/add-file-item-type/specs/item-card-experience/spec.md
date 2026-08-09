## ADDED Requirements

### Requirement: File item cards show a badge and content slug

An item card for a `file` item SHALL display a "File" type badge with the dedicated file icon (a document page glyph) and SHALL show a single-line slug of the item's `content` as the inline content, keeping the card to a single row like spell and web-link cards. The slug SHALL be derived from the first non-empty line of `content` with whitespace collapsed; because file content is plain text (not Markdown), no Markdown markers are applied or stripped. A file card SHALL NOT offer the spell "Copy command" action or the web-link "Open link" action.

#### Scenario: File card shows the badge and a content slug

- **WHEN** a collection contains a `file` item
- **THEN** its card shows a "File" type badge with the file icon
- **AND** the card displays a single-line slug of the item's `content` as the inline content

#### Scenario: File card stays on a single row

- **WHEN** a `file` item has multi-line content
- **THEN** the card's inline content shows only the slug of the first non-empty line
- **AND** the card occupies a single row like other kinds

#### Scenario: File card omits spell and web-link actions

- **WHEN** a user views a `file` item card
- **THEN** no "Copy command" button is shown
- **AND** no "Open link" button is shown

### Requirement: File card offers a View action

A `file` item card SHALL offer a "View file" action button in the card's item-actions row, identical in placement and styling to the "View markdown" action, using an eye icon as its glyph. Clicking it SHALL open the file viewer panel for that item inside the collection item area. Only `file` items SHALL have this action; cards for spell, web-link, and markdown items SHALL NOT show it.

#### Scenario: View file button appears on file cards

- **WHEN** a collection contains a `file` item
- **THEN** its card shows a "View file" action button with an eye icon in the item-actions row

#### Scenario: Clicking the button opens the viewer

- **WHEN** a user clicks the "View file" action button on a file item card
- **THEN** the file viewer panel opens for that item in the collection item area

#### Scenario: View file button is absent on other kinds

- **WHEN** a card is for a spell, web-link, or markdown item
- **THEN** no "View file" button is shown

### Requirement: File card offers a Download action

A `file` item card SHALL offer a "Download file" action button in the card's item-actions row, identical in placement and styling to the other icon-action buttons, using a download icon as its glyph. It SHALL render between the "View file" button and the "Item menu" trigger of the card. Clicking it SHALL NOT open the viewer or navigate away; instead it SHALL trigger the browser's standard file-save flow for the item's stored `content` as a UTF-8 plain text file (MIME type `text/plain`), suggesting the item's `filename` as the default file name. When the item has no `filename`, the suggested name SHALL fall back to a name derived from the item `title` (lowercased, with spaces replaced by hyphens) with no extension appended. Only `file` items SHALL render this button; spell, web-link, and markdown cards SHALL NOT show it.

#### Scenario: Download button appears on file cards

- **WHEN** a collection contains a `file` item
- **THEN** its card shows a "Download file" action button with a download icon in the item-actions row
- **AND** the button is positioned between the "View file" button and the "Item menu" trigger

#### Scenario: Download button is absent on other kinds

- **WHEN** a card is for a `spell`, `web-link`, or `markdown` item
- **THEN** no "Download file" button is shown

#### Scenario: Clicking Download saves the content as a text file

- **WHEN** a user clicks the "Download file" action button on a file item card
- **THEN** the browser initiates the download of the item's `content` as a plain text file
- **AND** the viewer panel does not open
- **AND** the page does not navigate away

#### Scenario: Suggested file name uses the item filename

- **WHEN** a `file` item has a `filename` set (for example, `"notes.txt"`)
- **THEN** the download proposes `"notes.txt"` as the file name

#### Scenario: Suggested file name falls back when the item has no filename

- **WHEN** a `file` item has no `filename` and a title of `"My Files"`
- **THEN** the download proposes `"my-files"` as the file name with no extension