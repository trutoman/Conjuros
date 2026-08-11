## ADDED Requirements

### Requirement: Tag colors are chosen from the active theme palette

The tag form SHALL constrain tag color choice to the active theme's allowed tag color palette. The color field SHALL offer the palette colors as selectable swatches and SHALL NOT allow arbitrary colors outside the palette. Submitting a tag whose color is not in the active theme's palette SHALL be rejected with a validation message naming the requirement, and the tag SHALL NOT be saved.

#### Scenario: Picker offers only theme palette colors

- **WHEN** a user opens the tag form's color field
- **THEN** the selectable colors are exactly the active theme's tag palette

#### Scenario: Saving a tag with a palette color succeeds

- **WHEN** a user selects and saves a tag whose color is in the active theme's palette
- **THEN** the tag is saved with that color

#### Scenario: Saving a tag with an out-of-palette color is rejected

- **WHEN** a user enters a color outside the active theme's palette and saves the tag
- **THEN** the form shows a validation error
- **AND** the tag is not saved

#### Scenario: Near-miss casing still rejects out-of-palette colors

- **WHEN** a user enters a color equal to a palette color but with different casing (for example, a palette `#123ABC` entered as `#123abc`)
- **THEN** the color is accepted as part of the palette if the palette normalizes case, or rejected otherwise
- **AND** the behavior is consistent for both the picker and the text input