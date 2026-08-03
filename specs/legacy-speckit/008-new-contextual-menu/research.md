# Research: Item Card Contextual Menu

**Feature**: 008-new-contextual-menu
**Date**: 2026-08-01

---

## 1. Click-outside dismissal

**Decision**: Document-level `pointerdown` listener in `useEffect` inside `ItemCard`, using a `menuRef` on the menu wrapper.

**Rationale**: The codebase already uses `useEffect` + `addEventListener` for the `ResizeObserver`/`resize` listener in `ItemCard`. Adding a `pointerdown` document listener follows the exact same lifecycle pattern (register on open, unregister on close or unmount). No shared hook or context is needed.

**Pattern**:

```tsx
useEffect(() => {
  if (!isMenuOpen) return;
  const handlePointerDown = (e: PointerEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setIsMenuOpen(false);
      setMenuView('menu');
    }
  };
  document.addEventListener('pointerdown', handlePointerDown);
  return () => document.removeEventListener('pointerdown', handlePointerDown);
}, [isMenuOpen]);
```

**Alternatives considered**: React `onBlur` on the menu container — rejected because it does not fire when focus moves to a non-focusable element (e.g., page background click).

---

## 2. Single-menu-open across all cards

**Decision**: No shared context or lifted state. Local `isMenuOpen` per card, combined with the document `pointerdown` listener above.

**Rationale**: When the user clicks a second card's menu trigger, `pointerdown` fires on the document first (closing the currently open menu), then the click event fires on the new trigger (opening it). This is natural browser event ordering — no coordination needed.

**Alternatives considered**: A React context holding the currently-open card ID — rejected as over-engineering for a purely visual constraint that falls out naturally from click-outside behaviour.

---

## 3. CSS positioning (dropdown below-left, right-aligned)

**Decision**: New class `.item-menu-dropdown` using `position: absolute; top: calc(100% + 0.35rem); right: 0` — identical anchor strategy to the existing `.tag-overflow-popover`.

**Rationale**: `.tag-overflow-popover` is already right-aligned to its container with `right: 0` and opens below with `top: calc(100% + 0.35rem)`. The same pattern is correct for the menu dropdown. The trigger wrapper needs `position: relative`.

**Overflow/flip**: Viewport-edge flipping is out of scope per spec (the spec says "SHOULD flip"; no strict requirement). The right-aligned default is sufficient for the typical layout.

---

## 4. Menu state model

**Decision**: Two new `useState` values inside `ItemCard`:

- `isMenuOpen: boolean` — controls dropdown visibility
- `menuView: 'menu' | 'confirm'` — controls which view is shown inside the dropdown

**Rationale**: The two-state model cleanly separates "is the dropdown visible" from "which content is inside it". Resetting `menuView` to `'menu'` whenever the dropdown closes ensures the confirmation step never persists stale state.

---

## 5. ARIA menu pattern

**Decision**: Standard WAI-ARIA Menu Button pattern.

- Trigger button: `aria-haspopup="menu"`, `aria-expanded={isMenuOpen}`, `aria-controls="item-menu-{item._id}"`
- Dropdown container: `role="menu"`, `id="item-menu-{item._id}"`
- Each action: `role="menuitem"`, `tabIndex={-1}` except the focused item (`tabIndex={0}` via roving tabindex)

**Rationale**: Matches FR-009 exactly. Roving tabindex is the correct pattern for `role="menu"` — `Tab` should move focus out of the menu entirely; `ArrowDown`/`ArrowUp` navigate within it. `Escape` closes and returns focus to the trigger.

**Focus management**: On open, focus the first `menuitem`. On close (Escape or action activated), return focus to the trigger ref.

---

## 6. Existing test impact

**Files that must be updated** (assertions will break without changes):

| File                                                       | Current assertion                                    | Why it breaks                                                                     |
| ---------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| `src/web/components/__tests__/ItemCard.test.tsx` L107-108  | Edit/Delete have `action-secondary` class            | Edit/Delete move inside the dropdown; no longer direct children of `item-actions` |
| `src/web/pages/__tests__/CollectionPage.test.tsx` L114-115 | `actionButtons[1]` and `[2]` have `action-secondary` | Same — index and class both change                                                |

Both files need updated assertions to reflect the new 2-button layout and the menu-driven delete flow.
