## MODIFIED Requirements

### Requirement: Narrow viewports hide the tags sidebar by default

On viewports at or below the mobile breakpoint, the collection SHALL NOT render the tags sidebar until the user asks for it. The search field, type filter, and item list SHALL be visible on load without first scrolling past a tag panel. On viewports above the breakpoint the sidebar SHALL keep its expand/collapse state, which SHALL be stored in the user's preferences so that it is restored on any device.

#### Scenario: Narrow viewport loads without the sidebar

- **WHEN** a user opens the collection on a viewport at or below the mobile breakpoint
- **THEN** the tags sidebar is not rendered
- **AND** the search field and item list are visible

#### Scenario: Narrow viewport keeps search and filters reachable

- **WHEN** a user opens the collection on a narrow viewport
- **THEN** the search field and the type filter are available without opening the tags panel

#### Scenario: Wide viewport keeps the existing sidebar

- **WHEN** a user opens the collection on a viewport above the mobile breakpoint
- **THEN** the sidebar follows the expanded or collapsed state saved in the user's preferences

#### Scenario: Desktop sidebar state follows the user across browsers

- **WHEN** a user collapses the desktop tags sidebar in one browser and opens the collection in another browser on a wide viewport
- **THEN** the sidebar is collapsed there too
