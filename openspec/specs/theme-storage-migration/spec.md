## Purpose

Lets the themes API continue to serve theme documents that were stored before the `iconAssets` shape changed from a `string[]` of keys to a keyed record of icon definitions, by normalizing the legacy shape on read.

## Requirements

### Requirement: Legacy `iconAssets` key arrays are normalized on read

When a stored theme document carries `iconAssets` as an array of icon keys (the legacy shape), the themes API SHALL treat it as if every listed key had a stored icon definition, and SHALL merge each listed key with the bundled `ICON_ASSETS` default so the returned `Theme` carries a valid `Record<IconAssetKey, { path, viewBox }>`. Themes stored with the new keyed shape SHALL be returned unchanged.

#### Scenario: API returns a theme whose stored iconAssets is a key array

- **WHEN** the themes collection contains a document with `iconAssets: ['command', 'copy']`
- **THEN** `GET /api/themes/active`, `GET /api/themes`, `GET /api/themes/:id`, `POST /api/themes`, `PATCH /api/themes/:id`, and `PATCH /api/themes/:id/activate` all return a theme whose `iconAssets` is an object keyed by `IconAssetKey`
- **AND** each listed key has a valid `path` and `viewBox`

#### Scenario: API returns a theme whose stored iconAssets is already a keyed record

- **WHEN** the themes collection contains a document with the new keyed `iconAssets` shape
- **THEN** the API returns it unchanged (no double-normalization)

### Requirement: The active theme endpoint never fails because of the legacy shape

The `/api/themes/active` endpoint SHALL succeed for any stored theme document whose only deviation from the current schema is the `iconAssets` legacy shape. The endpoint SHALL resolve the user's preference, look up the matching theme, normalize it, and return a valid `SiteThemeContext`.

#### Scenario: Active theme resolves when the user's preference matches a legacy-shape stored theme

- **WHEN** a user whose preference is `light` requests the active theme
- **AND** the stored `light` theme carries the legacy `iconAssets` array
- **THEN** the response is HTTP 200 with a `theme` whose `iconAssets` is a keyed record

#### Scenario: Active theme falls back to the default when the preference has no matching theme

- **WHEN** the user's preference does not match any stored theme
- **THEN** the response is the default theme, normalized through the same legacy-shape path

### Requirement: Legacy spell theme keys migrate to command

Theme documents upgraded from the previous vocabulary SHALL use the `command` key for the command item kind in both `kindColors` and `iconAssets`. A stored document that still uses the former `spell` key SHALL be rewritten so the existing value is preserved under `command` and the old key is removed. A document that already uses `command` SHALL remain unchanged, and when both keys are present the existing `command` value SHALL be preserved. A legacy `iconAssets` key array SHALL have its `spell` entry replaced by `command`.

#### Scenario: A stored kind color key is renamed

- **WHEN** a stored theme document contains `kindColors.spell`
- **THEN** the migrated document contains `kindColors.command`
- **AND** the color value is unchanged
- **AND** `kindColors.spell` is absent

#### Scenario: A stored icon asset key is renamed

- **WHEN** a stored theme document contains an object-shaped `iconAssets.spell`
- **THEN** the migrated document contains `iconAssets.command`
- **AND** the stored `path` and `viewBox` are unchanged
- **AND** `iconAssets.spell` is absent

#### Scenario: A legacy icon key array is renamed

- **WHEN** a stored theme document contains `iconAssets: ['spell', 'copy']`
- **THEN** the migrated array is `['command', 'copy']`

#### Scenario: An already-migrated document is unchanged

- **WHEN** a stored theme document already contains `kindColors.command` and `iconAssets.command`
- **THEN** the migration leaves both values unchanged

#### Scenario: An existing command value wins over a stale spell key

- **WHEN** a stored theme document contains both `command` and `spell` keys
- **THEN** the value under `command` is preserved

### Requirement: Existing themes gain attachment visual keys

When the attachment item kind is introduced, every stored theme SHALL gain an `attachment` entry in both `kindColors` and `iconAssets`. A theme missing `kindColors.attachment` SHALL receive the bundled default attachment color. A theme missing `iconAssets.attachment` SHALL receive the bundled attachment artwork through the icon backfill. Existing attachment colors or artwork SHALL be preserved and SHALL NOT be overwritten.

#### Scenario: A stored theme gains the attachment kind color

- **WHEN** a stored theme document has no `kindColors.attachment`
- **THEN** the migrated document contains `kindColors.attachment`
- **AND** its value is the bundled default attachment color
- **AND** the other kind colors are unchanged

#### Scenario: A stored theme gains the attachment icon

- **WHEN** a stored theme document has no `iconAssets.attachment`
- **THEN** the icon backfill adds `iconAssets.attachment`
- **AND** the entry contains the bundled attachment `path` and `viewBox`
- **AND** the other icon entries are unchanged

#### Scenario: Existing attachment visual values are preserved

- **WHEN** a stored theme already has `kindColors.attachment` or a custom `iconAssets.attachment`
- **THEN** the migration and backfill leave those values unchanged
