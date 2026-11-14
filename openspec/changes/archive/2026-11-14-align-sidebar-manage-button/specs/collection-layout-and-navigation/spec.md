# Spec Delta

## ADDED Requirements

### Requirement: Manage tags control ends the sidebar header row

The `Manage tags` control SHALL sit at the end of the sidebar header row on wide viewports, separated from the tags toggle, clear button, and match selector by the row's free space. Its order relative to those controls SHALL NOT change, and on narrow viewports the close button SHALL remain the rightmost control with `Manage tags` immediately before it.

#### Scenario: Settings button ends the expanded header row

- **WHEN** a user views the expanded tags sidebar on a wide viewport
- **THEN** the `Manage tags` button sits at the right end of the header row
- **AND** the tags toggle, clear button, and match selector keep their existing order to its left

#### Scenario: Free space is absorbed before the button

- **WHEN** the sidebar changes width between expanded states
- **THEN** the space between the match selector and `Manage tags` grows or shrinks
- **AND** the `Manage tags` button stays flush with the row's end

#### Scenario: Narrow drawer keeps close last

- **WHEN** the tags drawer is open at or below the mobile breakpoint
- **THEN** the close button is the rightmost control
- **AND** `Manage tags` renders immediately to its left

#### Scenario: Collapsed sidebar is unchanged

- **WHEN** the sidebar is collapsed
- **THEN** only the tags toggle renders and no `Manage tags` control is shown
