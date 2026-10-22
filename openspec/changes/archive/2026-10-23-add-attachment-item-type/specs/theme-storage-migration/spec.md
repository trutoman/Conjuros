## ADDED Requirements

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
