## ADDED Requirements

### Requirement: File card uses dedicated action and badge glyphs

A `file` item card SHALL render its three glyphs from explicit, single-path SVGs: the card badge SHALL use exactly the user-provided document page glyph (a file document with folded corner, 24x24 viewBox `0 -960 960 960`); the "View file" action SHALL use exactly the same eye icon SVG path as the "View markdown" action; and the "Download file" action SHALL use exactly the same download icon SVG path as the "Download markdown" action. SHALL NOT combine or merge the markdown glyph into the file badge glyph.

#### Scenario: File badge uses the dedicated document glyph

- **WHEN** a collection contains a `file` item
- **THEN** the card badge renders the dedicated document page glyph
- **AND** the badge glyph is not the markdown glyph or a merged glyph

#### Scenario: View file uses the markdown eye glyph

- **WHEN** a card shows a "View file" action button
- **THEN** its SVG path is identical to the "View markdown" action button's eye icon path

#### Scenario: Download file uses the markdown download glyph

- **WHEN** a card shows a "Download file" action button
- **THEN** its SVG path is identical to the "Download markdown" action button's download icon path