## ADDED Requirements

### Requirement: Viewer shows the item filename

When the item has a `filename`, the viewer SHALL display it in the header area under the item title as plain text with a "Filename" label. The viewer SHALL NOT render any path-like prefix or "file" icon for the filename. When the item has no `filename`, the viewer SHALL NOT render the Filename label or any placeholder.

#### Scenario: Viewer shows an existing filename

- **WHEN** the viewer opens for a `markdown` item whose `filename` is "research-notes.md"
- **THEN** the header area shows the label "Filename"
- **AND** the header area shows "research-notes.md" as plain text

#### Scenario: Viewer omits a missing filename

- **WHEN** the viewer opens for a `markdown` item whose `filename` is `null`
- **THEN** the header area does not show a "Filename" label
- **AND** no filename placeholder is shown

#### Scenario: Filename is independent of the rendered content

- **WHEN** the viewer opens for a `markdown` item that has a `filename`
- **THEN** the rendered `content` below the header is unaffected by the `filename` value