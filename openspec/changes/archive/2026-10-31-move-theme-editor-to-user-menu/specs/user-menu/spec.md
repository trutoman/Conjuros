## MODIFIED Requirements

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
