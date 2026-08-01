# Feature Specification: Item Card Contextual Menu

**Feature Branch**: `008-item-card-contextual-menu`

**Created**: 2026-08-01

**Status**: Draft

**Input**: Replace the three-button item-actions layout with a two-button layout: the type-specific primary action plus a menu trigger that opens a contextual dropdown containing the edit and delete actions.

## Clarifications

### Session 2026-08-01

- Q: Should the menu trigger button always be visible, or only appear on hover/focus like the current `action-secondary` buttons? → A: Always visible — shown at all times regardless of hover state.
- Q: When the dropdown opens, which direction should it prefer to position itself relative to the trigger button? → A: Below-left — opens downward, right-aligned to the trigger button.
- Q: Should the dropdown use the standard ARIA `role="menu"` / `role="menuitem"` pattern, or a simpler custom approach? → A: `role="menu"` / `role="menuitem"` — standard ARIA menu pattern with arrow-key navigation and `roving tabindex`.
- Q: When the user activates Delete from inside the menu, should `onDelete` be called immediately or should the menu show an inline confirmation step first? → A: Inline confirmation — the menu shows a "Confirm / Cancel" step inside the dropdown before calling `onDelete`.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Trigger contextual menu from any item card (Priority: P1)

A user viewing their collection sees only two buttons per item: the primary action (copy or open) and a new three-dot menu button. Clicking the menu button opens a small dropdown anchored to that button showing the Edit and Delete actions stacked vertically.

**Why this priority**: This is the core structural change; all other stories depend on it.

**Independent Test**: Render a spell card and a web-link card, confirm only 2 buttons appear in `item-actions`, click the menu button, and verify the dropdown appears with Edit and Delete entries.

**Acceptance Scenarios**:

1. **Given** a spell card is displayed, **When** the user looks at its action area, **Then** only the Copy button and the menu trigger button are visible.
2. **Given** a web-link card is displayed, **When** the user looks at its action area, **Then** only the Open button and the menu trigger button are visible.
3. **Given** any item card, **When** the user clicks the menu trigger button, **Then** a dropdown appears anchored to that button containing an Edit button and a Delete button arranged vertically.

---

### User Story 2 - Dismiss the menu by clicking outside (Priority: P1)

After opening the contextual menu, the user clicks anywhere outside the dropdown (or outside the item card). The menu closes without performing any action.

**Why this priority**: Correct dismissal behaviour is required for the menu to be usable without leaving stale overlays on screen.

**Independent Test**: Open the menu, click the page background, and verify the dropdown is no longer in the DOM or is hidden.

**Acceptance Scenarios**:

1. **Given** the contextual menu is open, **When** the user clicks outside the menu, **Then** the menu closes.
2. **Given** the contextual menu is open, **When** the user presses Escape, **Then** the menu closes.
3. **Given** multiple item cards exist, **When** the user opens menu A then clicks on menu trigger B, **Then** menu A closes and menu B opens.

---

### User Story 3 - Edit and Delete actions work from inside the menu (Priority: P2)

The user opens the contextual menu and clicks Edit or Delete. Edit opens the edit form immediately. Delete shows an inline confirmation step inside the dropdown ("Confirm" and "Cancel" buttons); only after the user confirms does `onDelete` get called.

**Why this priority**: The existing functionality must not regress, and delete now requires an explicit confirmation to prevent accidental deletions.

**Independent Test**: Open the menu, click Edit — verify the edit form opens. Separately open the menu, click Delete — verify a confirmation step appears inside the dropdown; click Confirm and verify `onDelete` is called; repeat and click Cancel and verify `onDelete` is NOT called.

**Acceptance Scenarios**:

1. **Given** the contextual menu is open, **When** the user clicks Edit, **Then** the edit form opens for that item and the menu closes.
2. **Given** the contextual menu is open, **When** the user clicks Delete, **Then** the dropdown replaces its content with an inline confirmation view showing "Confirm" and "Cancel" buttons.
3. **Given** the inline confirmation is shown, **When** the user clicks Confirm, **Then** `onDelete` is called and the menu closes.
4. **Given** the inline confirmation is shown, **When** the user clicks Cancel, **Then** `onDelete` is NOT called and the menu closes.

---

### User Story 4 - Keyboard navigation (Priority: P2)

The menu trigger and the items inside the dropdown are reachable and operable with keyboard alone.

**Why this priority**: Required to maintain the accessibility standard established in the constitution.

**Independent Test**: Tab to the menu trigger, press Enter to open, Tab or arrow-key to reach Edit/Delete, press Enter to activate.

**Acceptance Scenarios**:

1. **Given** keyboard focus is on the menu trigger, **When** the user presses Enter or Space, **Then** the menu opens, `aria-expanded` becomes `true`, and focus moves to the first menu item.
2. **Given** the menu is open and focused, **When** the user presses ArrowDown or ArrowUp, **Then** focus moves between the Edit and Delete `menuitem` elements using roving tabindex.
3. **Given** the menu is open, **When** the user presses Escape, **Then** the menu closes, `aria-expanded` becomes `false`, and focus returns to the menu trigger.

---

### Edge Cases

- What happens when the item card is near the right or bottom edge of the viewport? The dropdown defaults to below-left (right-aligned); if that would overflow, it SHOULD flip to above-left or below-right as needed.
- What happens if the user rapidly clicks the menu trigger multiple times? The menu should toggle cleanly without stacking.
- What happens when an item has no description and is in compact view? The menu must still appear correctly.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The `item-actions` container MUST display exactly two buttons per item: the type-specific primary action button and the menu trigger button.
- **FR-002**: The menu trigger button MUST use the three-vertical-dots icon provided, MUST share the same visual style (`icon-action`) as the existing action buttons, and MUST always be visible regardless of hover or focus state. It MUST NOT use the `action-secondary` visibility class.
- **FR-003**: Clicking the menu trigger MUST open a dropdown anchored to the trigger button, positioned below it and right-aligned to its right edge, containing the Edit button and the Delete button arranged vertically.
- **FR-004**: The dropdown MUST close when the user clicks outside it, presses Escape, or activates one of its actions.
- **FR-005**: The Edit button inside the dropdown MUST invoke the same `onEdit` callback as the previous inline Edit button.
- **FR-006**: The Delete button inside the dropdown MUST NOT call `onDelete` directly; clicking it MUST transition the dropdown to an inline confirmation view.
- **FR-010**: The inline confirmation view MUST display two buttons: "Confirm" (calls `onDelete` and closes the menu) and "Cancel" (closes the menu without calling `onDelete`).
- **FR-007**: All existing button styles, sizes, aria-labels, and icon paths MUST be preserved unchanged for the primary action, Edit, and Delete buttons.
- **FR-008**: Only one contextual menu MAY be open at a time across all item cards.
- **FR-009**: The menu MUST be keyboard accessible: the trigger button MUST have `aria-haspopup="menu"` and `aria-expanded` reflecting open state; the dropdown MUST use `role="menu"`; each action inside MUST use `role="menuitem"`; arrow keys MUST move focus between items (roving tabindex); Enter/Space MUST activate the focused item; Escape MUST close the menu and return focus to the trigger.

## Constitution Alignment _(mandatory)_

- The feature is purely a UI interaction change and does not alter ownership boundaries or data access; no backend changes are required.
- No new contracts or Zod schemas are needed; existing `onEdit` and `onDelete` props remain the interface.
- Tests MUST cover: dropdown open/close, click-outside dismissal, Escape dismissal, Edit action, Delete → confirmation view, Delete → Confirm calls `onDelete`, Delete → Cancel does not call `onDelete`, and keyboard navigation.
- Invalid states (e.g., menu trigger on a loading skeleton) are out of scope.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Each item card shows exactly 2 action buttons (down from 3), reducing visual density in the action area.
- **SC-002**: All existing Edit operations continue to work without regression; Delete now requires an explicit confirmation before the callback fires — 0 accidental deletions possible through the new menu.
- **SC-003**: The dropdown opens and closes in a single user interaction with no visible delay.
- **SC-004**: Keyboard-only users can reach and activate all menu actions without mouse input.

## Assumptions

- The three-dot vertical icon SVG provided by the user is the definitive icon for the menu trigger; no alternative is needed.
- The dropdown does not require animation beyond appearing and disappearing; transitions may be added but are not required.
- Only one menu can be open at a time (no simultaneous open menus across cards).
- The feature applies to the `ItemCard` component only; no other card-like surfaces are in scope.
- The menu trigger button is always visible; it does not inherit the `action-secondary` hover-reveal behaviour previously applied to Edit and Delete.
- Mobile/touch interaction follows the same click/tap model as desktop.
