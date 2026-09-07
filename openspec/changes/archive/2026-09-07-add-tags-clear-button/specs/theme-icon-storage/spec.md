## MODIFIED Requirements

### Requirement: Themes store the icon artwork in `iconAssets`

`Theme.iconAssets` SHALL be a `Record<IconAssetKey, { path, viewBox }>` covering every `IconAssetKey` (twenty-one keys: `spell`, `web-link`, `markdown`, `file`, `copy`, `open`, `view`, `download`, `menu`, `edit`, `delete`, `confirm`, `cancel`, `expand`, `collapse`, `close`, `clear`, `search`, `sun`, `moon`, `add`). Each entry SHALL carry a non-empty `path` (the SVG `d` attribute) and a non-empty `viewBox`. The contract SHALL reject a `string[]` `iconAssets` value (legacy shape from `theme-svg-sprite-icons`) on save; on read, the API normalizes the legacy array to a keyed record.

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

## ADDED Requirements

### Requirement: Clear icon uses the outline stroke style

The `clear` icon artwork SHALL follow the application icon style: visible marks drawn with strokes, no filled silhouette, no hardcoded color, rendered at the same dimensions as the other icons. Its `path` SHALL be an outline stroke-style redrawing of the requested clear-filter artwork on a `0 0 24 24` viewBox, and the sidebar `clear` button SHALL render it via `<ThemeIcon name="clear" />` from the active theme's stored record.

#### Scenario: Clear icon renders as an outline icon

- **WHEN** a user views the sidebar `clear` button
- **THEN** the icon renders as strokes with no filled silhouette
- **AND** it recolors from the theme with no fixed color value in its definition

#### Scenario: Clear icon comes from the active theme record

- **WHEN** the active theme changes
- **THEN** the `clear` button icon immediately displays the new theme's `iconAssets.clear` path and viewBox
