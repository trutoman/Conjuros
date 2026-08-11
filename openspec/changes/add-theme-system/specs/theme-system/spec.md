## Purpose

Database-backed visual themes that define every token of the interface — colors, fonts, font sizes, icon assets, per-item-kind colors, and an allowed tag-color palette — served as CSS custom properties at the root and editable only by an admin.

## ADDED Requirements

### Requirement: Theme is a stored full visual identity

The system SHALL store each theme as a document in the database representing the complete visual identity of the application: surface, page, text, muted-text, border, strong-border, primary, primary-strong, accent-soft, danger, success, warning, and shadow tokens; the font stacks used (display, serif/body, and monospace); the font sizes for headings, body, and monospace; the icon assets used by the UI; a color per item kind (`spell`, `web-link`, `markdown`, `file`); and a curated palette of allowed tag colors. A theme SHALL NOT rely on values hardcoded in the stylesheet. The system SHALL ship the `light` and `dark` themes as seeded defaults that reproduce the application's current appearance.

#### Scenario: A theme defines all visual categories

- **WHEN** an admin views a stored theme
- **THEN** the theme includes color tokens, font stacks, font sizes, icon assets, per-item-kind colors, and a tag color palette

#### Scenario: Default light and dark themes are seeded

- **WHEN** the application starts with an empty themes collection
- **THEN** a `light` theme and a `dark` theme matching the current appearance exist

#### Scenario: Theme values are validated on save

- **WHEN** an admin saves a theme with an invalid value (for example, a color that is not in the required hex format)
- **THEN** the save is rejected with a validation error

### Requirement: Theme maps to CSS custom properties at the root

The application SHALL apply the active theme by converting the stored theme into CSS custom properties and attaching them at the root document element, so existing selectors that consume `var(--*)` or compose values with `color-mix` continue to resolve against the theme. Changing the active theme SHALL update the applied custom properties without a page reload. Font stacks and font sizes from the theme SHALL drive the corresponding `font-family` and `font-size` defaults in place of hardcoded stylesheet values.

#### Scenario: Active theme tokens are emitted as CSS variables

- **WHEN** the application loads with an active theme
- **THEN** the root element carries the theme's tokens as CSS custom properties
- **AND** components resolve `var(--primary)`, `var(--text)`, `var(--surface)`, font stacks, and font sizes from those variables

#### Scenario: Changing the theme re-emits variables without reload

- **WHEN** the active theme changes
- **THEN** the root element's CSS custom properties are replaced with the new theme's tokens
- **AND** the page does not reload

#### Scenario: Missing tokens fall back gracefully

- **WHEN** an active theme lacks a token that the application references
- **THEN** the corresponding CSS custom property falls back to the theme's nearest defined value or a safe default, and the interface remains usable

### Requirement: Admin-only theme management

Only an admin user SHALL be able to create, edit, delete, and activate themes. Any authenticated non-admin user SHALL be able to read themes and the active theme but SHALL receive a 403 response when attempting create, update, delete, or activation operations. Admin status SHALL be established from an `ADMIN_EMAIL` environment value applied to the matching user account at bootstrap.

#### Scenario: Admin edits a theme

- **WHEN** an admin user sends a theme create, update, delete, or activation request
- **THEN** the operation succeeds and the change is persisted

#### Scenario: Non-admin cannot edit themes

- **WHEN** a non-admin authenticated user sends a theme create, update, delete, or activation request
- **THEN** the request is rejected with a 403 response
- **AND** no theme is changed

#### Scenario: Non-admin can read themes

- **WHEN** an authenticated non-admin user requests the active theme or the theme list
- **THEN** the request succeeds and returns the theme data

#### Scenario: Admin is granted via ADMIN_EMAIL

- **WHEN** a user whose email matches the configured `ADMIN_EMAIL` exists at bootstrap
- **THEN** that account carries admin status

### Requirement: Tag colors are chosen from the theme palette

For tags, the color offered to users SHALL be constrained to the active theme's allowed tag color palette. A user saving a tag with a color outside the active theme's palette SHALL be rejected with a validation error. The picker SHALL offer the palette colors as the selectable choices instead of arbitrary colors.

#### Scenario: Picker offers only theme palette colors

- **WHEN** a user opens the tag color picker
- **THEN** the offered colors are exactly the active theme's tag palette

#### Scenario: Saving a non-palette color is rejected

- **WHEN** a user attempts to save a tag with a color that is not in the active theme's palette
- **THEN** the save is rejected with a validation error

#### Scenario: Palette colors change with the active theme

- **WHEN** the active theme changes its tag palette
- **THEN** the tag color picker reflects the new palette