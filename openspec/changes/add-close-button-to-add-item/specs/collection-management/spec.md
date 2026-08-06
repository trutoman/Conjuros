## ADDED Requirements

### Requirement: Item form has a floating close button

The item form (Add item and Edit item) SHALL display a borderless, floating close button in the top-right corner of the form. Activating the button SHALL dismiss the form and return to the previous view, equivalent to activating the `Cancel` button. The button SHALL expose an accessible name describing its action.

#### Scenario: Add item form closes via floating close button

- **WHEN** a user opens the Add item form
- **THEN** a floating close button appears in the top-right corner of the form
- **AND** activating the close button dismisses the form and returns to the previous view

#### Scenario: Edit item form closes via floating close button

- **WHEN** a user opens the Edit item form
- **THEN** a floating close button appears in the top-right corner of the form
- **AND** activating the close button dismisses the form and returns to the previous view
