## MODIFIED Requirements

### Requirement: Default general category

The `general` category SHALL always exist for every user and SHALL act as the default category. It SHALL be auto-created on demand (first tag creation or first category listing) when missing. It SHALL NOT be deletable or renamable.

#### Scenario: General auto-created on first use

- **WHEN** a user with no categories creates their first tag without supplying a category
- **THEN** the `general` category is created automatically
- **AND** the tag is assigned to `general`

#### Scenario: General cannot be deleted

- **WHEN** a user attempts to delete the `general` category
- **THEN** the request is rejected with a validation error
- **AND** the `general` category still exists
