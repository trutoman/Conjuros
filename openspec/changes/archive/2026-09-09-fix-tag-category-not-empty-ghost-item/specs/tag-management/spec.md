## ADDED Requirements

### Requirement: Manage tags delete failures are scoped to the management view

Failed tag and tag-category deletes initiated from the Manage tags view SHALL surface their error only inside the Manage tags context (the delete confirmation flow or a dismissible management-view error). The main collection list SHALL NOT render Manage tags delete errors, and neither list SHALL render the error as a first-row dashed-frame entry.

#### Scenario: Non-empty category delete fails from Manage tags

- **WHEN** a user confirms deletion of a non-empty category and the backend rejects it with `Tag category is not empty`
- **THEN** the delete confirmation stays open (or an equivalent scoped management-view error is shown)
- **AND** the main collection list shows no new error frame and its items are unchanged
- **AND** the Manage tags list still shows its existing groups and tags with no ghost first entry

#### Scenario: Tag delete failure does not pollute the collection list

- **WHEN** a tag delete initiated from Manage tags fails
- **THEN** the error is shown only in the Manage tags context
- **AND** the main collection list renders no error frame for that failure

#### Scenario: Scoped delete error is dismissible and does not persist

- **WHEN** a scoped delete error is shown
- **THEN** closing the delete dialog (cancel or view close) or completing a subsequent successful delete clears it
- **AND** reopening Manage tags shows no stale `Tag category is not empty` frame
