## MODIFIED Requirements

### Requirement: Sidebar tags header places the clear button between Tags and Match

The expanded tags sidebar header SHALL present the sidebar toggle, clear action, match selector, and tag management action in that order in one flex container. The management action SHALL immediately follow the match selector. A drawer close control, when present, SHALL remain available in that container. All controls except the two match-mode buttons SHALL use the same square icon-only button style and dimensions. The match selector SHALL retain its existing appearance and selection behavior. The sidebar toggle, clear action, and match selector SHALL have no visible Tags, Clear, or Match labels, while all controls SHALL retain accessible names and keyboard operation.

#### Scenario: Expanded sidebar displays the toolbar

- **WHEN** a user views the expanded tags sidebar
- **THEN** the header presents the tags icon button, clear icon button, match selector, and settings icon button in that order in one flex row
- **AND** the non-match buttons are equally sized squares and have no visible text
- **AND** the match buttons retain their existing appearance

#### Scenario: Clear selection remains available

- **WHEN** no tags are selected
- **THEN** the clear action is disabled
- **WHEN** tags are selected and the user activates clear
- **THEN** the selected tags are cleared without changing the match mode

#### Scenario: Clear button follows the sidebar collapse state

- **WHEN** the sidebar is collapsed
- **THEN** the sidebar toggle remains available to expand it
- **AND** the clear, match, and management controls are hidden

#### Scenario: Toolbar controls remain accessible

- **WHEN** a user navigates the toolbar using a keyboard or assistive technology
- **THEN** each action has an accessible name and is keyboard operable
- **AND** the match selector exposes its selected state

#### Scenario: Narrow drawer remains usable

- **WHEN** a user opens the tags drawer on a narrow viewport
- **THEN** the toolbar and drawer close action remain visible, usable, and within the viewport
- **AND** the drawer can still be dismissed using its close action, backdrop, or Escape

### Requirement: The tags sidebar footer offers only tag management

The tags sidebar SHALL offer tag management through the settings icon button in its header rather than a footer control. Theme management SHALL NOT be reachable from the sidebar, because it lives in the user menu instead.

#### Scenario: Sidebar management opens the existing view

- **WHEN** a user activates the settings icon button in the expanded tags sidebar
- **THEN** the existing tag management view opens
- **AND** no separate manage-tags button appears in the sidebar footer

#### Scenario: Administrators also see no theme control in the sidebar

- **WHEN** an administrator views the tags sidebar
- **THEN** no theme management control is shown there
