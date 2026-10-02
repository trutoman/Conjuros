## MODIFIED Requirements

### Requirement: Existing tags use normalized lowercase categories

Tags whose category is not already in normalized lowercase form SHALL resolve to their normalized lowercase category. Tags that belong to no category SHALL resolve to the normalized default `general`. Membership SHALL be persisted in the `TagCategory` entity's `tagIds` set; a stored tag SHALL carry no category fields.

#### Scenario: Tag that belongs to no category

- **WHEN** a tag that belongs to no category is read
- **THEN** its category is surfaced as `general`

#### Scenario: Tag in a capitalized category

- **WHEN** a tag that belongs to a category stored as `General` is read
- **THEN** its category is surfaced as `general`

#### Scenario: Stored tags carry no category fields

- **WHEN** the stored representation of a tag is inspected
- **THEN** it contains neither `tagCategory` nor `tagCategoryNormalized`
