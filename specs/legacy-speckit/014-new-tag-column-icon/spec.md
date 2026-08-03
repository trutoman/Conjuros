# Feature Specification: New Tag Column Icon

**Feature Branch**: `feature/new-tag-column-icon`

**Created**: 2026-08-02

**Status**: Draft

**Input**: User description: "Use the custom 'Marcapáginas de barra suave' (Soft Bar Bookmark) SVG icon for the tag column / sidebar header and tag section indicators across the user interface."

## Clarifications

### Session 2026-08-02

- Q: How should the new soft bar bookmark SVG icon be rendered inside the topbar "Tags" button and sidebar header? → A: Render the icon alongside the "Tags" text aligned vertically, with text centered at top and icon centered below text, in both the topbar button and sidebar header.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Custom Soft Bar Bookmark Icon for Tag Column (Priority: P1)

As a user organizing and viewing collection tags, I want to see the new custom soft bar bookmark SVG icon displayed below the centered "Tags" text in both the topbar toggle button and the sidebar header, so that the tags column is visually distinctive and intuitive.

**Why this priority**: Core visual enhancement for tag column identification and sidebar branding.

**Independent Test**: Open the collection view and tags sidebar, and verify that the soft bar bookmark SVG icon appears rendered accurately centered below the "Tags" text in both the tag header and sidebar toggle button with matching fill colors.

**Acceptance Scenarios**:

1. **Given** a user views the application sidebar or header action buttons, **When** the Tags trigger button or Sidebar header renders, **Then** the custom soft bar bookmark SVG icon (`viewBox="0 0 64 64"`) MUST be displayed centered vertically beneath the "Tags" text label.
2. **Given** different application themes (light or dark mode), **When** rendering the SVG icon, **Then** the icon fill MUST automatically adapt using `currentColor`.
3. **Given** different viewport sizes, **When** the layout resizes, **Then** the SVG icon MUST scale proportionally without distortion or clipping.

---

### User Story 2 - Accessibility and Semantic Markup for Icon (Priority: P2)

As a user relying on screen readers or keyboard navigation, I want the custom SVG icon to be properly hidden from assistive technologies when purely decorative, or properly labelled when used as an action trigger, so that accessibility is maintained.

**Why this priority**: Guarantees zero accessibility regressions when introducing visual icons.

**Independent Test**: Inspect the rendered SVG elements with assistive tools to verify correct `aria-hidden` or `aria-label` attributes.

**Acceptance Scenarios**:

1. **Given** the icon is placed inside a button with existing text or `aria-label`, **When** rendered, **Then** the SVG element MUST have `aria-hidden="true"`.
2. **Given** the icon is used standalone as an accessible element, **When** rendered, **Then** it MUST have an appropriate `aria-label="Marcapáginas de barra suave"`.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render the provided soft bar bookmark SVG path (`M 8 6 C 5 6, 5 11, 8 11 H 13 V 54 C 13 56, 14 57, 16 56 L 32 44 L 48 56 C 50 57, 51 56, 51 54 V 11 H 56 C 59 11, 59 6, 56 6 Z`) as a reusable icon component or inline SVG for tag column identification.
- **FR-002**: The icon component MUST support custom CSS classes, sizing props, and inherit the surrounding text color via `fill="currentColor"`.
- **FR-003**: System MUST include the icon in both the Tags sidebar header `<h2>` and the main topbar Tags toggle button, aligned vertically with centered text at the top and the icon below text.

### Key Entities

- **TagColumnIcon**: UI visual component representing the soft bar bookmark SVG icon.

## Constitution Alignment *(mandatory)*

- The feature MUST preserve private ownership boundaries and deny cross-user access.
- The feature MUST use or update shared contracts when request or response shapes change.
- The feature MUST define validation and error handling for invalid input and authorization failures.
- The feature MUST identify the relevant tests and user-visible success or failure states.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of tag sidebar header and tag toggle locations visually render the new soft bar bookmark SVG icon centered below the "Tags" label.
- **SC-002**: Zero accessibility lint or ARIA violations reported for the newly added SVG icon elements.
- **SC-003**: SVG renders cleanly across all supported browser display densities without pixelation or layout shifts.

## Assumptions

- The SVG path provided by the user is the definitive vector definition for the tag column icon.
- The vertical column layout (text top, icon bottom) applies to both the topbar "Tags" toggle button and the sidebar header title.
