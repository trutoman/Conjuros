## ADDED Requirements

### Requirement: Clear icon artwork renders visibly on the shared 24-unit grid

`iconAssets.clear` SHALL use `viewBox` `0 0 24 24` with geometry identical to the supplied SVG rescaled to that grid (each x divided by 40, each y shifted by +960 then divided by 40), superseding both the outline redrawing and the 960-grid verbatim path. Rendered through the shared icon styling, the icon SHALL be clearly visible at the same visual weight as the other icons. The entry SHALL carry no hardcoded color. Stored themes carrying either superseded variant SHALL converge on the rescaled artwork via read normalization and backfill; admin-customized values SHALL be preserved.

#### Scenario: Clear icon is visible next to the label

- **WHEN** a user views the sidebar `Clear` button
- **THEN** the clear icon renders visibly beside the label at a stroke weight matching the neighboring icons

#### Scenario: Rescaled geometry matches the supplied artwork

- **WHEN** the stored `iconAssets.clear` path is scaled back up (x times 40, y times 40 minus 960)
- **THEN** its coordinates match the supplied SVG geometry
- **AND** its `viewBox` is `0 0 24 24`
- **AND** it contains no fixed color value

#### Scenario: Both superseded variants are migrated

- **WHEN** a stored theme carries the outline-redrawn `clear` artwork or the 960-grid verbatim artwork
- **THEN** read normalization and backfill supply the rescaled artwork without altering any admin-customized icon
