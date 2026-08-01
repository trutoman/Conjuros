# Feature Specification: Search & Filter Sub-Header in Main Content Frame

**Feature Branch**: `feature/sidebar-layout`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "Move the search box (with placeholder 'Buscar en título y contenido...') and the item type selector dropdown out of the tags sidebar and place them inside the mainContentFrame as a single horizontal sub-header above the collection list. The search box will be on the left expanding horizontally to fill available space, with the type selector on the right. Rename the tags sidebar title from 'Search' to 'Tags'."

## Clarifications

### Session 2026-08-01

- Q: How should the search sub-header behave on narrow mobile viewports (width <= 650px)? (FR-001) → A: Option A - Stack into 2 full-width rows on mobile viewports (<= 650px) with full-width search input on top and type selector below.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Relocate Search & Type Filter to Main Content Sub-Header (Priority: P1)

As a user browsing my collection, I want the search input box and item type dropdown filter located directly above the collection list inside the main content frame, so that searching and filtering items feels immediately accessible and visually tied to the collection grid.

**Why this priority**: Primary filtering controls belong directly above the content grid being filtered, improving discoverability and interaction speed.

**Independent Test**: Open the application on any viewport and verify that the search bar and type selector render in a sub-header row inside `.main-content-frame` above the collection items (horizontal row on desktop, stacked on mobile).

**Acceptance Scenarios**:

1. **Given** a user opens the collection page on desktop, **When** the page renders, **Then** a horizontal sub-header containing the search input box on the left and the type selector dropdown on the right MUST appear inside `.main-content-frame` directly above the item grid.
2. **Given** a user views the page on a mobile viewport (<= 650px), **When** the sub-header renders, **Then** the search input box MUST take the top full-width row and the type selector dropdown MUST sit in the second row below it.
3. **Given** a user enters text into the search input box or changes the type selector, **When** input changes, **Then** the collection list MUST filter in real time.

---

### User Story 2 - Full-Width Search Input & Flexible Sub-Header Layout (Priority: P2)

As a user typing search queries, I want the search input box to expand horizontally to fill available space next to the right-aligned type filter selector.

**Why this priority**: Maximizes search query visibility and maintains a responsive layout across varying screen sizes.

**Independent Test**: Resize the browser window and confirm the search input box flexes horizontally (`flex: 1`) while keeping the type selector right-aligned in the same row on desktop viewports.

**Acceptance Scenarios**:

1. **Given** the user views the collection page sub-header on desktop, **When** the browser window is resized, **Then** the search input box MUST flex horizontally to fill all remaining width while the type selector remains right-aligned.

---

### User Story 3 - Tags Sidebar Cleanup & Header Renaming (Priority: P3)

As a user opening the tags sidebar, I want to see "Tags" as the sidebar header title and only tag-related filters inside it, so that the sidebar remains focused exclusively on tag management and tag filtering.

**Why this priority**: Eliminates redundant controls and establishes clear separation between global collection search and tag filtering.

**Independent Test**: Open the tags sidebar and verify the header reads "Tags" (replacing "Search") and no longer contains the search box or item type selector dropdown.

**Acceptance Scenarios**:

1. **Given** the user opens the tags sidebar, **When** inspecting the sidebar header and body, **Then** the heading title MUST display "Tags" and the search input and item type dropdown MUST NOT be present inside the sidebar.

---

### Edge Cases

- What happens when screen width is small (mobile viewport <= 650px)? The sub-header stacks into two full-width rows with the search input box on top and the type selector below for optimal touch usability.
- What happens when search query is cleared? Clearing search via the clear button restores the full unfiltered view for the selected item type and tags.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render a sub-header row (`.collection-subheader` / `.main-content-header`) inside `.main-content-frame` directly above the collection list/grid, formatted as a single horizontal row on desktop viewports and stacking into 2 full-width rows on mobile viewports (width <= 650px).
- **FR-002**: System MUST position the search input box (with search icon and placeholder "Buscar en título y contenido...") on the left side of the sub-header on desktop, configured to flex horizontally (`flex: 1`) to occupy all available space.
- **FR-003**: System MUST position the item type selector (ItemKind dropdown filter with its inline label) on the right side of the sub-header in the same horizontal row on desktop.
- **FR-004**: System MUST remove the search input box and item type selector dropdown from the tags sidebar (`Sidebar.tsx`).
- **FR-005**: System MUST update the tags sidebar heading text from "Search" to "Tags" in `Sidebar.tsx`.

### Key Entities *(include if feature involves data)*

- **CollectionSubHeader Layout**: Component/CSS entity representing the sub-header row inside `.main-content-frame` containing the search input box and type filter selector.

## Constitution Alignment *(mandatory)*

- The feature MUST preserve private ownership boundaries and deny cross-user access.
- The feature MUST use or update shared contracts when request or response shapes change.
- The feature MUST define validation and error handling for invalid input and authorization failures.
- The feature MUST identify the relevant tests and user-visible success or failure states.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Search input box and type selector dropdown render inside a single horizontal sub-header row within `.main-content-frame` on desktop viewports.
- **SC-002**: Search input box expands to fill 100% of remaining available sub-header width on all desktop viewports.
- **SC-003**: Tags sidebar header title displays "Tags" and contains 0 search box or item type dropdown elements.

## Assumptions

- Search and item type filter state (`useCollectionFilters`) remain unchanged in logic, with only UI component location and styling refactored.
- Existing tag filtering behavior (Match all / Match any) remains inside the tags sidebar.
