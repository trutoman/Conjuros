## Purpose

Stores each user's own choices (the selected theme and the desktop tags panel state) in a dedicated record, so they follow the user across sessions and devices and fall back to the site defaults when unset.

## ADDED Requirements

### Requirement: Each user has one preferences record

Every user SHALL have exactly one preferences record holding `themeId` (a stored theme id, or `null`) and `tagsPanelExpanded` (a boolean). The record SHALL be created with `themeId: null` and `tagsPanelExpanded: true` the first time it is needed, and SHALL NOT be shared between users.

#### Scenario: A new user gets default preferences

- **WHEN** a user without a preferences record reads their preferences
- **THEN** the response has `themeId: null` and `tagsPanelExpanded: true`

#### Scenario: Preferences are private to their owner

- **WHEN** a user reads or updates preferences
- **THEN** only that user's record is read or changed

### Requirement: Users update their own preferences

`PATCH /api/auth/me/preferences` SHALL accept any subset of `themeId` and `tagsPanelExpanded` for the authenticated user. `themeId` SHALL be either `null` or the id of an existing stored theme. The endpoint SHALL answer 400 for an unknown theme id and 401 without a session. Unknown fields SHALL be ignored.

#### Scenario: A user selects an existing theme

- **WHEN** an authenticated user sends `themeId` set to the id of an existing theme
- **THEN** the response is 200 with the updated preferences
- **AND** the next session read returns the same `themeId`

#### Scenario: A user selects a theme that does not exist

- **WHEN** an authenticated user sends a `themeId` that matches no stored theme
- **THEN** the response is 400
- **AND** the stored preference is unchanged

#### Scenario: A user saves the tags panel state

- **WHEN** an authenticated user sends `tagsPanelExpanded: false`
- **THEN** the response is 200 with `tagsPanelExpanded: false`

### Requirement: The selected theme falls back to the site's active theme

When a user's `themeId` is `null`, or refers to a theme that no longer exists, the active theme endpoint SHALL return the site's active theme (the theme marked as default). A theme deleted while selected SHALL NOT make the active theme endpoint fail.

#### Scenario: A user without a selection gets the site theme

- **WHEN** a user with `themeId: null` requests the active theme
- **THEN** the response contains the theme marked as the site's active theme

#### Scenario: A deleted selected theme falls back

- **WHEN** a user's selected theme has been deleted
- **THEN** the active theme endpoint returns the site's active theme
- **AND** the stored preference is not rewritten by the read

### Requirement: Legacy light and dark preferences migrate to theme ids

The migration SHALL convert every existing `users.theme` value of `light` or `dark` into a `user_preferences.theme_id` pointing at the seeded theme with that name, and then remove the `users.theme` column. Users with no value SHALL get `themeId: null`.

#### Scenario: An existing dark user keeps the dark theme

- **WHEN** the migration runs for a user whose stored theme is `dark`
- **THEN** their `themeId` is the id of the seeded `dark` theme

#### Scenario: An existing user without a theme keeps the site theme

- **WHEN** the migration runs for a user with no stored theme value
- **THEN** their `themeId` is `null`
