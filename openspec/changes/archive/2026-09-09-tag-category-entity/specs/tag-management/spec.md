## ADDED Requirements

### Requirement: Tag form forces a single category choice

The tag create and edit forms SHALL require resolving exactly one category. The category input SHALL default to `general` when the user supplies nothing. Submitting a new name SHALL create that category on demand per the `tag-category` capability; submitting an existing name SHALL assign the tag to it. The form SHALL NOT allow saving a tag with zero categories or with more than one category.

#### Scenario: Tag form defaults to general

- **WHEN** a user opens the Add tag form and saves without touching the category field
- **THEN** the tag is created in the `general` category

#### Scenario: Tag form creates an unknown category

- **WHEN** a user types a new category name in the tag form and saves
- **THEN** the category is created
- **AND** the tag is assigned to it

#### Scenario: Editing a tag moves it between categories

- **WHEN** a user edits a tag and changes its category from `general` to `work`
- **THEN** the tag leaves the `general` member set
- **AND** it joins the `work` member set

### Requirement: Empty categories are visible in tag views

The tag management view and the sidebar category grouping SHALL include categories with zero tags. An empty category SHALL render its name with an empty tag set rather than being hidden. Search filtering SHALL still match empty categories by name.

#### Scenario: Management view shows an empty category

- **WHEN** a user opens tag management while category `hobby` has no tags
- **THEN** `hobby` is displayed with zero tags

#### Scenario: Sidebar shows an empty category group

- **WHEN** a user views the sidebar while category `hobby` has no tags
- **THEN** a `hobby` group is rendered with no tag pills inside

#### Scenario: Search matches an empty category

- **WHEN** a user types text matching only an empty category name in tag search
- **THEN** that empty category remains visible

## MODIFIED Requirements

### Requirement: Tag category validation and normalization

Tag categories SHALL follow the same validation and normalization rules as tag names and SHALL additionally resolve through the TagCategory entity. A tag category SHALL only contain alphanumeric characters and dots, SHALL be trimmed of surrounding whitespace, and SHALL be stored lowercased. Every tag create and update SHALL resolve exactly one category: an existing name assigns the tag, an unknown name creates the category first, and an absent or blank value resolves to the `general` category. These rules SHALL apply on every tag create and update. The stored category value SHALL always equal its normalized lowercase, trimmed form.

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

#### Scenario: Creating a tag without a category uses general

- **WHEN** a user creates a tag without supplying a category
- **THEN** the tag is created with category `general`
- **AND** the `general` category exists afterwards

### Requirement: Existing tags use normalized lowercase categories

Existing tags whose stored category is not already in normalized lowercase form SHALL resolve to their normalized lowercase category. Tags without a stored category SHALL resolve to the normalized default `general`. On migration, one TagCategory entity SHALL be created per distinct normalized category plus a guaranteed `general` category, so no tag is left without exactly one category.

#### Scenario: Legacy tag without a category

- **WHEN** a tag stored without a category is read
- **THEN** its category is surfaced as `general`

#### Scenario: Legacy tag with a capitalized category

- **WHEN** a tag stored with the category `General` is read
- **THEN** its category is surfaced as `general`

#### Scenario: Migration preserves membership

- **WHEN** legacy tags with distinct categories are migrated
- **THEN** each distinct normalized category exists as a TagCategory entity
- **AND** every tag belongs to exactly one of them
