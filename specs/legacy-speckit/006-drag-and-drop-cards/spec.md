# Feature Specification: Drag-and-Drop Card Reordering

**Feature Branch**: `006-drag-and-drop-cards`

**Created**: 2026-07-30

**Status**: Draft

**Input**: User description: "Remove the current item-card move system that uses up/down arrows, remove those arrows completely, and implement drag-and-drop so users can place item-cards in different positions by dragging and dropping."

## Clarifications

### Session 2026-07-30

- Q: What keyboard reordering mechanism should replace the removed arrow controls for accessibility compliance? (FR-008) → A: Use `Alt+ArrowUp` and `Alt+ArrowDown` on the focused card.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Reorder cards by drag and drop (Priority: P1)

As an authenticated user, I can drag an item card and drop it into a new position in the collection list, so I can organize my cards quickly without using arrow controls.

**Why this priority**: Reordering cards is a core collection workflow, and replacing the existing move controls is the main purpose of this feature.

**Independent Test**: A user can drag one item card to a different location and observe that the list order updates and persists after refresh.

**Acceptance Scenarios**:

1. **Given** a list with at least two cards, **When** the user drags a card and drops it between other cards, **Then** the card appears in the dropped position in the visible list.
2. **Given** a card has been dropped into a new position, **When** the reorder operation succeeds, **Then** the new order is persisted and remains the same after reloading the page.
3. **Given** a reorder request fails, **When** the failure is returned, **Then** the user sees a clear error message and the interface remains in a consistent state.

---

### User Story 2 - Remove arrow-based reordering controls (Priority: P1)

As an authenticated user, I no longer see up/down arrow controls for item-card reordering, so the UI reflects the new drag-and-drop interaction model only.

**Why this priority**: The feature explicitly replaces arrow-based movement with drag-and-drop and requires those controls to be removed completely.

**Independent Test**: A user opens the collection and confirms no up/down arrow controls are visible or operable for item-card ordering.

**Acceptance Scenarios**:

1. **Given** the collection page is loaded, **When** a user inspects each item-card row, **Then** no up/down arrow controls are present.
2. **Given** previous reorder controls were removed, **When** a user attempts to reorder, **Then** drag-and-drop is the available reorder interaction.

---

### User Story 3 - Keep reorder accessible and understandable (Priority: P2)

As an authenticated user, I receive clear interaction feedback during drag-and-drop and can still reorder without relying on pointer-only behavior.

**Why this priority**: Reordering must remain usable and understandable for different input methods to preserve product accessibility goals.

**Independent Test**: A user can identify draggable cards and complete reordering with clear feedback, while keyboard users retain a supported way to reorder.

**Acceptance Scenarios**:

1. **Given** a user starts dragging a card, **When** the drag interaction is active, **Then** the interface provides clear visual feedback about the dragged card and potential drop target.
2. **Given** a user does not use pointer drag, **When** they use the keyboard reorder shortcut on a focused card, **Then** they can complete reordering through a supported keyboard-accessible path.
3. **Given** a card has keyboard focus, **When** the user presses `Alt+ArrowUp` or `Alt+ArrowDown`, **Then** the card moves one position in the corresponding direction and the new order is persisted.

### Edge Cases

- A user drops a card back into its original position; no unnecessary reorder request is made.
- A user starts a drag and cancels before dropping; the order remains unchanged.
- A reorder operation is triggered while another reorder is still pending; the interface prevents conflicting updates.
- The list contains many cards; drag-and-drop still allows placing a card at beginning, middle, or end.
- The list has only one card; no reorder action is available and no errors are shown.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST remove item-card up/down arrow controls from the collection UI.
- **FR-002**: The system MUST allow authenticated users to reorder item-cards by dragging and dropping cards within the collection list.
- **FR-003**: The system MUST persist the new order after a successful drag-and-drop reorder action.
- **FR-004**: The system MUST show clear visual feedback during drag start, drag over, and drop target states.
- **FR-005**: The system MUST avoid sending a reorder update when the dropped position does not change the card order.
- **FR-006**: The system MUST provide a clear user-visible error state if reorder persistence fails.
- **FR-007**: The system MUST preserve ownership boundaries so reorder operations apply only to the authenticated user's items.
- **FR-008**: The system MUST provide keyboard reordering by moving the focused card with `Alt+ArrowUp` and `Alt+ArrowDown` after arrow controls are removed.

### Key Entities _(include if feature involves data)_

- **Collection Item**: A user-owned spell or web-link displayed as a reorderable card in the collection list.
- **Collection Order**: The persisted positional sequence of collection items for one authenticated user.
- **Reorder Interaction State**: Transient UI state representing drag start, current target position, and drop completion or cancellation.

## Constitution Alignment _(mandatory)_

- The feature MUST preserve private ownership boundaries and deny cross-user reorder access.
- The feature MUST continue using existing shared contracts for reorder payloads unless contract changes are explicitly required.
- The feature MUST define validation and error handling for invalid reorder operations and authorization failures.
- The feature MUST include tests for successful reordering, failure handling, ownership boundaries, and keyboard-accessible interaction.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of collection pages no longer display arrow-based reorder controls for item-cards.
- **SC-002**: In acceptance testing, at least 95% of users can move a card to a target position via drag-and-drop in under 10 seconds.
- **SC-003**: 100% of successful reorder actions remain persisted after page reload.
- **SC-004**: 100% of reorder failures show a visible error message without leaving the UI in a broken state.
- **SC-005**: Keyboard-only testing verifies users can reorder cards with `Alt+ArrowUp` and `Alt+ArrowDown` while focus remains on the moved card.

## Assumptions

- Existing backend reorder capability and ownership checks remain in place and are reused.
- This feature changes item-card reordering interactions only; tag reordering behavior is out of scope.
- The current collection list already renders stable item identity and order values suitable for reorder updates.
- No new authentication or authorization model changes are required for this feature.
