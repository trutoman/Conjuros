# Theme Editor

## Purpose

Gives administrators an admin-only entry point to create, edit, activate, and delete themes, and defines what the theme list shows when that editor is open.

## Requirements

### Requirement: Theme editing is reachable only from the user menu

Theme management SHALL be opened from a "Theme editor" entry in the user menu. The entry SHALL be rendered only for administrators, and no other place in the application SHALL offer theme management. Activating the entry SHALL open the existing theme management modal.

#### Scenario: An administrator opens the theme editor

- **WHEN** an administrator opens the user menu and activates "Theme editor"
- **THEN** the theme management modal opens
- **AND** the user menu closes

#### Scenario: A regular user cannot reach the theme editor

- **WHEN** a regular user opens the user menu
- **THEN** no "Theme editor" entry is shown
- **AND** the theme management modal cannot be opened from the interface

#### Scenario: The tags sidebar no longer offers theme management

- **WHEN** a user views the tags sidebar footer
- **THEN** no theme management control is shown

### Requirement: The theme list shows only the name and the default marker

Each row of the theme list in the theme editor SHALL show the theme's label. A row for the site default theme SHALL show a default marker. The row SHALL NOT show a color swatch, a color code, or the theme's internal name. The existing row actions and the "Add theme" control SHALL remain available.

#### Scenario: A theme row shows its label

- **WHEN** an administrator opens the theme editor
- **THEN** each theme row shows the theme's label
- **AND** no color swatch, color code, or internal name is shown

#### Scenario: The default theme is marked

- **WHEN** an administrator opens the theme editor
- **THEN** the row of the site default theme shows the default marker
- **AND** the other rows show no default marker

#### Scenario: Row actions stay available

- **WHEN** an administrator views a theme row
- **THEN** the row still offers Edit and Delete, and Activate when the theme is not the default
- **AND** the list still offers "Add theme"
