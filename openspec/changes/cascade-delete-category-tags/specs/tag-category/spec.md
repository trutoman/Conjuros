## MODIFIED Requirements

### Requirement: Category lifecycle and listing

The system SHALL support creating, listing, renaming, reordering, and deleting tag categories. Listing SHALL include empty categories. Deleting a category SHALL cascade: every member tag is deleted first (each with the same semantics as deleting that tag on its own, including removing it from items), then the category itself is deleted. The `general` category SHALL NOT be deletable. Renaming a category SHALL move all its member tags to the new name and SHALL be rejected when the target name already exists for the same owner.

#### Scenario: Listing includes empty categories

- **WHEN** a user lists categories while `empty-cat` has zero tags
- **THEN** `empty-cat` is included with an empty tag set

#### Scenario: Deleting a non-empty category cascades to its tags

- **WHEN** a user deletes a category that contains at least one tag
- **THEN** every member tag is deleted first
- **AND** the category is deleted afterwards
- **AND** the request succeeds instead of being rejected as non-empty

#### Scenario: Deleting an empty category still succeeds

- **WHEN** a user deletes a category that contains zero tags
- **THEN** the category is deleted
- **AND** no tag is affected

#### Scenario: General still cannot be deleted

- **WHEN** a user attempts to delete the `general` category
- **THEN** the request is rejected with a validation error
- **AND** the `general` category still exists with all its tags

#### Scenario: Renaming moves member tags

- **WHEN** a user renames category `work` to `job`
- **THEN** every tag previously in `work` now belongs to `job`
- **AND** `work` no longer exists

## REMOVED Requirements

### Requirement: Non-empty category delete failure stays in the delete flow
**Reason**: Replaced by cascade delete; deleting a non-empty category no longer fails, so there is no rejection to keep in the delete flow.
**Migration**: Deleting a non-empty category now succeeds with `204` and removes all member tags first. Clients that relied on the `400 "Tag category is not empty"` rejection must be updated; genuine failures (protected `general` category, unknown id) keep their existing error behavior.
