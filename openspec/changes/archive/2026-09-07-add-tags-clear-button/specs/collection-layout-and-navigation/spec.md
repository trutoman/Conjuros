## ADDED Requirements

### Requirement: Sidebar tags header places the clear button between Tags and Match

The sidebar tags-frame header SHALL render the `clear` button in the same header row between the `Tags` toggle button and the `Match` (any/all) selector. The existing column distribution and the positions of the `Tags` button and the `Match` selector SHALL NOT otherwise change, and the tag list, footer, and sidebar regions SHALL keep their current layout.

#### Scenario: Clear button sits between Tags and Match

- **WHEN** a user views the expanded left-column tags frame
- **THEN** the header row shows the `Tags` button first, the `clear` button next, and the `Match` selector after it

#### Scenario: Column layout is otherwise unchanged

- **WHEN** a user compares the tags column before and after this change apart from the added button
- **THEN** no other element in the column has moved, resized, or been restyled to accommodate the button

#### Scenario: Clear button follows the sidebar collapse state

- **WHEN** the sidebar is collapsed
- **THEN** the header controls, including the `clear` button, follow the same collapse behavior as the existing header controls
