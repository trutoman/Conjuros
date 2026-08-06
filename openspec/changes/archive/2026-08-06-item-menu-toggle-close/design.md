## Context

See proposal.md - Why. In `ItemCard.tsx`, each card owns its `isMenuOpen` state, and the trigger button's `onClick={() => setIsMenuOpen((v) => !v)}` is meant to toggle. A document-level `pointerdown` listener closes the menu when the press lands outside `menuRef.current` (the dropdown element). Because the trigger button lives *outside* the dropdown, a second click on the trigger fires `pointerdown` (target outside dropdown → closes menu) and then `click` (toggle re-opens it), so the menu never closes. There is also no cross-card coordination, so two menus can be open at once (e.g., keyboard activation of a second trigger).

## Goals / Non-Goals

**Goals:**
- Clicking the open menu's own trigger closes it and returns focus to the trigger.
- Guarantee at most one item menu open at a time, by construction.
- Keep all existing menu behavior: Edit/Delete/Confirm, Escape, arrow keys, outside-click dismissal.

**Non-Goals:**
- Changing the menu's visual elevation, focus trap, or dismissal triggers.
- Moving the dropdown into a portal.

## Decisions

### Decision 1: Lift the single-open menu state into `CollectionList`

**Approach:** `CollectionList` holds `const [openMenuId, setOpenMenuId] = useState<string | null>(null)`. It passes `isMenuOpen={openMenuId === item.id}` and `onMenuToggle={() => setOpenMenuId((current) => (current === item.id ? null : item.id))}` to each `ItemCard`. `ItemCard` becomes a controlled component: it removes its local `isMenuOpen` state and calls `onMenuToggle()` instead of `setIsMenuOpen`.

**Rationale:** A single `openMenuId` makes "at most one open menu" an invariant rather than a behavior to be inferred from outside-click events. The toggle is trivially correct because clicking any trigger either opens that card (replacing the previous id) or closes it.

**Alternative considered:** Keep per-card state and rely on the existing outside-click handler to close the previous menu. Rejected — it is implicit, and keyboard activation of a second trigger (no `pointerdown`) could leave two menus open.

### Decision 2: Outside-click handler must ignore clicks on the trigger

**Approach:** The document `pointerdown` listener closes the menu only when the target is outside both the dropdown (`menuRef.current`) and the trigger button (`triggerRef.current`).

**Rationale:** This removes the root cause. With the trigger excluded, a second trigger click only produces the `click` toggle; the `pointerdown` no longer pre-closes the menu that the toggle is about to close.

**Alternative considered:** Removing the outside-click handler entirely and relying solely on the toggle. Rejected — clicking elsewhere on the page (outside the card) must still dismiss the menu.

### Decision 3: Reset `menuView` to the base view on each open

**Approach:** Add an effect that runs when the menu opens and resets `menuView` to `'menu'` (from `'confirm'`), so reopening a card never shows a stale delete-confirmation view. The existing focus effect continues to focus the first menu item on open and when the view changes.

**Rationale:** With the close path now going through the shared `openMenuId`, the previous "reset view on close" call sites are replaced; resetting on open keeps the invariant in one place and covers all close paths.

## Risks / Trade-offs

- **Risk:** Lifting state into `CollectionList` re-renders every card on toggle → **Mitigation:** collections are small and the re-render is trivial; no memoization needed.
- **Trade-off:** The trigger toggle semantics now depend on the parent prop contract → **Mitigation:** `ItemCard` exposes a minimal, typed `isMenuOpen`/`onMenuToggle` interface; behavior is covered by unit tests.
- **Risk:** Excluding both `menuRef` and `triggerRef` from outside-click could leave the menu open if a user clicks the wrapper gutter → **Mitigation:** the wrapper only contains the trigger and dropdown, both covered; clicking elsewhere dismisses.
