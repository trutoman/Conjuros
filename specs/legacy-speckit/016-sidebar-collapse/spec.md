# Feature Specification: Sidebar Collapse & Expand Mechanics

**Feature Branch**: `feature/sidebar-collapse`

**Created**: 2026-08-02

**Status**: Draft

**Input**: User description: "Implement comprehensive sidebar width reduction and expansion functionality for the tags panel, including animated transitions, aria accessibility states, persistent collapse preference, and keyboard navigation."

## Clarifications

### Session 2026-08-02

- Q: How should the sidebar contents (tags list, category headers, match mode toggle) be hidden when in the reduced state? → A: Visually hide and exclude inner contents from tab focus (`display: none` or unrendered when reduced).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Responsive Sidebar Collapse & Expand Toggle (Priority: P1)

As a user organizing collection items, I want to toggle the tags sidebar between expanded (fully expanded) and reduced (partially expanded) states using the sidebar "Tags" toggle button , so that I can maximize reading space or focus on item details.

**Why this priority**: Core functionality required to allow users to show totally or reduce the tag filtering sidebar dynamically.

**Independent Test**: Click the sidebar "Tags" button and observe the tags panel smoothly expanding or collapsing.

**Acceptance Scenarios**:

1. **Given** the sidebar is expanded, **When** the user clicks the sidebar "Tags" button , **Then** the sidebar MUST transition to the reduced state and contain only the tag toogle button
2. **Given** the sidebar is reduced, **When** the user clicks the sidebar "Tags" toogle  button, **Then** the sidebar MUST transition to the fully expanded state  and bcontain all elements
3. **Given** a narrow mobile viewport, **When** the sidebar is fully expanded, **Then** it MUST overlay cleanly without obscuring primary action buttons unnaturally.

---

### User Story 2 - Persistent Sidebar State Across Sessions (Priority: P2)

As a user who prefers a specific workspace layout, I want my sidebar fully expanded or reduced state saved automatically so that when I reload the app or open a new browser tab, my preferred layout is preserved.

**Why this priority**: Enhances user experience by respecting layout preferences across page reloads.

**Independent Test**: Set the sidebar to reduced state, reload the page, and verify the sidebar remains reduced upon initialization.

**Acceptance Scenarios**:

1. **Given** the user reduces the sidebar, **When** the page is reloaded, **Then** the sidebar MUST initialize in the reduced state.
2. **Given** the user expands the sidebar, **When** the page is reloaded, **Then** the sidebar MUST initialize in the expanded state.
3. **Given** a first-time user without saved preferences, **When** the page loads, **Then** the sidebar MUST default to expanded on desktop viewports and collapsed on narrow screens.

---

### User Story 3 - Accessible Toggle State & Keyboard Controls (Priority: P3)

As a keyboard or screen-reader user, I want the topbar "Tags" toggle button to communicate the sidebar's current visibility state (`aria-expanded`) and allow reducing via the `Escape` key.

**Why this priority**: Ensures full WCAG compliance and accessibility for screen readers and keyboard users.

**Independent Test**: Inspect the sidebar "Tags" button with browser accessibility tools and press `Escape` while focused in an open sidebar to confirm reduction in width of sidebar.

**Acceptance Scenarios**:

1. **Given** the sidebar is fully expanded, **When** inspecting the sidebar "Tags" button, **Then** it MUST have `aria-expanded="true"` and `aria-controls="tags-sidebar-panel"`.
2. **Given** the sidebar is reduced, **When** inspecting the sidebar "Tags" button, **Then** it MUST have `aria-expanded="false"`.
3. **Given** the sidebar is fully expanded and keyboard focus is within the sidebar, **When** the user presses `Escape`, **Then** the sidebar MUST reduce and return focus gracefully.

---

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST provide a toggle action via the sidebar `tags-toggle-btn` to expand totally or reduce the width of the `.app-sidebar` container.
- **FR-002**: System MUST render `aria-expanded="true"` or `aria-expanded="false"` on the sidebar `tags-toggle-btn` corresponding to the active sidebar visibility state.
- **FR-003**: System MUST support reducing the expanded sidebar when pressing the `Escape` key while focus is within the sidebar panel.
- **FR-004**: System MUST store the sidebar expanded/reduced state in `localStorage` under key `conjuros_sidebar_open` (`"true"` / `"false"`).
- **FR-005**: System MUST apply CSS transitions for width/opacity to create a smooth reduce/expand visual transition on `.app-sidebar`.
- **FR-006**: there will exist only one `tags-toggle-btn` and it will be always rendered inside the sidebar.
- **FR-007**: The current button toogle tags inside the topbar will be removed
- **FR-008**: When sidebar is in reduced state, it MUST contain only the tag toggle button (with inner tags list, category headers, and match mode toggle hidden visually and excluded from tab focus), and the sidebar column width MUST equal the width of the toggle button.
- **FR-009**: When sidebar in expanded mode all elements inside sidebar panel will be shown as they are currently shown, they'll be just pushed to the right.

### Key Entities

- **SidebarState**: Client-side layout state tracking `isSidebarExpanded` boolean flag and persistence in local storage.

## Constitution Alignment *(mandatory)*

- The feature MUST preserve private ownership boundaries and deny cross-user access.
- The feature MUST use or update shared contracts when request or response shapes change.
- The feature MUST define validation and error handling for invalid input and authorization failures.
- The feature MUST identify the relevant tests and user-visible success or failure states.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of user toggle actions smoothly transition the sidebar without visual glitches or page overflow scrollbars.
- **SC-002**: Sidebar state preference is correctly restored from `localStorage` on 100% of page reloads.
- **SC-003**: Keyboard navigation (`Escape` key, `Tab` order) and screen-reader accessibility (`aria-expanded`) pass all automated tests with 0 errors.

## Assumptions

- `localStorage` is available in standard web browser runtime environments.
- Default initial sidebar state on desktop is expanded (`true`) if no preference is stored.
