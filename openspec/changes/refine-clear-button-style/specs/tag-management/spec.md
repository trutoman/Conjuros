## ADDED Requirements

### Requirement: Clear button shows "Clear" above the icon

The sidebar tags-filter `clear` button SHALL display the visible text "Clear" with a capital C, positioned above the clear icon (stacked vertically: text on top, icon below). This supersedes the previous lowercase side-by-side label. Disabled-until-selection semantics and one-click deselect behavior are unchanged.

#### Scenario: Clear button label and stacking

- **WHEN** a user views the tags filter header
- **THEN** the `clear` button shows the text "Clear" with a capital C
- **AND** the text renders above the clear icon, not beside it

#### Scenario: Label is unchanged by selection state

- **WHEN** a user selects or deselects tags
- **THEN** the button label remains "Clear" above the icon in both enabled and disabled states
