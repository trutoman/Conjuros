## MODIFIED Requirements

### Requirement: The theme list shows only the name and the default marker

Each row of the theme list in the theme editor SHALL show the theme's label. A row for the site default theme SHALL show a default marker. The row SHALL NOT show a color swatch, a color code, or the theme's internal name. Each row SHALL keep its Edit and Delete actions, and Activate when the theme is not the default. The list SHALL NOT contain its own "Add theme" control.

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

## ADDED Requirements

### Requirement: The theme editor offers a single iconised Add theme control

The theme editor SHALL offer exactly one "Add theme" control. It SHALL sit in the theme management header, before the heading, and SHALL render as an icon button carrying the shared `add` icon and the accessible name "Add theme", matching the app's other add controls. The theme list SHALL NOT repeat the control.

#### Scenario: Only one Add theme control exists

- **WHEN** an administrator opens the theme editor
- **THEN** exactly one control named "Add theme" is offered
- **AND** it is an icon button showing the add icon

#### Scenario: The control sits in the header

- **WHEN** an administrator opens the theme editor
- **THEN** the "Add theme" control appears before the "Manage themes" heading

### Requirement: Adding a theme starts from a chosen existing theme

Activating "Add theme" SHALL first ask the administrator to choose one existing theme as the base. Cancelling that step SHALL open no theme form. Confirming a base theme SHALL open the new-theme form with every editable token copied from the base theme: theme colors, item kind colors, fonts, font sizes, page backdrop, icon assets, tag color palette, and the theme label and internal name as an editable copy-derived identity. The new theme SHALL NOT inherit the base theme's stored background image, and it SHALL start with the image backdrop mode off. The new theme SHALL NOT be marked as the site default.

#### Scenario: Choosing a base theme preloads the form

- **WHEN** an administrator activates "Add theme" and confirms an existing theme as the base
- **THEN** the add-theme form opens
- **AND** its color, kind color, font, font size, backdrop, icon asset, and palette fields carry the base theme's values
- **AND** its name and label are prefilled with an editable copy-derived identity

#### Scenario: Cancelling the base step opens no form

- **WHEN** an administrator activates "Add theme" and cancels the base-theme step
- **THEN** no add-theme form opens
- **AND** the theme editor stays as it was

#### Scenario: Image backdrop is not inherited

- **WHEN** the chosen base theme uses an image backdrop
- **THEN** the add-theme form opens in pattern backdrop mode
- **AND** it holds no stored image reference

#### Scenario: The copy is not the site default

- **WHEN** the add-theme form opens from a base theme that is the site default
- **THEN** the new theme's "Make site default" control is unchecked

#### Scenario: A copy-derived name stays unique and editable

- **WHEN** an administrator opens the add-theme form from a base theme whose derived name is already used
- **THEN** the form prefills a different, valid name
- **AND** the administrator can still edit the name and label before saving

### Requirement: The theme form opens in a wide modal

The add and edit theme form SHALL open in a modal wider than the standard `wide` modal, so the color and token grids fit without horizontal scrolling on a desktop viewport.

#### Scenario: The theme form uses the widest form modal

- **WHEN** an administrator opens the add or edit theme form
- **THEN** the dialog panel uses the extra-wide modal size
- **AND** the form content fits inside the panel

### Requirement: Every color field shows a swatch beside its value

In the theme form, each field whose value is a single CSS color SHALL render a square swatch of that color immediately to the left of the value, inside the same bordered container as the value input. The swatch SHALL follow the current value while the administrator types. The composite `shadow` field SHALL NOT render a swatch because it is not a single color.

#### Scenario: A color field shows its swatch

- **WHEN** an administrator opens the theme form
- **THEN** each color token field shows a square swatch to the left of its value
- **AND** the swatch uses the current color value
- **AND** the swatch and the value share one container

#### Scenario: The swatch follows edits

- **WHEN** an administrator changes a color value
- **THEN** the swatch beside that value updates to the new color

#### Scenario: Composite shadow has no swatch

- **WHEN** an administrator views the shadow field
- **THEN** no color swatch is shown for it

#### Scenario: Palette entries keep a color picker swatch

- **WHEN** an administrator views a tag palette entry
- **THEN** a square color picker appears to the left of its hex value inside the same container
