## Purpose

Lets every user choose any stored theme from a modal, keeps the light/dark toggle working alongside the full list, and applies the user's saved theme when the application starts.

## ADDED Requirements

### Requirement: The theme selector lists every stored theme

The theme selector modal SHALL list every stored theme as a vertical list, reading the list from the themes API, and SHALL mark the user's currently selected theme. It SHALL use the same modal presentation as the other application modals.

#### Scenario: All themes are listed

- **WHEN** a user opens the theme selector
- **THEN** every stored theme appears once in a vertical list
- **AND** the user's current theme is marked as selected

#### Scenario: Themes load with the modal

- **WHEN** the theme list is loading
- **THEN** the modal shows a loading state instead of an empty list

### Requirement: Saving the selector applies the choice and closes the modal

Choosing a theme in the selector SHALL NOT apply it until the user activates "Save theme preferences". Activating it SHALL save the chosen theme as the user's preference, apply it immediately, and close the modal. Closing the modal without saving SHALL leave the current theme unchanged.

#### Scenario: A user saves a new theme

- **WHEN** a user selects a theme and activates "Save theme preferences"
- **THEN** the theme is saved as the user's preference and applied
- **AND** the modal closes

#### Scenario: A user closes without saving

- **WHEN** a user selects a theme and closes the modal without saving
- **THEN** the previously applied theme stays in effect
- **AND** the preference is not changed

#### Scenario: Save failure keeps the modal open

- **WHEN** saving the preference fails
- **THEN** the modal stays open with an error message
- **AND** the previously applied theme stays in effect

### Requirement: The light/dark toggle selects the stored light or dark theme

The existing light and dark toggle SHALL select the stored theme named `light` or `dark`, SHALL save the choice when pressed, and SHALL apply it immediately. When the user's selected theme is neither `light` nor `dark`, both toggle options SHALL appear unselected.

#### Scenario: Pressing the dark option applies the dark theme

- **WHEN** a user presses the dark option
- **THEN** the stored `dark` theme is saved and applied immediately

#### Scenario: A custom theme leaves both options unselected

- **WHEN** a user's selected theme is not named `light` or `dark`
- **THEN** neither the light option nor the dark option is pressed

### Requirement: Startup restores the saved theme and tags panel state

When an authenticated user opens the application, the saved theme SHALL be applied and the desktop tags panel SHALL be shown expanded or collapsed according to the saved `tagsPanelExpanded` value, before the user interacts with the page.

#### Scenario: A returning user sees the saved theme

- **WHEN** a user whose saved theme is a custom theme opens the application
- **THEN** that theme is applied on first render

#### Scenario: A returning user sees the saved tags panel state

- **WHEN** a user whose saved `tagsPanelExpanded` is `false` opens the collection on a desktop viewport
- **THEN** the tags panel is collapsed
