# Spec Delta

## ADDED Requirements

### Requirement: Sidebar content is never a scroll container

The tags sidebar content region SHALL NOT scroll: `.sidebar-content` SHALL never show a vertical scrollbar on any viewport. Vertical scrolling SHALL belong to the document on wide viewports and to the drawer surface on narrow viewports.

#### Scenario: Many tags on a wide viewport

- **WHEN** a user with more tags than fit in the window height opens the collection on a wide viewport
- **THEN** `.sidebar-content` shows no vertical scrollbar
- **AND** the document scrolls to reach the rest of the sidebar and the collection

#### Scenario: Narrow drawer scrolls as a whole

- **WHEN** a user opens the tags drawer at or below the mobile breakpoint and its content exceeds the drawer height
- **THEN** the drawer scrolls as a single surface
- **AND** `.sidebar-content` still shows no vertical scrollbar of its own

### Requirement: Sidebar height follows its content on wide viewports

On viewports above the mobile breakpoint the tags sidebar SHALL NOT be capped to the viewport height and SHALL NOT be pinned, so its height follows its content and the page grows to the taller column. Every tag group SHALL remain reachable by scrolling the page.

#### Scenario: Page height follows the taller column

- **WHEN** the sidebar is taller than the item collection
- **THEN** the page grows to the sidebar's height and the window scrollbar reaches its end
- **AND** when the collection is taller, the page grows to the collection's height instead

#### Scenario: Sidebar taller than the window stays reachable

- **WHEN** the sidebar content exceeds the window height on a wide viewport
- **THEN** the sidebar is not pinned while the page scrolls
- **AND** every tag group remains reachable

#### Scenario: Short sidebar scrolls with the page

- **WHEN** the sidebar fits in the window and the user scrolls a long collection
- **THEN** the sidebar moves with the page instead of staying fixed in place
