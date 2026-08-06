## ADDED Requirements

### Requirement: Tag description renders inline

In the tag management view, each tag row SHALL render the tag description on the same line as the tag name, category, and color. When the description overflows the available row width, it SHALL be truncated with an ellipsis rather than wrapping onto a new line.

#### Scenario: Description fits on the tag row

- **WHEN** a tag has a short description
- **THEN** the description renders on the same line as the tag name, category, and color

#### Scenario: Description overflows the tag row

- **WHEN** a tag has a description longer than the available row width
- **THEN** the description is truncated with an ellipsis
- **AND** no new line is introduced in the tag row

#### Scenario: Tag without a description

- **WHEN** a tag has no description
- **THEN** no description element is rendered in the tag row

### Requirement: Tag search box fills the header width

In the tag management header, the tag search box SHALL stretch to fill all available width, matching the layout of the collection search box.

#### Scenario: Tag search box uses available width

- **WHEN** a user opens the tag management view
- **THEN** the tag search box expands to fill the available header space next to the Add tag control
