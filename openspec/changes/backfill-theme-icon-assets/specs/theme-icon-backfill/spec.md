## Purpose

Upserts stored theme documents so each one carries a complete `iconAssets` `string[]` covering every `IconAssetKey`, so every theme exposes the full set of sprite symbols to the UI.

## ADDED Requirements

### Requirement: Stored themes carry the full id list at startup

When the themes service is initialized, it SHALL walk every stored theme document and upsert its `iconAssets` so the document ends with a `string[]` that covers every `IconAssetKey`. For each missing key, the upsert adds the key from the canonical `iconAssetKeys` list. For each key the document already lists, the upsert SHALL preserve that entry untouched.

#### Scenario: A legacy 16-key array is upgraded to the canonical 20-key array

- **WHEN** the themes collection contains a document whose `iconAssets` is `string[]` of length 16 (missing `close`, `sun`, `moon`, `add`)
- **THEN** the upsert replaces `iconAssets` with a `string[]` of length 20 covering every `IconAssetKey`
- **AND** the existing 16 entries are preserved in the result

#### Scenario: A partially keyed theme document is upgraded without losing customizations

- **WHEN** the themes collection contains a document whose `iconAssets` is a `string[]` of length 5 (a partial selection)
- **THEN** the upsert adds only the missing 15 keys
- **AND** the existing 5 entries are preserved in the result

#### Scenario: A fully covered theme document passes through unchanged

- **WHEN** the themes collection contains a document whose `iconAssets` is a `string[]` covering every `IconAssetKey`
- **THEN** the upsert is a no-op for that document

### Requirement: The backfill is idempotent

Running the backfill twice against the same stored collection SHALL produce the same final state. After the first run, a second run SHALL make zero writes.

#### Scenario: Two consecutive backfills yield the same stored documents

- **WHEN** the backfill runs against a collection that was just backfilled
- **THEN** the second run does not modify any stored document

### Requirement: The backfill runs once per process start, after themes are seeded

The themes service SHALL run the backfill after `ensureThemesSeeded()` and before the first request is served, so newly seeded themes also carry the full array without a separate migration step. The backfill SHALL be safe to call on every boot.

#### Scenario: Boot order leaves no theme in a partial state

- **WHEN** the application starts
- **THEN** `ensureThemesSeeded()` runs first
- **AND** the backfill runs immediately after
- **AND** every theme in the collection carries a full `string[]` of length 20 before any request is served

### Requirement: Legacy keyed records are normalized to id lists on read

The themes service SHALL treat any stored theme whose `iconAssets` is a keyed record (a transient state from before `theme-svg-sprite-icons`) as a list of symbol ids — the record's keys — and return a `string[]` to API consumers.

#### Scenario: A stored keyed record reads as an id list

- **WHEN** a stored theme's `iconAssets` is `{ spell: {...}, copy: {...} }`
- **THEN** `GET /api/themes/active` and `GET /api/themes` return that theme with `iconAssets` as a `string[]` containing `spell` and `copy`