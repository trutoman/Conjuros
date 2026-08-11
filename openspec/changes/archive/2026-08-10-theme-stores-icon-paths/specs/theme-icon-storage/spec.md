## Purpose

Carries the artwork (`path` + `viewBox`) for every application icon inside each theme document, so the database owns the icon shapes per theme and the frontend renders each icon from the active theme's stored data.

## ADDED Requirements

### Requirement: Themes store the icon artwork in `iconAssets`

`Theme.iconAssets` SHALL be a `Record<IconAssetKey, { path, viewBox }>` covering every `IconAssetKey` (twenty keys: `spell`, `web-link`, `markdown`, `file`, `copy`, `open`, `view`, `download`, `menu`, `edit`, `delete`, `confirm`, `cancel`, `expand`, `collapse`, `close`, `search`, `sun`, `moon`, `add`). Each entry SHALL carry a non-empty `path` (the SVG `d` attribute) and a non-empty `viewBox`. The contract SHALL reject a `string[]` `iconAssets` value (legacy shape from `theme-svg-sprite-icons`) on save; on read, the API normalizes the legacy array to a keyed record.

#### Scenario: A theme documents every icon's `path` and `viewBox`

- **WHEN** an admin inspects a stored theme document
- **THEN** `iconAssets` is an object keyed by `IconAssetKey`
- **AND** every key has a non-empty `path` and `viewBox`

#### Scenario: An icon key is missing from a stored theme

- **WHEN** the theme's `iconAssets` lacks one or more `IconAssetKey`s
- **THEN** the API normalizes the stored document on read by adding the missing keys from the bundled defaults
- **AND** every key on the response carries a valid `path` and `viewBox`

### Requirement: Icons render from the active theme's stored iconAssets

The frontend SHALL read the active theme's `iconAssets` from the API on initial mount and on every theme preference change, and SHALL render each `<ThemeIcon name="key" />` as an inline `<svg class="icon">` whose `<path>` `d` attribute equals the stored `path` for that key.

#### Scenario: Initial mount renders icons from the active theme

- **WHEN** an authenticated user opens the application
- **THEN** the active theme's `iconAssets` is fetched
- **AND** every rendered `<ThemeIcon>` displays the `path` and `viewBox` from that stored record

#### Scenario: A theme preference change reloads the icon paths

- **WHEN** an authenticated user toggles between light and dark
- **THEN** the new active theme's `iconAssets` is fetched
- **AND** every rendered `<ThemeIcon>` immediately displays the new theme's `path` and `viewBox`

### Requirement: Per-theme icon artwork is editable

The `ThemeForm` SHALL allow admins to edit the `path` and `viewBox` text input for every `IconAssetKey`, and submitting the form SHALL persist the new keyed record via `POST /api/themes` or `PATCH /api/themes/:id`.

#### Scenario: An admin customizes an icon's path

- **WHEN** an admin edits the `path` text input for `spell` and submits the form
- **THEN** `GET /api/themes/:id` returns the stored theme with `iconAssets.spell.path` equal to the new value

## DELETED Requirements

### Requirement: Icons render via SVG `<symbol>` + `<use>` sprite

**Reason**: The user wants each theme to carry the artwork in the database. The sprite was an optimization that decoupled rendering from the network round-trip but left the database out of the picture; the requirement now is that the active theme's stored record drives every rendered icon.
**Migration**: The SVG sprite is removed (`src/web/components/Sprite.tsx` is deleted, the `<Sprite />` mount in `App.tsx` is removed). `<ThemeIcon>` renders an inline `<svg><path d={stored.path} /></svg>` from the active theme's keyed record instead.