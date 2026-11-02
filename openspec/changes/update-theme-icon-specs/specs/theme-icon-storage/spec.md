## MODIFIED Requirements

### Requirement: Themes store the icon artwork in `iconAssets`

`Theme.iconAssets` SHALL be a `Record<IconAssetKey, { path, viewBox }>` covering every `IconAssetKey` (twenty-three keys: `command`, `web-link`, `markdown`, `file`, `attachment`, `copy`, `open`, `view`, `download`, `menu`, `tags`, `edit`, `delete`, `confirm`, `cancel`, `expand`, `collapse`, `close`, `clear`, `search`, `sun`, `moon`, `add`). Each entry SHALL carry a non-empty `path` (the SVG `d` attribute) and a non-empty `viewBox`. The contract SHALL reject a `string[]` `iconAssets` value (legacy shape from `theme-svg-sprite-icons`) on save; on read, the API normalizes the legacy array to a keyed record.

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

## ADDED Requirements

### Requirement: Bundled attachment artwork uses the shared 24-unit outline style

The bundled default `attachment` artwork SHALL use a `0 0 24 24` viewBox and render through the shared outline icon styling. The attachment icon SHALL NOT require an attachment-specific stroke-width override and SHALL carry no hardcoded color.

#### Scenario: Attachment renders at the shared icon weight

- **WHEN** a user views an attachment badge or the attachment drop zone
- **THEN** the attachment icon renders with the same stroke style and rendered size as the other theme icons
- **AND** its definition carries no fixed color value

### Requirement: Superseded bundled artwork migrates without overwriting custom values

When a stored theme carries an artwork value that shipped as a previous bundled default, the API SHALL replace it with the current bundled default on read and persist the replacement during the icon backfill. Any other stored value SHALL be preserved as an admin customization.

#### Scenario: A stored theme carries the superseded attachment artwork

- **WHEN** `iconAssets.attachment` exactly matches the previous 960-grid paperclip artwork
- **THEN** reads and the backfill replace it with the current 24-grid attachment artwork

#### Scenario: A stored theme carries superseded clear artwork

- **WHEN** `iconAssets.clear` exactly matches a previous bundled clear artwork variant
- **THEN** reads and the backfill replace it with the current clear artwork

#### Scenario: A stored theme carries the tags bookmark as collapse or expand

- **WHEN** `iconAssets.collapse` or `iconAssets.expand` exactly matches the tags bookmark artwork that was briefly shipped for those keys
- **THEN** reads and the backfill restore the corresponding chevron artwork
- **AND** the other key's custom value is preserved

#### Scenario: A custom artwork value is preserved

- **WHEN** a stored artwork value does not match any superseded bundled default
- **THEN** the API returns and persists that value unchanged
