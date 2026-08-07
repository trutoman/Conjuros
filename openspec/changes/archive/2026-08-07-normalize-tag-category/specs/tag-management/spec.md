## ADDED Requirements

### Requirement: Tag category validation and normalization

Tag categories SHALL follow the same validation and normalization rules as tag names. A tag category SHALL only contain alphanumeric characters and dots, SHALL be trimmed of surrounding whitespace, and SHALL be stored lowercased. These rules SHALL apply on every tag create and update. The stored category value SHALL always equal its normalized lowercase, trimmed form.

#### Scenario: Creating a tag with an uppercase category

- **WHEN** a user creates a tag with the category `Work`
- **THEN** the tag is created with category `work`

#### Scenario: Creating a tag with a mixed-case category

- **WHEN** a user creates a tag with the category `DeV.Ops`
- **THEN** the tag is created with category `dev.ops`

#### Scenario: Creating a tag with surrounding whitespace in the category

- **WHEN** a user creates a tag with the category `  work  `
- **THEN** the tag is created with category `work`

#### Scenario: Creating a tag with an invalid category character

- **WHEN** a user creates a tag with a category containing characters other than alphanumeric characters and dots
- **THEN** the creation is rejected with a validation error

#### Scenario: Editing a tag category is normalized

- **WHEN** a user edits a tag and sets its category to `General`
- **THEN** the tag category is stored as `general`

### Requirement: Existing tags use normalized lowercase categories

Existing tags whose stored category is not already in normalized lowercase form SHALL resolve to their normalized lowercase category. Tags without a stored category SHALL resolve to the normalized default `general`.

#### Scenario: Legacy tag without a category

- **WHEN** a tag stored without a category is read
- **THEN** its category is surfaced as `general`

#### Scenario: Legacy tag with a capitalized category

- **WHEN** a tag stored with the category `General` is read
- **THEN** its category is surfaced as `general`

### Requirement: Lowercase display of tag names and categories

Every frame and component that displays a tag SHALL render the tag name and the tag category in lowercase, regardless of the casing of the underlying stored values.

#### Scenario: Sidebar groups tags by category

- **WHEN** a user opens the sidebar with tags whose categories differ only by casing
- **THEN** the sidebar renders a single category group for the normalized category

#### Scenario: Tag management shows lowercase categories

- **WHEN** a user opens the tag management view
- **THEN** every tag name and category is displayed in lowercase

#### Scenario: Item cards show lowercase tags

- **WHEN** a collection item displays its tags
- **THEN** every displayed tag name is lowercase

#### Scenario: Tag forms show lowercase values

- **WHEN** a tag form is opened for an existing tag
- **THEN** the tag name and category inputs show the lowercase values
