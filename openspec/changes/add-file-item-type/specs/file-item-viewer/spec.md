## Purpose

Adds a read-only "View file" panel that renders a `file` item's stored `content` as sanitized plain text so users can read the full document from the collection without opening the edit form.

## ADDED Requirements

### Requirement: Viewer opens inside the collection item area

The file viewer SHALL open as a panel inside the collection item area, replacing the collection list in the same way the item form and manage-tags panels do. Opening the viewer SHALL close any other open panel (item form, tag form, or manage tags). Only one such panel SHALL be open at a time.

#### Scenario: Viewer replaces the collection list

- **WHEN** a user clicks the "View file" action on a file item card
- **THEN** the file viewer opens for that item in the collection item area
- **AND** the collection list is replaced by the viewer

#### Scenario: Viewer closes other panels

- **WHEN** a user opens the file viewer
- **THEN** no item form, tag form, or manage-tags panel is open at the same time

### Requirement: Viewer shows title and plain text content

The viewer SHALL display a header titled "View file", immediately followed by the item's `title`, and SHALL show the item's full `content` below it as plain preformatted text. The content SHALL be displayed verbatim and sanitized before rendering so no HTML, script, or active content embedded in the `content` executes. File content SHALL NOT be parsed as Markdown: raw Markdown markers, if any, SHALL be shown as plain text, not rendered.

#### Scenario: Header shows the viewer and item title

- **WHEN** the viewer opens for a file item titled "Setup guide"
- **THEN** the header shows "View file"
- **AND** the header shows the item title "Setup guide"

#### Scenario: Content renders as plain text unchanged

- **WHEN** the item's `content` contains multiple lines and special characters
- **THEN** the viewer shows the full stored `content` as preformatted plain text, not the single-line card slug
- **AND** whitespace and line breaks are preserved

#### Scenario: Content is not rendered as Markdown

- **WHEN** the stored `content` contains Markdown markers (for example `# Heading` or `**bold**`)
- **THEN** the markers are shown literally as plain text
- **AND** no heading or emphasis rendering is applied

#### Scenario: Rendered content is sanitized

- **WHEN** the stored `content` contains a `<script>` element or a `javascript:` link
- **THEN** the offending markup is removed or neutralized from the rendered text
- **AND** no script executes and no dangerous link is actionable

### Requirement: Viewer shows the item filename

When the item has a `filename`, the viewer SHALL display it in the header area under the item title as plain text with a "Filename" label. The viewer SHALL NOT render any path-like prefix or file icon for the filename. When the item has no `filename`, the viewer SHALL NOT render the Filename label or any placeholder.

#### Scenario: Viewer shows an existing filename

- **WHEN** the viewer opens for a `file` item whose `filename` is "report.txt"
- **THEN** the header area shows the label "Filename"
- **AND** the header area shows "report.txt" as plain text

#### Scenario: Viewer omits a missing filename

- **WHEN** the viewer opens for a `file` item whose `filename` is `null`
- **THEN** the header area does not show a "Filename" label
- **AND** no filename placeholder is shown

#### Scenario: Filename is independent of the content

- **WHEN** the viewer opens for a `file` item that has a `filename`
- **THEN** the content below the header is unaffected by the `filename` value

### Requirement: Viewer closes back to the collection

The viewer SHALL provide a close (✕) button, placed like the item form's close button, that closes the viewer and returns to the collection list. The close button SHALL carry an accessible label.

#### Scenario: Close returns to the collection

- **WHEN** a user clicks the close button on the file viewer
- **THEN** the viewer closes
- **AND** the collection list is shown again

### Requirement: Viewer Edit opens the item edit form

The viewer SHALL provide an "Edit" button that opens the same edit form the contextual menu's Edit action opens, preloaded with the same item.

#### Scenario: Edit opens the item form

- **WHEN** a user clicks the "Edit" button on the file viewer
- **THEN** an item edit form for the `file` item opens with the same item preloaded