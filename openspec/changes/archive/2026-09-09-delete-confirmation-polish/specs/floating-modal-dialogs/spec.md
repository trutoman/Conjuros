## ADDED Requirements

### Requirement: Delete confirmation action buttons have visible spacing

The delete confirmation dialog's action buttons ("Delete item" and "Cancel") SHALL render with slight visible horizontal spacing between them instead of sitting stuck together. The spacing SHALL follow the active theme (no hardcoded colors) and SHALL apply to every delete confirmation (collection items, tags, tag categories) since they share the dialog.

#### Scenario: Confirmation buttons are separated

- **WHEN** a user opens any delete confirmation dialog
- **THEN** the "Delete item" and "Cancel" buttons show a visible gap between them

#### Scenario: Spacing holds across delete flows

- **WHEN** a user opens the delete confirmation for a collection item, a tag, or a tag category
- **THEN** the button spacing is present in each case
