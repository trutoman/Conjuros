# tag-category Specification

## Purpose
Tag categories become a first-class owner-scoped data type so categories can exist empty, every tag belongs to exactly one category, and tag creation always resolves to a category with `general` as the guaranteed default.
## Requirements
### Requirement: TagCategory identity and validation

The system SHALL model `TagCategory` as an owner-scoped entity with a plain-text name. A category name SHALL contain only alphanumeric characters and dots, SHALL be trimmed of surrounding whitespace, SHALL be at most 120 characters, and SHALL be stored lowercased. The normalized name uniquely identifies the category within one owner. Validation and normalization rules SHALL be identical to tag names.

#### Scenario: Creating a category with uppercase name

- **WHEN** a user creates a category named `Work`
- **THEN** the category is stored and surfaced as `work`

#### Scenario: Rejecting an invalid category name

- **WHEN** a user creates a category with characters other than alphanumeric characters and dots
- **THEN** the creation is rejected with a validation error

#### Scenario: Categories are owner-scoped

- **WHEN** two different users each create a category named `work`
- **THEN** both succeed as independent categories
- **AND** neither user sees the other's category

### Requirement: TagCategory membership set

Each `TagCategory` SHALL expose the set of tags belonging to it. The set MAY be empty. Adding a tag to a category moves membership; a tag MUST appear in exactly one category set at any time. Deleting a tag SHALL remove it from its category set without deleting the category.

#### Scenario: New category starts empty

- **WHEN** a user creates a category with no tags assigned
- **THEN** the category exists with an empty tag set
- **AND** it is still listed and shown in tag views

#### Scenario: Tag appears in exactly one category

- **WHEN** a tag belongs to category `work`
- **THEN** it appears in the `work` member set
- **AND** it appears in no other category set

#### Scenario: Deleting a tag keeps its category

- **WHEN** a user deletes the last tag in category `work`
- **THEN** the tag is removed from the member set
- **AND** the `work` category still exists as an empty category

### Requirement: Default general category

The `general` category SHALL always exist for every user and SHALL act as the default category. It SHALL be auto-created on demand (first tag creation, first category listing, or migration) when missing. It SHALL NOT be deletable or renamable.

#### Scenario: General auto-created on first use

- **WHEN** a user with no categories creates their first tag without supplying a category
- **THEN** the `general` category is created automatically
- **AND** the tag is assigned to `general`

#### Scenario: General cannot be deleted

- **WHEN** a user attempts to delete the `general` category
- **THEN** the request is rejected with a validation error
- **AND** the `general` category still exists

### Requirement: Category lifecycle and listing

The system SHALL support creating, listing, renaming, reordering, and deleting tag categories. Listing SHALL include empty categories. Deleting a category SHALL only succeed when its tag set is empty. Renaming a category SHALL move all its member tags to the new name and SHALL be rejected when the target name already exists for the same owner.

#### Scenario: Listing includes empty categories

- **WHEN** a user lists categories while `empty-cat` has zero tags
- **THEN** `empty-cat` is included with an empty tag set

#### Scenario: Deleting a non-empty category is rejected

- **WHEN** a user attempts to delete a category that contains at least one tag
- **THEN** the request is rejected with a validation error identifying the category as non-empty

#### Scenario: Renaming moves member tags

- **WHEN** a user renames category `work` to `job`
- **THEN** every tag previously in `work` now belongs to `job`
- **AND** `work` no longer exists

### Requirement: Tag creation resolves exactly one category

Creating a tag SHALL resolve exactly one tag category. When the request supplies an existing category name the tag SHALL be assigned to that category. When the request supplies an unknown category name the system SHALL create the category with that name and then assign the tag to it. When the request supplies no category (absent or blank) the tag SHALL be assigned to `general`.

#### Scenario: Creating a tag with an existing category

- **WHEN** a user creates a tag with category `work` and `work` already exists
- **THEN** the tag is created in `work`
- **AND** no new category is created

#### Scenario: Creating a tag with a new category name

- **WHEN** a user creates a tag with category `hobby` and `hobby` does not exist
- **THEN** the `hobby` category is created
- **AND** the tag is created in `hobby`

#### Scenario: Creating a tag without a category defaults to general

- **WHEN** a user creates a tag without supplying a category
- **THEN** the tag is created in the `general` category

