# Feature Specification: Tag Match Mode Segmented Toggle

**Feature Branch**: `feature/tag-match-toggle`

**Created**: 2026-08-02

**Status**: Draft

**Input**: User description: "Replace the tag match mode selector (the 'Match' label and native select dropdown with 'Match all' / 'Match any' options) in the tags sidebar header with a modern segmented toggle control styled identically to the existing ThemeToggle component. The new control has two buttons: 'OR' for match-any and 'AND' for match-all, with the active option highlighted using the primary color."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Visual Toggle for Tag Matching Mode (Priority: P1)

As a user filtering my collection by tags, I want a segmented toggle control with clearly labelled 'OR' and 'AND' buttons in the sidebar header, so that I can instantly switch between matching any or all selected tags with a single click and clear visual feedback.

**Why this priority**: This is the primary interaction being redesigned — the core value of the feature. It replaces the only existing control for tag match mode selection with a more intuitive graphical alternative.

**Independent Test**: Open the tags sidebar and verify the 'OR' / 'AND' segmented toggle replaces the legacy select dropdown. Click each button and confirm the active state changes and the collection list re-filters accordingly.

**Acceptance Scenarios**:

1. **Given** a user opens the tags sidebar, **When** the sidebar header renders, **Then** the sidebar header MUST contain a segmented toggle with two buttons labelled 'OR' and 'AND', and MUST NOT contain the legacy 'Match' label or native select dropdown.
2. **Given** the current tag filter mode is 'any', **When** the sidebar renders, **Then** the 'OR' button MUST appear highlighted as active and the 'AND' button MUST appear inactive.
3. **Given** the current tag filter mode is 'all', **When** the sidebar renders, **Then** the 'AND' button MUST appear highlighted as active and the 'OR' button MUST appear inactive.
4. **Given** a user clicks the 'AND' button while 'OR' is currently active, **When** clicked, **Then** the tag filter mode MUST update to 'all', the 'AND' button MUST become active, and the collection list MUST re-filter using conjunctive tag matching.
5. **Given** a user clicks the 'OR' button while 'AND' is currently active, **When** clicked, **Then** the tag filter mode MUST update to 'any', the 'OR' button MUST become active, and the collection list MUST re-filter using disjunctive tag matching.

---

### User Story 2 - Accessible Segmented Control with Keyboard and Screen Reader Support (Priority: P2)

As a keyboard or screen reader user, I want the tag match toggle to be fully accessible with proper ARIA semantics, so that I can understand the control purpose, identify which mode is active, and toggle between modes using standard input methods.

**Why this priority**: Ensures the redesigned control meets the product's accessibility and focused experience requirements without regressing from the native select dropdown's built-in accessibility.

**Independent Test**: Navigate to the tag match toggle using only keyboard tab navigation and verify each button can be focused, activated with Enter/Space, and reports its active state to assistive technology.

**Acceptance Scenarios**:

1. **Given** a user inspects the tag match toggle, **When** evaluating its accessible structure, **Then** the container MUST have `role="group"` and an `aria-label` describing the tag match mode purpose.
2. **Given** the toggle buttons, **When** inspected by assistive technology, **Then** each button MUST have an explicit `aria-label` (e.g. "Match any tag" for OR, "Match all tags" for AND) and a dynamic `aria-pressed` attribute reflecting its active state.
3. **Given** a keyboard-only user, **When** tabbing through the sidebar header, **Then** both toggle buttons MUST be focusable and activatable via Enter or Space keys.

---

### User Story 3 - Consistent Visual Design Across Segmented Controls (Priority: P3)

As a user navigating the application, I want the tag match toggle to look and behave identically to the existing theme toggle, so that the interface feels cohesive and predictable across all segmented controls.

**Why this priority**: Visual consistency reinforces learnability and perceived quality; a mismatched control would feel out of place.

**Independent Test**: Place the tag match toggle and theme toggle side by side and verify they share the same border radius, padding, button sizing, active highlight color, and hover states.

**Acceptance Scenarios**:

1. **Given** a user compares the tag match toggle with the theme toggle, **When** both are visible, **Then** both controls MUST share the same container border style, border radius, button padding, and active-state background color.

---

### Edge Cases

- What happens when no tags are selected? The 'OR' / 'AND' toggle updates the stored filter mode normally. The toggle state persists and takes effect as soon as any tags are checked.
- What happens when only one tag is selected? Both 'OR' and 'AND' modes produce the same filtered result. The toggle still updates the mode state for when additional tags are added.
- What happens on narrow viewports / mobile sidebar? The segmented toggle maintains its compact, inline size within the sidebar header alongside the close button. No layout changes are needed for mobile.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST replace the legacy `<span>Match</span>` label and `<select>` dropdown inside the sidebar header right section with a graphical segmented toggle component.
- **FR-002**: System MUST render two button elements inside the toggle: one displaying text "OR" (mapped to tag filter mode `any`) and one displaying text "AND" (mapped to tag filter mode `all`).
- **FR-003**: System MUST apply active styling (primary color background, contrast text color) and set `aria-pressed="true"` on the button corresponding to the currently selected tag filter mode, with `aria-pressed="false"` on the inactive button.
- **FR-004**: System MUST trigger a filter mode change when either button is clicked, updating the collection filter state and re-filtering the collection list.
- **FR-005**: System MUST structure the toggle container with `role="group"` and an `aria-label` describing the tag match mode, and MUST give each button an explicit `aria-label` ("Match any tag" for OR, "Match all tags" for AND).
- **FR-006**: System MUST style the toggle consistently with the existing theme toggle control — matching container borders, border radius, button padding, active highlight, and hover states.

### Key Entities *(include if feature involves data)*

- **TagMatchToggle**: A presentational component representing a two-option segmented button control for selecting between `any` (OR) and `all` (AND) tag match modes.

## Constitution Alignment *(mandatory)*

- The feature MUST preserve private ownership boundaries and deny cross-user access.
- The feature MUST use or update shared contracts when request or response shapes change.
- The feature MUST define validation and error handling for invalid input and authorization failures.
- The feature MUST identify the relevant tests and user-visible success or failure states.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can switch between tag match modes (any / all) with a single click on the visible 'OR' or 'AND' button, without needing to open a dropdown.
- **SC-002**: The active tag match mode is immediately visually distinguishable through a highlighted button state.
- **SC-003**: The tag match toggle is fully operable via keyboard navigation and reports correct state to screen readers.
- **SC-004**: The tag match toggle is visually indistinguishable in style from the existing theme toggle when compared side by side.

## Assumptions

- The `tagFilterMode` values (`'all'` | `'any'`) in the existing collection filter state remain unchanged; only the UI control presenting them is replaced.
- 'OR' maps to `any` (disjunctive tag matching — items matching at least one selected tag) and 'AND' maps to `all` (conjunctive tag matching — items matching every selected tag).
- No changes to shared contracts are required since this is a purely presentational refactor of an existing client-side filter control.
- The existing theme toggle CSS provides the visual foundation; the new toggle reuses the same design tokens and patterns.
