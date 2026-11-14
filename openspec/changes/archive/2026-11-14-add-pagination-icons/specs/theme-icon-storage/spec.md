# Spec Delta

## MODIFIED Requirements

### Requirement: Themes store the icon artwork in `iconAssets`

`Theme.iconAssets` SHALL be a `Record<IconAssetKey, { path, viewBox }>` covering every `IconAssetKey` (twenty-seven keys: `command`, `web-link`, `markdown`, `file`, `attachment`, `copy`, `open`, `view`, `download`, `menu`, `tags`, `edit`, `delete`, `confirm`, `cancel`, `expand`, `collapse`, `close`, `clear`, `search`, `sun`, `moon`, `add`, `settings`, `previous-page`, `next-page`, `last-page`). Each entry SHALL carry a non-empty `path` (the SVG `d` attribute) and a non-empty `viewBox`. The contract SHALL reject a `string[]` `iconAssets` value (legacy shape from `theme-svg-sprite-icons`) on save; on read, the API normalizes the legacy array to a keyed record.

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

#### Scenario: A stored theme predates the pagination icons

- **WHEN** a stored theme document lacks the `previous-page`, `next-page`, or `last-page` key
- **THEN** the API normalizes the document on read with the bundled default for each missing key
- **AND** the response carries all three keys with a valid `path` and `viewBox`

## ADDED Requirements

### Requirement: Every theme carries the pagination navigation artwork

Every theme SHALL include the `previous-page`, `next-page`, and `last-page` icon assets. A newly seeded theme SHALL be created with them, a stored theme missing any of them SHALL gain the bundled default, and the startup icon backfill SHALL persist them in the stored document. Admins SHALL be able to customize each of the three like any other icon. The three assets SHALL follow the application outline icon style and SHALL NOT hardcode a color.

#### Scenario: A seeded theme ships the three navigation icons

- **WHEN** the API seeds the bundled themes
- **THEN** each seeded theme's `iconAssets` contains `previous-page`, `next-page`, and `last-page`
- **AND** each entry has a non-empty `path` and `viewBox`

#### Scenario: A stored theme gains the navigation icons

- **WHEN** the API serves a theme stored before these keys existed
- **THEN** the returned `iconAssets` includes all three navigation icons with the bundled artwork

#### Scenario: The startup backfill persists the navigation icons

- **WHEN** the API starts and runs the icon backfill
- **THEN** each stored theme document contains the three navigation icons
- **AND** a theme that was missing them no longer depends on read-time normalization

#### Scenario: An admin customizes the pagination icons

- **WHEN** an admin edits the `path` of `next-page` and saves the theme
- **THEN** `GET /api/themes/:id` returns the theme with the customized `next-page` path
- **AND** the collection `Next` control renders that path

#### Scenario: Navigation icons follow the outline style

- **WHEN** an admin inspects the default navigation icon artwork
- **THEN** each one is drawn with strokes on a `0 0 24 24` viewBox
- **AND** its definition contains no fixed color value
