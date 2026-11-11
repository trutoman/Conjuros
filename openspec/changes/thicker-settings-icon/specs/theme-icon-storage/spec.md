## MODIFIED Requirements

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

#### Scenario: A built-in theme carries the superseded settings artwork
- **WHEN** a built-in theme's `iconAssets.settings` exactly matches the previous bundled settings artwork
- **THEN** reads and the backfill replace it with the supplied heavier settings artwork on a `0 0 24 24` viewBox
- **AND** any settings artwork that does not match the previous bundled default is preserved

#### Scenario: A custom artwork value is preserved
- **WHEN** a stored artwork value does not match any superseded bundled default
- **THEN** the API returns and persists that value unchanged
