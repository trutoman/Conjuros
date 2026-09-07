## ADDED Requirements

### Requirement: Tag form and tag management view open as floating modals

The Add tag form, the Edit tag form, and the Manage tags view SHALL open as floating modals over the persistent item list instead of replacing the collection view. The existing Close ("X") and Cancel controls keep their current behavior (dismiss without saving, typed input discarded) and additionally a backdrop click dismisses the modal the same way. The "Add tag" entry point remains inside the Manage tags modal, opening the tag form as a nested modal stacked above it.

#### Scenario: Opening Manage tags keeps the collection list visible

- **WHEN** the user opens "Manage tags"
- **THEN** the tag management view opens as a floating modal
- **AND** the collection subheader and item list remain visible behind it

#### Scenario: Opening Add tag stacks over Manage tags

- **WHEN** the user clicks "Add tag" inside the Manage tags modal
- **THEN** the tag form opens as a nested modal above the Manage tags modal
- **AND** closing the tag form reveals the Manage tags modal unchanged

#### Scenario: Backdrop click discards and reveals the list

- **WHEN** the user clicks outside the Add tag dialog
- **THEN** the form closes without saving the tag
- **AND** any typed input is discarded
- **AND** the underlying view (Manage tags modal or item list) is revealed unchanged
