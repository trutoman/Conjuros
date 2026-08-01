# Feature Specification: Boxed Application Shell & Layout Reformat

**Feature Branch**: `feature/sidebar-layout`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "Reformat layout to a centered boxed application shell (max-width 1400–1600px) with fixed margins/padding, preserving collapsible tag/search sidebar functionality without disrupting or displacing items in the main collection grid."

## Clarifications

### Session 2026-08-01

- Q: Should the transition between the expanded and collapsed states of the tag/search sidebar use a smooth CSS transition or resize instantly? (FR-004) → A: Option A - Smooth CSS transition (200ms ease) for sidebar expansion and collapse.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Centered Boxed Container Layout (Priority: P1)

As a user accessing the application on wide displays, I want the core application content to remain centered within a fixed-width container rather than stretching continuously to the screen edges, so that reading and interacting with collection items feels comfortable and focused.

**Why this priority**: Core visual hierarchy and usability requirement. Unconstrained full-width stretching impairs readability and breaks visual consistency across standard monitor resolutions.

**Independent Test**: Can be tested by opening the application on desktop viewports (> 1400px width) and verifying that the main container stays horizontally centered with a fixed maximum width limit and consistent outer margins.

**Acceptance Scenarios**:

1. **Given** a user opens the application on a desktop browser with screen width > 1600px, **When** the page renders, **Then** the application shell (`app-shell`) MUST remain horizontally centered with a maximum width constrained between 1400px and 1600px.
2. **Given** a user resizes the browser window down to mobile sizes (<= 650px), **When** viewport width drops to or below 650px, **Then** the container width MUST adapt to `min(100% - 1rem, 1120px)` with 1rem top padding.

---

### User Story 2 - Stable Grid Layout on Sidebar Toggle (Priority: P2)

As a user browsing my collection, I want to expand or collapse the search/tags sidebar without having the main spell collection grid displace or distort its elements, so that layout stability and visual alignment are maintained.

**Why this priority**: Preventing visual jump and layout breakage when toggling sidebars ensures a smooth and intuitive user interface.

**Independent Test**: Can be tested by toggling the search/tags sidebar visibility and verifying that cards in the main collection frame maintain their internal layout structure and adapt fluidly without misaligning.

**Acceptance Scenarios**:

1. **Given** the search/tags sidebar is visible, **When** the user collapses or hides the sidebar, **Then** the main collection container MUST expand to fill available space within the centered app-shell with a smooth 200ms CSS transition without displacing or distorting items inside the spell card grid.
2. **Given** the sidebar is collapsed, **When** the user expands or shows the sidebar, **Then** the main collection grid MUST contract within the app-shell layout without breaking element alignment or wrapping rules.

---

### User Story 3 - In-bounds Log Panel Rendering (Priority: P3)

As a user viewing system activity or logs, I want the log column to render inside the centered application frame, so that secondary panels do not overflow or break the boxed container boundary.

**Why this priority**: Ensures all auxiliary panels respect the application shell layout boundaries.

**Independent Test**: Can be tested by opening the log panel and confirming it renders inside the static centered frame without forcing horizontal scrolling or overflowing the container.

**Acceptance Scenarios**:

1. **Given** the user toggles the log panel, **When** the panel opens, **Then** it MUST render inside the static centered app-shell frame alongside existing content.

---

### Edge Cases

- What happens when screen width is exactly 650px? The mobile breakpoint rules (`min(100% - 1rem, 1120px)` with 1rem top padding) apply seamlessly.
- How does the system handle ultra-wide monitors (e.g. 4K/34" ultrawide)? The application content stays constrained within the max-width (1400-1600px) centered shell, leaving equal margin gutters on the left and right sides.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST wrap application content in a centered boxed container (`app-shell`) with a maximum width bounded between 1400px and 1600px on desktop viewports.
- **FR-002**: System MUST apply viewport adaptation at width <= 650px using container sizing `min(100% - 1rem, 1120px)` and 1rem top padding.
- **FR-003**: System MUST preserve grid alignment and item stability in the main collection frame when the search/tags sidebar is expanded or collapsed.
- **FR-004**: System MUST treat the collapsible sidebar as an in-flow component of the container layout (not an absolute floating panel), animating expansion and collapse with a smooth CSS transition (200ms ease) while allowing the main content region to expand.
- **FR-005**: System MUST render auxiliary panels (such as the log column) within the bounds of the centered application shell.

### Key Entities *(include if feature involves data)*

- **AppShell Layout**: Layout structure defining container bounds, maximum width rules, padding, margin centering, and grid flex regions for main content, sidebar, and auxiliary columns.

## Constitution Alignment *(mandatory)*

- The feature MUST preserve private ownership boundaries and deny cross-user access.
- The feature MUST use or update shared contracts when request or response shapes change.
- The feature MUST define validation and error handling for invalid input and authorization failures.
- The feature MUST identify the relevant tests and user-visible success or failure states.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Application shell maintains horizontal centering and does not exceed 1600px width on viewports larger than 650px.
- **SC-002**: Toggling sidebar panel visibility results in 0 visual distortion, zero overflowing cards, and 0 misaligned elements in the main collection grid.
- **SC-003**: Viewports <= 650px maintain a minimum 1rem side padding margin buffer (`min(100% - 1rem, 1120px)`).

## Assumptions

- Standard desktop target max-width is set to 1440px within the specified 1400-1600px range to ensure optimal line length and grid proportion.
- Existing card grid CSS uses CSS Grid / Flexbox structures that can adjust smoothly to container width changes without script-based manual recalculations.
- No changes to API endpoints or backend contracts are needed as this feature focuses purely on shell layout and UI containment.