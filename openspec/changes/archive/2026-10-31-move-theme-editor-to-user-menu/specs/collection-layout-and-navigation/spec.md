## ADDED Requirements

### Requirement: The tags sidebar footer offers only tag management

The tags sidebar footer SHALL offer only tag management. Theme management SHALL NOT be reachable from the sidebar, because it lives in the user menu instead.

#### Scenario: Sidebar footer shows no theme control

- **WHEN** a user views the tags sidebar footer
- **THEN** the footer shows the tag management control
- **AND** it shows no theme management control

#### Scenario: Administrators also see no theme control in the sidebar

- **WHEN** an administrator views the tags sidebar footer
- **THEN** no theme management control is shown there either
