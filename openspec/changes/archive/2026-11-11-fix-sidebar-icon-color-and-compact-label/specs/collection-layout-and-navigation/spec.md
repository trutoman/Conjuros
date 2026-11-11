## ADDED Requirements

### Requirement: Sidebar clear icon matches neighboring control color
The sidebar `clear` icon SHALL use the same theme-derived visible color as the neighboring icon controls in the sidebar header. Its color SHALL NOT be overridden with a distinct warning or danger color.

#### Scenario: Clear icon matches the adjacent sidebar icons
- **WHEN** a user views the expanded sidebar header
- **THEN** the `clear` icon has the same visible color as the neighboring icon controls
- **AND** the color follows the active theme

### Requirement: Narrow topbar Tags control is icon-only
On viewports at or below the mobile breakpoint, the topbar Tags button SHALL display the active theme's tags icon without a visible text label. The button SHALL retain an accessible name, its expanded state, and its association with the tags panel.

#### Scenario: Narrow viewport shows only the Tags icon
- **WHEN** a user views the topbar at or below the mobile breakpoint
- **THEN** the Tags button displays the tags icon
- **AND** no visible `Tags` text label is shown

#### Scenario: Icon-only Tags button remains accessible
- **WHEN** assistive technology inspects the narrow topbar Tags button
- **THEN** the button exposes an accessible name identifying the tags panel
- **AND** its expanded state and controlled panel remain exposed

#### Scenario: Tags button behavior is unchanged
- **WHEN** a user activates the icon-only Tags button
- **THEN** the tags drawer opens as before
- **AND** the button remains absent on wider viewports
