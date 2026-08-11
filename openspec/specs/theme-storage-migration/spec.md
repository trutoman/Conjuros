## Purpose

Lets the themes API continue to serve theme documents that were stored before the `iconAssets` shape changed from a `string[]` of keys to a keyed record of icon definitions, by normalizing the legacy shape on read.

## ADDED Requirements

### Requirement: Legacy `iconAssets` key arrays are normalized on read

When a stored theme document carries `iconAssets` as an array of icon keys (the legacy shape), the themes API SHALL treat it as if every listed key had a stored icon definition, and SHALL merge each listed key with the bundled `ICON_ASSETS` default so the returned `Theme` carries a valid `Record<IconAssetKey, { path, viewBox }>`. Themes stored with the new keyed shape SHALL be returned unchanged.

#### Scenario: API returns a theme whose stored iconAssets is a key array

- **WHEN** the themes collection contains a document with `iconAssets: ['spell', 'copy']`
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