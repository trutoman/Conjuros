## ADDED Requirements

### Requirement: Public tag payloads expose the derived category

Tag API responses SHALL keep exposing the `tagCategory` field, derived from the tag's `TagCategory` membership at read time. Tag list search and sort by category SHALL keep working. No frontend change is required by the storage migration.

#### Scenario: Tag payload still carries its category

- **WHEN** a user reads a tag that belongs to category `work`
- **THEN** the payload contains `tagCategory` with value `work`

#### Scenario: Search by category keeps working

- **WHEN** a user searches tags with text matching only a category name
- **THEN** tags in that category are returned

## MODIFIED Requirements

### Requirement: Tag category validation and normalization

Tag categories SHALL follow the same validation and normalization rules as tag names and SHALL additionally resolve through the TagCategory entity. A tag category SHALL only contain alphanumeric characters and dots, SHALL be trimmed of surrounding whitespace, and SHALL be stored lowercased. Every tag create and update SHALL resolve exactly one category: an existing name assigns the tag, an unknown name creates the category first, and an absent or blank value resolves to the `general` category. These rules SHALL apply on every tag create and update. Membership SHALL be persisted in the `TagCategory` entity's `tagIds` set; tag documents SHALL carry no category fields. The category surfaced for a tag SHALL always equal its normalized lowercase, trimmed membership.

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
- **THEN** the tag belongs to the `general` category

#### Scenario: Creating a tag without a category uses general

- **WHEN** a user creates a tag without supplying a category
- **THEN** the tag is created with category `general`
- **AND** the `general` category exists afterwards

### Requirement: Existing tags use normalized lowercase categories

Existing tags whose stored category is not already in normalized lowercase form SHALL resolve to their normalized lowercase category. Tags without a stored category SHALL resolve to the normalized default `general`. On migration, one TagCategory entity SHALL be created per distinct normalized category plus a guaranteed `general` category, so no tag is left without exactly one category. Membership SHALL be persisted in the `TagCategory` entity's `tagIds` set; no tag document SHALL contain the legacy `tagCategory` or `tagCategoryNormalized` fields.

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

#### Scenario: No tag document carries legacy fields

- **WHEN** any tag document is inspected in the database
- **THEN** it contains neither `tagCategory` nor `tagCategoryNormalized`
