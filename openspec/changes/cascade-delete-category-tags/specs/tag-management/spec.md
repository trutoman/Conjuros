## MODIFIED Requirements

### Requirement: Manage tags delete failures are scoped to the management view

Failed tag and tag-category deletes initiated from the Manage tags view SHALL surface their error only inside the Manage tags context (the delete confirmation flow or a dismissible management-view error). The main collection list SHALL NOT render Manage tags delete errors, and neither list SHALL render the error as a first-row dashed-frame entry. Deleting a non-empty category is not a failure: it cascades (see the cascade requirement below) and closes the confirmation on success.

#### Scenario: Tag delete failure does not pollute the collection list

- **WHEN** a tag delete initiated from Manage tags fails
- **THEN** the error is shown only in the Manage tags context
- **AND** the main collection list renders no error frame for that failure

#### Scenario: Protected category delete failure stays scoped

- **WHEN** a user confirms deletion of the `general` category and the backend rejects it
- **THEN** the delete confirmation stays open with the scoped error visible
- **AND** the main collection list shows no new error frame and its items are unchanged

#### Scenario: Scoped delete error is dismissible and does not persist

- **WHEN** a scoped delete error is shown
- **THEN** closing the delete dialog (cancel or view close) or completing a subsequent successful delete clears it
- **AND** reopening Manage tags shows no stale error frame

## ADDED Requirements

### Requirement: Deleting a category from Manage tags cascades to its tags

Deleting a tag category from the Manage tags view SHALL delete every member tag first and then the category itself. The delete confirmation SHALL communicate that the category's tags will also be deleted before the user confirms. On success the confirmation SHALL close and both the tags and categories lists SHALL refresh with the tags and the category gone and no stale error shown.

#### Scenario: Confirming a non-empty category delete removes its tags and the category

- **WHEN** a user confirms deletion of a category that contains tags
- **THEN** every member tag is deleted
- **AND** the category is deleted afterwards
- **AND** the confirmation closes
- **AND** the Manage tags list no longer shows the tags or the category

#### Scenario: Confirmation communicates the cascade

- **WHEN** a user opens the delete confirmation for a category that contains tags
- **THEN** the confirmation states that the member tags will also be deleted
