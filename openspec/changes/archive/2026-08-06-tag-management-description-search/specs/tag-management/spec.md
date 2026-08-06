## ADDED Requirements

### Requirement: Tag rows show the tag description

Each tag row in the tag management view SHALL display the tag's description when one is present, as a muted secondary line below the tag label. Rows with an empty description SHALL render without a description line.

#### Scenario: Tag with a description shows it in the row

- **WHEN** a user opens the tag management view
- **AND** a tag has a description
- **THEN** the tag row shows the description below the tag label

#### Scenario: Tag without a description shows no description line

- **WHEN** a user opens the tag management view
- **AND** a tag has no description
- **THEN** the tag row renders without a description line

### Requirement: Tag management search filters by name and category

The tag management view SHALL provide a search box in its header, visually consistent with the collection search field, that filters the visible tags by tag name and tag category as the user types. The search SHALL be case-insensitive and match when the query appears in the tag name or the tag category.

#### Scenario: Search filters tags by name

- **WHEN** a user types text in the tag management search box
- **AND** the text matches a tag's name
- **THEN** only tags whose name or category contains the text remain visible

#### Scenario: Search filters tags by category

- **WHEN** a user types text in the tag management search box
- **AND** the text matches a tag's category but not its name
- **THEN** the tag remains visible

#### Scenario: Clearing the search shows all tags

- **WHEN** a user clears the tag management search box
- **THEN** all tags are visible again

#### Scenario: No matches shows an empty result

- **WHEN** a user types text that matches no tag name or category
- **THEN** the tag list shows no tags
