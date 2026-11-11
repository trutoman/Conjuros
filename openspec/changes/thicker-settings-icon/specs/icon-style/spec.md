## MODIFIED Requirements

### Requirement: All icons render in an outline style
Every SVG icon in the application SHALL render as a line (outline) icon with no filled silhouette, except the settings icon, which SHALL use the supplied heavier filled gear artwork. The settings icon SHALL retain the shared icon dimensions and SHALL derive its visible color from the active theme. No other interactive icon SHALL use the filled variant.

#### Scenario: Non-settings icons render as outline icons
- **WHEN** a user inspects any icon other than settings
- **THEN** the icon renders as strokes with `fill: none`
- **AND** no element carries the filled icon style

#### Scenario: Settings icon uses the supplied heavier silhouette
- **WHEN** a user views the settings action
- **THEN** its gear artwork matches the supplied heavier silhouette on a `0 0 24 24` viewBox
- **AND** its visible color follows the active theme

#### Scenario: Icon dimensions and meaning remain consistent
- **WHEN** the settings artwork is replaced
- **THEN** the icon occupies the shared rendered dimensions
- **AND** it continues to communicate the settings action

### Requirement: The filled icon variant is retired
The system SHALL NOT expose a general filled icon variant for new or existing icons. The settings icon SHALL be the sole exception, using its static filled silhouette without making a filled variant available to other icons. Any general CSS class or component prop that selects a filled style SHALL be removed once no icon uses it.

#### Scenario: No general filled style is available
- **WHEN** an icon other than settings is rendered
- **THEN** no component requests a filled style
- **AND** no general stylesheet rule provides one

#### Scenario: Settings remains the only filled silhouette
- **WHEN** the settings icon is rendered
- **THEN** its supplied silhouette is filled using the active theme color
- **AND** other icons retain the outline style
