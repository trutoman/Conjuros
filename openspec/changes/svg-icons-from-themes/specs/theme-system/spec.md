## MODIFIED Requirements

### Requirement: Theme icon assets store SVG definitions

The system SHALL store each theme's icon assets as keyed definitions: for each icon key the theme uses, the theme SHALL carry the icon's SVG `path` data and `viewBox` from which the UI renders the icon. The icon keys SHALL include at minimum: the four item kinds (`spell`, `web-link`, `markdown`, `file`) plus the interactive controls (`copy`, `open`, `view`, `download`, `menu`, `edit`, `delete`, `confirm`, `cancel`, `expand`, `collapse`, `close`, `search`, `sun`, `moon`, `add`). The system SHALL NOT rely on icon glyph markup hardcoded in the stylesheet or JSX; the UI SHALL render the active theme's icon definitions.

#### Scenario: A theme stores icon path and viewBox per key

- **WHEN** an admin views a stored theme
- **THEN** each icon key in the theme carries an SVG path and a viewBox

#### Scenario: Default light and dark themes seed the current icons

- **WHEN** the application starts with an empty themes collection
- **THEN** the `light` and `dark` themes include icon definitions reproducing the application's current icons for every key

#### Scenario: Icon definitions are validated on save

- **WHEN** an admin saves a theme with an icon definition missing a path or viewBox
- **THEN** the save is rejected with a validation error

### Requirement: Admin-only theme management

Only an admin user SHALL be able to create, edit, delete, and activate themes. Any authenticated non-admin user SHALL be able to read themes and the active theme but SHALL receive a 403 response when attempting create, update, delete, or activation operations. Admin status SHALL be established from an `ADMIN_EMAIL` environment value applied to the matching user account at bootstrap.

#### Scenario: Admin edits a theme

- **WHEN** an admin user sends a theme create, update, delete, or activation request
- **THEN** the operation succeeds and the change is persisted

#### Scenario: Non-admin cannot edit themes

- **WHEN** a non-admin authenticated user sends a theme create, update, delete, or activation request
- **THEN** the request is rejected with a 403 response
- **AND** no theme is changed

#### Scenario: Admin is granted via ADMIN_EMAIL

- **WHEN** a user whose email matches the configured `ADMIN_EMAIL` exists at bootstrap
- **THEN** that account carries admin status