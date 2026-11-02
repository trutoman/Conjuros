## ADDED Requirements

### Requirement: Tags controls render the theme's tags artwork

The tags sidebar toggle and the narrow-viewport topbar `Tags` button SHALL render the active theme's `tags` artwork. The artwork SHALL come from `iconAssets.tags` and SHALL update when the theme changes.

#### Scenario: Sidebar toggle uses the theme tags icon

- **WHEN** a user views the tags sidebar toggle
- **THEN** it renders the active theme's `tags` path and viewBox

#### Scenario: Topbar Tags button uses the theme tags icon

- **WHEN** a narrow viewport shows the topbar `Tags` button
- **THEN** it renders the active theme's `tags` path and viewBox

#### Scenario: Theme change updates the tags controls

- **WHEN** the active theme changes
- **THEN** both tags controls immediately use the new theme's `tags` artwork
