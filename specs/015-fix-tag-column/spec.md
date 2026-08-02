# Feature Specification: Fix Tag Column Icon Layout

**Feature Branch**: `feature/fix-tag-column`

**Created**: 2026-08-02

**Status**: Draft

**Input**: User description: "Fix and refine the tag column icon toggle button markup and CSS layout (`<button class="quiet tags-toggle-btn"><span>Tags</span><TagColumnIcon /></button>`) ensuring text is centered on top and the soft bar bookmark icon is centered underneath."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Vertical Layout for Tags Toggle Button and Sidebar Header (Priority: P1)

As a user navigating collection items, I want the topbar "Tags" toggle button and the sidebar header to display the centered "Tags" label on top with the custom soft bar bookmark SVG icon directly underneath, so that the button layout is clean, compact, and aligned.

**Why this priority**: Corrects button presentation and icon positioning in the main header and sidebar header.

**Independent Test**: Open the application main page, inspect the topbar Tags button and sidebar header title, and verify that the text "Tags" appears centered above the soft bar bookmark SVG icon.

**Acceptance Scenarios**:

1. **Given** the topbar header renders, **When** the Tags toggle button is displayed, **Then** it MUST render `<button class="quiet tags-toggle-btn"><span>Tags</span><TagColumnIcon /></button>` with `flex-direction: column` and centered text above the SVG icon.
2. **Given** the sidebar header renders, **When** the title block is displayed, **Then** it MUST render the title "Tags" above the `TagColumnIcon` in a vertical flex column layout.
3. **Given** theme changes (light/dark mode), **When** rendering the SVG icon, **Then** the icon MUST inherit the button's text color using `fill="currentColor"`.

---

### User Story 2 - Accessible Toggle Button & Decoration Markup (Priority: P2)

As a user relying on screen readers or keyboard navigation, I want the Tags toggle button to announce "Tags" correctly without assistive technology repeating decorative SVG markup.

**Why this priority**: Preserves clean accessibility semantics for interactive buttons.

**Independent Test**: Test the button with a screen reader or accessibility tool to verify `aria-hidden="true"` on the SVG and clear text labeling for the button.

**Acceptance Scenarios**:

1. **Given** the Tags toggle button, **When** inspected by assistive tools, **Then** the inner SVG element MUST have `aria-hidden="true"`.
2. **Given** keyboard navigation, **When** focusing the Tags button, **Then** the button MUST be focusable and operable via Enter or Space.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render the topbar Tags toggle button with the class `quiet tags-toggle-btn` containing `<span>Tags</span>` and `<TagColumnIcon />`.
- **FR-002**: System MUST render the soft bar bookmark SVG icon (`viewBox="0 0 64 64"`, `path d="M 8 6 C 5 6, 5 11, 8 11 H 13 V 54 C 13 56, 14 57, 16 56 L 32 44 L 48 56 C 50 57, 51 56, 51 54 V 11 H 56 C 59 11, 59 6, 56 6 Z"`) with `aria-hidden="true"` when visual label text is present.
- **FR-003**: System MUST apply CSS layout rules (`display: inline-flex`, `flex-direction: column`, `align-items: center`) to `.tags-toggle-btn` and `.sidebar-header-title`.

### Key Entities

- **TagColumnIcon**: UI visual component rendering the soft bar bookmark SVG icon.

## Constitution Alignment *(mandatory)*

- The feature MUST preserve private ownership boundaries and deny cross-user access.
- The feature MUST use or update shared contracts when request or response shapes change.
- The feature MUST define validation and error handling for invalid input and authorization failures.
- The feature MUST identify the relevant tests and user-visible success or failure states.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of topbar Tags button and sidebar header instances render centered text on top with the icon directly underneath.
- **SC-002**: Zero accessibility or lint violations reported for the updated button and SVG components.

## Assumptions

- The existing `TagColumnIcon` component and CSS rules in `src/web/index.css` provide the foundation for this layout fix.
