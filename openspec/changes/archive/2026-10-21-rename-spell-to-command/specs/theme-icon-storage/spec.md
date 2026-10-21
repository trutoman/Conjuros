## MODIFIED Requirements

### Requirement: Themes store the icon artwork in `iconAssets`

`Theme.iconAssets` SHALL be a `Record<IconAssetKey, { path, viewBox }>` covering every `IconAssetKey` (twenty-one keys: `command`, `web-link`, `markdown`, `file`, `copy`, `open`, `view`, `download`, `menu`, `edit`, `delete`, `confirm`, `cancel`, `expand`, `collapse`, `close`, `clear`, `search`, `sun`, `moon`, `add`). Each entry SHALL carry a non-empty `path` (the SVG `d` attribute) and a non-empty `viewBox`. The contract SHALL reject a `string[]` `iconAssets` value (legacy shape from `theme-svg-sprite-icons`) on save; on read, the API normalizes the legacy array to a keyed record.

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

### Requirement: Per-theme icon artwork is editable

The `ThemeForm` SHALL allow admins to edit the `path` and `viewBox` text input for every `IconAssetKey`, and submitting the form SHALL persist the new keyed record via `POST /api/themes` or `PATCH /api/themes/:id`.

#### Scenario: An admin customizes an icon's path

- **WHEN** an admin edits the `path` text input for `command` and submits the form
- **THEN** `GET /api/themes/:id` returns the stored theme with `iconAssets.command.path` equal to the new value
