# Feature Specification: Top-Row Item Text Placement

**Feature Branch**: `007-one-line-item`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "Move each item's content text to the upper line, place it between the item title and tags, keep all item-card elements vertically centered, and when space is limited only the item-content area may shrink down to approximately 2 rem while other card elements keep their width."

## Clarifications

### Session 2026-08-01

- Q: When the row is too narrow to keep all fixed-width non-content elements visible, what should happen first to preserve usability? (FR-006) → A: Preserve title and actions; allow tags to collapse into a +N indicator.
- Q: When tags collapse into a +N indicator, how should users access the hidden tags? (FR-013) → A: Show hidden tags in a tooltip/popover on hover and keyboard focus.
- Q: On touch-only devices where hover is unavailable, how should users open the hidden-tag tooltip/popover from the +N indicator? (FR-013) → A: Do not support hidden-tag reveal on touch devices.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - See item content in the top row (Priority: P1)

As an authenticated user, I can see the item content text on the top row between the title and tags so I can read key information faster in one visual pass.

**Why this priority**: Reading title, content, and tags together in the same row directly improves scanning speed for the primary collection workflow.

**Independent Test**: Open a collection with mixed spells and web links and verify the content text appears on the top row, positioned between title and tags, while remaining readable.

**Acceptance Scenarios**:

1. **Given** a user opens the collection list, **When** an item card is rendered, **Then** the item's content text appears in the top row.
2. **Given** the top row includes title, content text, and tags, **When** the row is displayed, **Then** the content text is located between title and tags.
3. **Given** the user scans the collection, **When** looking at the top row, **Then** title, content text, and tags can be read together without opening the item.

---

### User Story 2 - Keep card alignment and actions stable (Priority: P1)

As an authenticated user, I can still use all item actions with a visually stable layout so the top-row content change does not disrupt card interactions.

**Why this priority**: The layout update is only successful if existing actions remain reliable and easy to use.

**Independent Test**: Interact with copy, open, edit, delete, and reorder controls after the layout change and verify behavior and feedback remain consistent.

**Acceptance Scenarios**:

1. **Given** the item card uses the updated top-row arrangement, **When** the user triggers copy on a spell, **Then** the exact command text is copied and success or failure feedback is shown.
2. **Given** the item card uses the updated top-row arrangement, **When** the user activates open on a web-link, **Then** the URL opens only after explicit user action.
3. **Given** a user interacts with edit, delete, or reorder controls after the layout change, **When** an action is requested, **Then** the action remains available and behaves consistently with ownership and persistence rules.

---

### User Story 3 - Handle constrained width predictably (Priority: P2)

As an authenticated user, I can use item cards on narrow layouts without losing access to fixed controls, while the content text area flexes first.

**Why this priority**: Width-constrained behavior must remain predictable so users do not lose controls or alignment.

**Independent Test**: Reduce available horizontal space and verify only the content text area shrinks down to its minimum threshold while other card sections keep their width and vertical centering.

**Acceptance Scenarios**:

1. **Given** all item-card elements are shown, **When** the updated layout is rendered, **Then** title, content text, tags, and action areas stay vertically centered within the card.
2. **Given** horizontal space is reduced, **When** the row must compress, **Then** only the content text area shrinks first and can reduce to an approximate minimum width of 2 rem.
3. **Given** a row is at constrained width and content text reached minimum width, **When** compression continues, **Then** title and actions remain visible while tags may collapse into a +N indicator and hidden tags remain discoverable via hover or keyboard focus.

### Edge Cases

- Title, content text, and tags are all long; the content text area contracts first without breaking alignment.
- The card reaches the content-area minimum width threshold of approximately 2 rem; title and actions remain visible while tags collapse to a +N indicator.
- The viewport is narrow on mobile; vertical centering and action reachability are preserved.
- A user attempts cross-user item access through direct identifiers; ownership boundaries still deny access.
- A reorder action is triggered while a prior reorder is still pending; the UI prevents conflicting updates.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST place each item's content text in the top row of the item card.
- **FR-002**: The top-row order MUST place content text between the item title and the tags.
- **FR-003**: The updated layout MUST keep all visible item-card elements vertically centered.
- **FR-004**: When horizontal space is constrained, only the content-text area MUST shrink before other card elements.
- **FR-005**: The content-text area MUST be allowed to shrink to a minimum target width of 2 rem, with an acceptable rendered tolerance of 0.1 rem for browser rounding.
- **FR-006**: If additional compression is required after the content-text area reaches its minimum width, the title and actions MUST remain visible and tags MUST collapse into a +N indicator.
- **FR-007**: The card MUST preserve quick actions for copy, open, edit, delete, and reorder after the layout change.
- **FR-008**: For web-link items, the open action MUST require explicit user interaction before opening the URL.
- **FR-009**: For spell items, copy action MUST copy the exact command text without transformation.
- **FR-010**: The system MUST preserve user ownership checks for all item reads, updates, deletes, and reorder operations exposed through item cards.
- **FR-011**: The updated layout MUST remain usable across loading, empty, no-results, and error states.
- **FR-012**: The updated layout MUST support keyboard navigation and visible focus states for item rows and row actions.
- **FR-013**: When tags are collapsed to a +N indicator, the hidden tags MUST be shown in a tooltip or popover on pointer hover and on keyboard focus.
- **FR-014**: On touch-only devices, hidden tags behind the +N indicator are not required to be revealed from the collapsed row.

### Key Entities _(include if feature involves data)_

- **Top Row Segment**: The row area that includes title, content text, and tags.
- **Content Text Area**: The row segment that shows item command or URL text and is the only segment permitted to shrink first under width constraints.
- **Tag Overflow Indicator**: A compact +N marker that represents hidden tags when row width is insufficient.
- **Item Action Set**: The available user actions for an item card, including copy, open (for web-links), edit, delete, and reorder.
- **Collection Order**: The persisted sequence of a user's items, maintained when reorder actions are used from item cards.

## Constitution Alignment _(mandatory)_

- The feature MUST preserve private ownership boundaries and deny cross-user access for all row actions and data.
- The feature MUST keep shared contracts authoritative if any request or response shape is adjusted by the one-line presentation changes.
- The feature MUST define validation and user-visible error handling for invalid inputs, unauthorized access, and failed actions.
- The feature MUST include risk-proportionate tests for top-row placement, width-constrained behavior, quick actions, ownership boundaries, accessibility behavior, and list states.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: In acceptance testing, 100% of item cards place content text in the top row between title and tags.
- **SC-002**: In acceptance testing, 100% of item cards keep visible row elements vertically centered after the layout update.
- **SC-003**: Under constrained width scenarios, 100% of sampled cards shrink the content-text area first, and once minimum width is reached, tags collapse to a +N indicator while title and actions remain visible.
- **SC-004**: Under constrained width scenarios, 100% of sampled cards keep the rendered content-text width at or above 1.9 rem while applying the defined shrink-first policy.
- **SC-005**: 100% of web-link opens still occur only after explicit user action, and 100% of spell copy actions preserve exact command text.
- **SC-006**: In acceptance testing, 100% of +N tag indicators reveal hidden tags on pointer hover and keyboard focus.
- **SC-007**: In acceptance testing on touch-only devices, hidden tags behind +N are not required to be revealed from the collapsed row.
- **SC-008**: 100% of unauthorized cross-user item access attempts through card actions are rejected.

## Assumptions

- The existing authenticated collection list remains the primary context for this change.
- This feature updates the collapsed item-card layout and does not redefine expanded item details.
- Existing backend behavior for ownership checks, copy/open safety, and reorder persistence remains in place and is reused.
- Existing tag metadata and item data are available at render time and can be rearranged in the top row without changing domain models.
