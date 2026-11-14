# Spec Delta

## RENAMED Requirements

- FROM: `### Requirement: Result counter above the collection list`
- TO: `### Requirement: Result counter below the collection list`

## MODIFIED Requirements

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

## ADDED Requirements

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
