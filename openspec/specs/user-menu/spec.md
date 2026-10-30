# User Menu

## Purpose

Gives every signed-in user a dropdown opened from their name in the top-right corner, with entries for profile (placeholder), theme selection, and sign out.

## Requirements

### Requirement: The user name opens a dropdown menu

Activating the user's name in the top-right corner SHALL open a dropdown menu, and activating it again or pressing `Escape` SHALL close it. The menu SHALL contain, in order, a "Profile" entry, a "Theme selector" entry, and a "Sign out" entry. For administrators only, a "Theme editor" entry SHALL appear between "Theme selector" and "Sign out".

#### Scenario: Opening the menu shows its entries

- **WHEN** a regular user activates their name in the top-right corner
- **THEN** the menu shows "Profile", "Theme selector", and "Sign out"

#### Scenario: An administrator sees the theme editor entry

- **WHEN** an administrator activates their name in the top-right corner
- **THEN** the menu shows "Profile", "Theme selector", "Theme editor", and "Sign out"

#### Scenario: Escape closes the menu

- **WHEN** the menu is open and the user presses `Escape`
- **THEN** the menu closes

### Requirement: Profile is visible but not available yet

The "Profile" entry SHALL be shown but SHALL be disabled and SHALL NOT navigate or open anything.

#### Scenario: Profile entry cannot be activated

- **WHEN** a user activates the "Profile" entry
- **THEN** nothing happens and the menu stays open

### Requirement: Theme selector and sign out entries work from the menu

Activating "Theme selector" SHALL open the theme selector modal and close the menu. Activating "Sign out" SHALL sign the user out, as the previous sign-out control did.

#### Scenario: Theme selector opens from the menu

- **WHEN** a user activates "Theme selector"
- **THEN** the theme selector modal opens
- **AND** the menu closes

#### Scenario: Sign out works from the menu

- **WHEN** a user activates "Sign out"
- **THEN** the session ends as before
