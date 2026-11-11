## MODIFIED Requirements

### Requirement: Themes store the icon artwork in `iconAssets`

`Theme.iconAssets` SHALL be a `Record<IconAssetKey, { path, viewBox }>` covering every `IconAssetKey` (twenty-four keys: `command`, `web-link`, `markdown`, `file`, `attachment`, `copy`, `open`, `view`, `download`, `menu`, `tags`, `edit`, `delete`, `confirm`, `cancel`, `expand`, `collapse`, `close`, `clear`, `search`, `sun`, `moon`, `add`, `settings`). Each entry SHALL carry a non-empty `path` (the SVG `d` attribute) and a non-empty `viewBox`. The contract SHALL reject a `string[]` `iconAssets` value (legacy shape from `theme-svg-sprite-icons`) on save; on read, the API normalizes the legacy array to a keyed record.

#### Scenario: A theme documents every icon's `path` and `viewBox`

- **WHEN** an admin inspects a stored theme document
- **THEN** `iconAssets` is an object keyed by `IconAssetKey`
- **AND** every key has a non-empty `path` and `viewBox`

#### Scenario: An icon key is missing from a stored theme

- **WHEN** the theme's `iconAssets` lacks one or more `IconAssetKey`s
- **THEN** the API normalizes the stored document on read by adding the missing keys from the bundled defaults
- **AND** every key on the response carries a valid `path` and `viewBox`

#### Scenario: A stored theme predates the clear icon

- **WHEN** a stored theme document lacks the `clear` key
- **THEN** the API normalizes the document on read by adding `clear` from the bundled defaults
- **AND** the `clear` entry carries a valid `path` and `viewBox`

#### Scenario: A theme carries the attachment glyph

- **WHEN** a stored theme document includes the `attachment` icon key
- **THEN** `iconAssets.attachment` carries a non-empty `path` and `viewBox`
- **AND** the attachment card renders that artwork

#### Scenario: Existing themes predate the settings icon

- **WHEN** a stored or legacy theme lacks `settings`
- **THEN** reads and the theme backfill supply the bundled settings artwork
- **AND** other custom artwork is preserved

#### Scenario: Settings artwork is customized

- **WHEN** a theme contains custom settings artwork
- **THEN** that artwork is preserved and displayed by the tag management button
- **AND** an administrator can edit and save its path and viewBox in the theme editor

## ADDED Requirements

### Requirement: Settings artwork uses the supplied gear shape

The bundled `settings` icon SHALL use the supplied gear SVG path and `0 -960 960 960` viewBox. It SHALL be rendered as a filled shape with theme-derived color rather than a fixed color, without changing the rendering of other icons.

#### Scenario: Default settings artwork is displayed

- **WHEN** a user opens the tags sidebar with a theme using the bundled settings icon
- **THEN** the tag management button displays the supplied gear shape at the same icon size as the other toolbar buttons
- **AND** its color follows the active theme

#### Scenario: Active theme changes

- **WHEN** the active theme changes
- **THEN** the tag management icon uses the new active theme's settings path and viewBox
