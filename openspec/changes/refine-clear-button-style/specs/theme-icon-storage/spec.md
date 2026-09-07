## ADDED Requirements

### Requirement: Clear icon uses the supplied artwork verbatim

`iconAssets.clear` SHALL carry the exact supplied artwork: the verbatim SVG `path` (`m476-420 84-84 84 84 56-56-84-84 84-84-56-56-84 84-84-84-56 56 84 84-84 84 56 56ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z`) with `viewBox` `0 -960 960 960`. This supersedes the outline redrawing previously defined for `clear`. The entry SHALL carry no hardcoded color (the supplied `fill="#e3e3e3"` is dropped so the icon recolors from the theme) and SHALL otherwise behave like every other theme-owned icon: rendered via the active theme's stored record, editable per theme, and backfilled on read for stored themes that lack it or carry the old artwork.

#### Scenario: Stored clear artwork matches the supplied SVG

- **WHEN** an admin inspects the active theme's `iconAssets.clear`
- **THEN** its `path` equals the supplied artwork verbatim
- **AND** its `viewBox` is `0 -960 960 960`
- **AND** it contains no fixed color value

#### Scenario: Sidebar renders the supplied artwork

- **WHEN** a user views the sidebar `Clear` button
- **THEN** the icon displays the supplied artwork from the active theme's stored record

#### Scenario: Existing themes receive the new artwork on backfill

- **WHEN** a stored theme carries the previous `clear` artwork (or lacks the key)
- **THEN** read normalization and backfill supply the verbatim supplied artwork without altering any admin-customized icon
