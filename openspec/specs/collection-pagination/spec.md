# collection-pagination Specification

## Purpose

Defines how the collection is read in pages and how paged list endpoints bound their page size, so every stored item stays reachable and large collections stay predictable.

## Requirements

### Requirement: Paginated item listing

The items list endpoint SHALL return one page of the requesting user's items together with the total number of items matching the current filters. A page is selected with `skip` (default 0) and a page size selected with `limit` (default 25, minimum 1, maximum 27). The returned page SHALL contain at most `limit` items, ordered by the requested sort with a stable tie-break, and `total` SHALL count every matching item, not just the returned page.

#### Scenario: First page of a collection larger than one page

- **WHEN** a user who owns 60 items requests the list with `limit=27&skip=0`
- **THEN** the response contains 27 items and `total` is 60

#### Scenario: A later page contains the remaining items

- **WHEN** the same user requests the list with `limit=27&skip=54`
- **THEN** the response contains the remaining 6 items and `total` is 60

#### Scenario: Total follows the active filters

- **WHEN** a user requests a page with a search term that matches 3 of their items
- **THEN** the response contains at most those 3 items and `total` is 3

#### Scenario: Page parameters are optional

- **WHEN** a user requests the list without `limit` or `skip`
- **THEN** the response returns the first 25 items and the matching total

### Requirement: Page size bound applies to every paginated list endpoint

Every paginated list endpoint (items, tags, tag categories, and themes) SHALL accept `limit` values from 1 to 27 inclusive and SHALL reject a larger requested page size with a `400` validation error. A rejected request SHALL NOT return a truncated page.

#### Scenario: Maximum page size is accepted

- **WHEN** a client requests any paginated list with `limit=27`
- **THEN** the request succeeds and returns at most 27 rows

#### Scenario: Oversized page size is rejected

- **WHEN** a client requests any paginated list with `limit=50`
- **THEN** the API answers `400` and returns no rows

#### Scenario: Zero page size is rejected

- **WHEN** a client requests any paginated list with `limit=0`
- **THEN** the API answers `400` and returns no rows

### Requirement: Explicit page navigation on the collection list

The main collection list SHALL render `Previous`, `Next`, and `Last` page controls below the list that use the current page size and filters. `Previous` and `Next` SHALL move by exactly one page, and `Last` SHALL load the final page. `Previous` and `Last` SHALL be disabled on the first page, and `Next` and `Last` SHALL be disabled on the last page. Activating a control SHALL load that page and keep the sidebar, search field, and type filter unchanged.

#### Scenario: Next moves to the following page

- **WHEN** a user with more than 27 matching items is on the first page and activates `Next`
- **THEN** the list shows the next 27 matching items and the search and filter controls keep their values

#### Scenario: Previous is unavailable on the first page

- **WHEN** a user views the first page of the collection
- **THEN** the `Previous` control is disabled

#### Scenario: Next is unavailable on the last page

- **WHEN** a user views the last page of the collection
- **THEN** the `Next` control is disabled

#### Scenario: Last jumps to the final page

- **WHEN** a user with 60 matching items is on the first page and activates `Last`
- **THEN** the list shows the final page containing items 55 to 60
- **AND** the `Next` and `Last` controls are disabled

#### Scenario: Last is unavailable on the first page of a single page

- **WHEN** the matching items fit on one page
- **THEN** the `Previous` and `Last` controls are disabled

#### Scenario: Controls render the theme's navigation icons

- **WHEN** a user views the page controls under any theme
- **THEN** `Previous` renders the theme's `previous-page` artwork, `Next` renders `next-page`, and `Last` renders `last-page`
- **AND** changing the active theme immediately redraws the three icons with that theme's artwork

#### Scenario: Controls keep accessible names without visible text

- **WHEN** a user inspects the page controls
- **THEN** each control shows only its icon
- **AND** each control exposes the accessible name `Previous page`, `Next page`, or `Last page`

#### Scenario: Navigation controls are keyboard accessible

- **WHEN** a keyboard-only user tabs to the page controls and activates them with Enter or Space
- **THEN** the page changes exactly as it does with a pointer

### Requirement: Result counter below the collection list

The collection view SHALL show, below the list, the range of items currently displayed and the total number of matching items, formatted as `Showing X–Y of N items`, where `X` is the one-based position of the first displayed item, `Y` the position of the last displayed item, and `N` the API total. The counter SHALL be available to assistive technology and SHALL NOT be shown while the list is loading, in error, or when no items match.

#### Scenario: Counter reflects the current page

- **WHEN** a user with 60 matching items views the first page of 27
- **THEN** the counter reads `Showing 1–27 of 60 items`

#### Scenario: Counter reflects a partial last page

- **WHEN** a user with 60 matching items views the third page
- **THEN** the counter reads `Showing 55–60 of 60 items`

#### Scenario: Counter follows a filter change

- **WHEN** a user applies a filter that leaves 4 matching items
- **THEN** the counter reads `Showing 1–4 of 4 items`

#### Scenario: No counter without results

- **WHEN** a filter matches no items
- **THEN** the existing empty state is shown and no range counter is displayed

### Requirement: Page resets when the filters change

Changing the search text, the type filter, the selected tags, or the tag match mode SHALL return the collection view to the first page, so the user never lands on a page number that no longer exists.

#### Scenario: Search resets to the first page

- **WHEN** a user is on the third page and types a search term
- **THEN** the list reloads from `skip=0` and the counter starts at `1`

#### Scenario: Type filter resets to the first page

- **WHEN** a user is on the second page and changes the type filter
- **THEN** the list reloads from the first page

#### Scenario: Tag selection resets to the first page

- **WHEN** a user is on the second page and selects or clears a tag, or changes the match mode
- **THEN** the list reloads from the first page

### Requirement: Out-of-range pages resolve safely

When the number of matching items shrinks so that the current page no longer holds any item, the collection view SHALL move back to the nearest page that holds results instead of showing a blank list. When no items match at all, the view SHALL show the existing empty state.

#### Scenario: Deleting the last item of the last page

- **WHEN** a user deletes the only item on the last page and other pages still contain items
- **THEN** the list shows the last page that still contains items

#### Scenario: Deleting the final matching item

- **WHEN** a user deletes the only item matching the active filters
- **THEN** the empty state is shown and the counter is hidden

### Requirement: Complete-list views aggregate pages

Views that present a complete list rather than a single page - the sidebar tag list, the tag management view, and the theme selector - SHALL keep showing every stored entry after the page-size bound drops below the previous maximum, by reading successive pages until `total` is reached.

#### Scenario: Sidebar shows tags beyond the first page

- **WHEN** a user owns 40 tags and opens the collection
- **THEN** the sidebar lists all 40 tags

#### Scenario: Theme selector shows themes beyond the first page

- **WHEN** a user owns 30 themes and opens the theme selector
- **THEN** the selector lists all 30 themes

#### Scenario: Tag management shows categories beyond the first page

- **WHEN** a user owns 30 tag categories and opens tag management
- **THEN** every category is listed

### Requirement: Pagination row sits below the collection list

The pagination row, consisting of the range counter and the `Previous`, `Next`, and `Last` controls, SHALL render after the last item card of the collection list. No pagination element SHALL render above the list or between the filter controls and the first item card.

#### Scenario: Row follows the last item

- **WHEN** a user views a collection page with items
- **THEN** the range counter and the page controls appear below the final item card
- **AND** the area between the search and type filters and the first item card holds no pagination element

#### Scenario: Row stays below the list on the last page

- **WHEN** a user moves to the last page of the collection
- **THEN** the pagination row still renders directly below the last item card

#### Scenario: Screen readers announce the row after the items

- **WHEN** a user reads the collection with a screen reader
- **THEN** every item card is announced before the pagination row

### Requirement: Pagination row centers the counter and controls

The pagination row SHALL present the range counter and the page controls as a single group centered horizontally within the collection content column. The counter SHALL render first and the `Previous`, `Next`, and `Last` controls SHALL follow immediately to its right, separated by a consistent gap. Centering SHALL survive the narrow-viewport wrap and SHALL NOT depend on which controls are enabled.

#### Scenario: Group is centered in the content column

- **WHEN** a user views the collection on a wide viewport
- **THEN** the counter and the page controls form one group centered within the list's width
- **AND** the free space before the counter equals the free space after the last control

#### Scenario: Counter comes before the controls

- **WHEN** a user reads the pagination row from left to right
- **THEN** the range counter appears first
- **AND** the `Previous`, `Next`, and `Last` controls follow to its right

#### Scenario: Wrapped group stays centered

- **WHEN** a narrow viewport forces the counter and the controls onto separate lines
- **THEN** both lines stay centered in the content column

#### Scenario: Disabled controls do not break the alignment

- **WHEN** the user is on the first page and `Previous` and `Last` are disabled
- **THEN** the group stays centered with the counter still first
