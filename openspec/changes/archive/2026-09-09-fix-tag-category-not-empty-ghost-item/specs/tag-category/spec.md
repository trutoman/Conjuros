## ADDED Requirements

### Requirement: Non-empty category delete failure stays in the delete flow

When deleting a non-empty tag category is rejected with `400 VALIDATION_ERROR "Tag category is not empty"`, the system SHALL keep the category (with all its tags) unchanged, keep the delete confirmation open so the user can acknowledge or cancel, and SHALL NOT insert the error text as a list entry in any category or tag listing. The delete lifecycle rules themselves are unchanged.

#### Scenario: Deleting a non-empty category is rejected without list pollution

- **WHEN** a user attempts to delete a category that contains at least one tag
- **THEN** the request is rejected with a validation error identifying the category as non-empty
- **AND** the category and its tags remain unchanged
- **AND** no listing renders a ghost entry containing `Tag category is not empty` as its first row

#### Scenario: Failed delete keeps the dialog open and clears on cancel

- **WHEN** a non-empty category delete fails
- **THEN** the delete confirmation remains open with the scoped error visible
- **AND** cancelling the dialog dismisses both the dialog and the error
- **AND** the empty-category and `general`-protection rules continue to apply unchanged
