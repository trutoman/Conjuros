## Purpose

Lets authenticated users switch between light and dark themes through a toggle, with the chosen preference taking immediate visual effect and persisting across page loads.

## ADDED Requirements

### Requirement: The applied theme always mirrors the user's light/dark preference

The application SHALL apply exactly one theme to the document at a time, and that theme SHALL match the authenticated user's persisted `light`/`dark` preference. The theme SHALL be applied as CSS custom properties at the root element. The selection SHALL resolve to the stored theme whose name equals the user's preference, and when no stored theme matches the preference, the selection SHALL fall back to the site's default theme.

#### Scenario: Fresh load applies the persisted preference

- **WHEN** an authenticated user whose preference is `dark` loads the application
- **THEN** the dark theme's CSS custom properties are applied at the root element
- **AND** no light-theme tokens remain applied

#### Scenario: Invalid or missing preference falls back to the default theme

- **WHEN** an authenticated user has no stored preference or a preference with no matching theme
- **THEN** the site's default theme is applied at the root element

### Requirement: Changing the preference takes effect immediately without reload

When an authenticated user changes their theme preference through the toggle, the application SHALL persist the new preference and SHALL re-resolve and re-apply the matching theme immediately, without requiring a page reload. The toggle SHALL reflect the currently applied theme as the pressed option.

#### Scenario: Switching to light applies light immediately

- **WHEN** an authenticated user on the dark theme clicks the "Light mode" toggle option
- **THEN** the preference is persisted to the user's account
- **AND** the light theme's CSS custom properties are applied at the root element without a page reload
- **AND** the "Light mode" option is shown as pressed

#### Scenario: Switching to dark applies dark immediately

- **WHEN** an authenticated user on the light theme clicks the "Dark mode" toggle option
- **THEN** the preference is persisted to the user's account
- **AND** the dark theme's CSS custom properties are applied at the root element without a page reload
- **AND** the "Dark mode" option is shown as pressed

#### Scenario: Reload keeps the newly selected theme

- **WHEN** an authenticated user changes their preference to a new value and reloads the page
- **THEN** the theme matching the new preference is applied on load

### Requirement: The active theme endpoint reflects the persisted preference

The API endpoint that returns the active theme for the authenticated user SHALL return the stored theme matching that user's persisted preference, falling back to the default theme when no match exists. The response SHALL include the theme and the resolution source (`preference` or `default`).

#### Scenario: API returns the theme for a saved preference

- **WHEN** an authenticated user whose preference is `light` requests the active theme
- **THEN** the stored light theme is returned with source `preference`

#### Scenario: API falls back when no theme matches the preference

- **WHEN** an authenticated user has a preference whose name matches no stored theme
- **THEN** the default theme is returned with source `default`