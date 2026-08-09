## Purpose

Adds a read-only "View markdown" panel that renders a markdown item's stored `content` as sanitized HTML so users can read the full note from the collection without opening the edit form.

## ADDED Requirements

### Requirement: Viewer opens inside the collection item area

The markdown viewer SHALL open as a panel inside the collection item area, replacing the collection list in the same way the item form and manage-tags panels do. Opening the viewer SHALL close any other open panel (item form, tag form, or manage tags). Only one such panel SHALL be open at a time.

#### Scenario: Viewer replaces the collection list

- **WHEN** a user clicks the "View markdown" action on a markdown item card
- **THEN** the markdown viewer opens for that item in the collection item area
- **AND** the collection list is replaced by the viewer

#### Scenario: Viewer closes other panels

- **WHEN** a user opens the markdown viewer
- **THEN** no item form, tag form, or manage-tags panel is open at the same time

### Requirement: Viewer shows title and rendered content

The viewer SHALL display a header titled "View markdown", immediately followed by the item's `title`, and SHALL render the item's full `content` below it. The content SHALL be parsed with `marked` and the resulting HTML SHALL be sanitized with DOMPurify before rendering. No markdown source markers SHALL be visible in the rendered content.

#### Scenario: Header shows the reader and item title

- **WHEN** the viewer opens for a markdown item titled "Research notes"
- **THEN** the header shows "View markdown"
- **AND** the header shows the item title "Research notes"

#### Scenario: Content renders markdown

- **WHEN** the item's `content` contains headings, emphasis, links, and lists
- **THEN** the viewer renders the equivalent HTML
- **AND** no raw markdown markers are shown

#### Scenario: Rendered content is sanitized

- **WHEN** the stored `content` contains a `<script>` element or a `javascript:` link
- **THEN** the offending markup is removed from the rendered HTML
- **AND** no script executes and no dangerous link is actionable

#### Scenario: Full content is displayed unchanged

- **WHEN** a markdown item's `content` has multiple lines
- **THEN** the viewer renders the full stored `content`, not the single-line card slug

### Requirement: Viewer closes back to the collection

The viewer SHALL provide a close (✕) button, placed like the item form's close button, that closes the viewer and returns to the collection list. The close button SHALL carry an accessible label.

#### Scenario: Close returns to the collection

- **WHEN** a user clicks the close button on the markdown viewer
- **THEN** the viewer closes
- **AND** the collection list is shown again

### Requirement: Viewer Edit opens the item edit form

The viewer SHALL provide an "Edit" button that opens the same edit form the contextual menu's Edit action opens, preloaded with the same item.

#### Scenario: Edit opens the item form

- **WHEN** a user clicks the "Edit" button on the markdown viewer
- **THEN** the item form opens in edit mode for the same item