## ADDED Requirements

### Requirement: Description accordion uses theme chevrons

An item card SHALL render the description accordion trigger with the active theme's `expand` artwork while collapsed and its `collapse` artwork while expanded. The artwork SHALL come from `iconAssets` in the active theme, SHALL use the shared outline style, and SHALL update when the theme changes.

#### Scenario: Collapsed description shows the expand chevron

- **WHEN** an item with a description has its description collapsed
- **THEN** the trigger renders the theme's `expand` artwork

#### Scenario: Expanded description shows the collapse chevron

- **WHEN** the user expands the description
- **THEN** the trigger renders the theme's `collapse` artwork

#### Scenario: Theme change updates the accordion artwork

- **WHEN** the active theme changes
- **THEN** the accordion trigger immediately uses the new theme's `expand` or `collapse` artwork
