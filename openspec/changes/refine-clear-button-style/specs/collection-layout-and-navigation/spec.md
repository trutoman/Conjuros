## ADDED Requirements

### Requirement: Clear button matches the Tags toggle button style

The sidebar `clear` button SHALL be styled practically identically to the `Tags` toggle button (`tags-toggle-btn`): stacked column layout with the label above the icon, the same spacing, and the same label text size. Its position in the header row (between the `Tags` button and the `Match` selector) and the surrounding column layout SHALL NOT otherwise change.

#### Scenario: Clear button mirrors the Tags toggle style

- **WHEN** a user compares the `Clear` button with the `Tags` toggle button in the sidebar header
- **THEN** both render as a vertical stack with the label above the icon
- **AND** their spacing and label text size match

#### Scenario: Header order and layout are preserved

- **WHEN** a user views the expanded left-column tags frame
- **THEN** the header row still shows the `Tags` button first, the `Clear` button next, and the `Match` selector after it
- **AND** no other element in the column has moved, resized, or been restyled
