## ADDED Requirements

### Requirement: Delete confirmation dialog follows the active theme

The delete confirmation dialog SHALL render its surface, border, and text with the shared theme variables instead of hardcoded light colors, so the dialog matches the surrounding page in every theme. Dialog structure, buttons, copy, dismissal, and error display SHALL remain unchanged.

#### Scenario: Delete confirmation matches the page theme

- **WHEN** a user opens a delete confirmation (for a tag, a tag category, or any other deletable object) while a non-default theme is active
- **THEN** the dialog background, border, and text use the active theme's surface, border, and text colors
- **AND** no hardcoded light-only color remains visible in the dialog

#### Scenario: Delete confirmation in the default theme stays light and consistent

- **WHEN** a user opens a delete confirmation with the default light theme active
- **THEN** the dialog keeps a light appearance consistent with the other dialog panels
- **AND** all existing dialog behavior (confirm, cancel, backdrop and Escape dismissal, error display) works as before
