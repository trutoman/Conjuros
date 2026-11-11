# Collection Layout and Navigation

## Purpose

This capability covers the collection shell, sidebar behavior, search and filter placement, and layout adjustments that improve navigation and focus.

## Requirements

- The main collection layout must support a clear shell with sidebar and content regions.
- Tags and collection content must be navigable without rebuilding the full view unnecessarily.
- Search and filter controls must remain discoverable and usable from the main content experience.
- Sidebar collapse and expand behaviors must preserve usability and accessibility.

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

### Requirement: Topbar Tags button opens the tags drawer on narrow viewports

On viewports at or below the mobile breakpoint the topbar SHALL render a `Tags` control adjacent to the `Conjuros` title. Activating it SHALL open the tags sidebar as an overlay drawer above the collection content, backed by a dismiss backdrop. The control SHALL expose its expanded state and the panel it controls to assistive technology. The control SHALL NOT be rendered on wider viewports.

#### Scenario: Tags button sits next to the title on narrow viewports

- **WHEN** a user opens the collection on a viewport at or below the mobile breakpoint
- **THEN** a `Tags` button is shown next to the `Conjuros` title

#### Scenario: Activating the button opens the drawer

- **WHEN** a user activates the topbar `Tags` button on a narrow viewport
- **THEN** the tags sidebar renders as an overlay drawer with its tag list and actions
- **AND** a backdrop covers the collection content behind it

#### Scenario: Tags button is absent on wide viewports

- **WHEN** a user opens the collection on a viewport above the mobile breakpoint
- **THEN** the topbar does not show the `Tags` button

### Requirement: Tags drawer dismisses without changing persisted state

The narrow-viewport tags drawer SHALL close through its close control, a click on the backdrop, or the `Escape` key. Opening or closing the drawer SHALL NOT change the persisted desktop sidebar preference and SHALL NOT persist the drawer's own open state, so a reload returns to the sidebar hidden.

#### Scenario: Close control closes the drawer

- **WHEN** a user activates the drawer's close control
- **THEN** the drawer is removed
- **AND** the collection content is interactive again

#### Scenario: Backdrop click closes the drawer

- **WHEN** a user clicks the drawer backdrop
- **THEN** the drawer is removed

#### Scenario: Escape closes the drawer

- **WHEN** the drawer is open and the user presses `Escape`
- **THEN** the drawer is removed

#### Scenario: Drawer state is not persisted

- **WHEN** a user opens the drawer on a narrow viewport and then reloads the page
- **THEN** the tags sidebar is hidden again on load

#### Scenario: Wide viewport collapse state is unaffected

- **WHEN** a user opens and closes the drawer on a narrow viewport
- **THEN** the persisted expanded/collapsed preference used by wide viewports is unchanged

### Requirement: A single mobile breakpoint governs the narrow layout

The narrow-viewport presentation SHALL be governed by a single mobile breakpoint so the collection shell, topbar, sidebar, and content share one consistent narrow mode. The obsolete duplicated `650px` rules SHALL be removed, and viewports between `650px` and the mobile breakpoint SHALL use the same narrow presentation as smaller viewports.

#### Scenario: Width between 650px and the breakpoint uses the narrow presentation

- **WHEN** a user views the collection at a width above `650px` but at or below the mobile breakpoint
- **THEN** the narrow presentation applies
- **AND** the tags sidebar is hidden behind the topbar `Tags` button

#### Scenario: No conflicting breakpoint overrides the narrow layout

- **WHEN** a user resizes across the `650px` width
- **THEN** the collection layout does not switch between two different narrow modes

### Requirement: The tags sidebar footer offers only tag management

The tags sidebar footer SHALL offer only tag management. Theme management SHALL NOT be reachable from the sidebar, because it lives in the user menu instead.

#### Scenario: Sidebar footer shows no theme control

- **WHEN** a user views the tags sidebar footer
- **THEN** the footer shows the tag management control
- **AND** it shows no theme management control

#### Scenario: Administrators also see no theme control in the sidebar

- **WHEN** an administrator views the tags sidebar footer
- **THEN** no theme management control is shown there either

### Requirement: Tags controls render the theme's tags artwork

The tags sidebar toggle and the narrow-viewport topbar `Tags` button SHALL render the active theme's `tags` artwork. The artwork SHALL come from `iconAssets.tags` and SHALL update when the theme changes.

#### Scenario: Sidebar toggle uses the theme tags icon

- **WHEN** a user views the tags sidebar toggle
- **THEN** it renders the active theme's `tags` path and viewBox

#### Scenario: Topbar Tags button uses the theme tags icon

- **WHEN** a narrow viewport shows the topbar `Tags` button
- **THEN** it renders the active theme's `tags` path and viewBox

#### Scenario: Theme change updates the tags controls

- **WHEN** the active theme changes
- **THEN** both tags controls immediately use the new theme's `tags` artwork

### Requirement: Sidebar tag categories follow the persisted category order

The tags sidebar SHALL list category groups in the persisted tag category `order` ascending (lowest first), the same order shown in the tag management view. Groups for categories that have no category record SHALL follow the ordered ones, sorted alphabetically. Tags within a group SHALL remain sorted alphabetically by name.

#### Scenario: Sidebar mirrors the manage tags order

- **WHEN** the user has categories ordered `work`, `personal`, `hobby`
- **THEN** the sidebar shows the groups in that sequence, not alphabetically

#### Scenario: Reordering is reflected in the sidebar

- **WHEN** the user moves a category in the tag management view
- **THEN** the sidebar shows the groups in the new order

#### Scenario: Tag-only categories come last

- **WHEN** a tag references a category with no category record
- **THEN** its group appears after all ordered categories
