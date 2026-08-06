## Context

See proposal.md - Why. In `ItemCard.tsx`, the dropdown is rendered inside `div.item-menu-wrapper` (which has `position: relative` and `z-index: 10` on the dropdown in `index.css`). The card `article.item-card` has no explicit stacking (`position`/`z-index`), but the shared hover/focus rule `.item-card:hover, .item-card:focus-within` applies `transform: translateY(-2px)`. Because focus is moved into the menu when it opens (`firstItem?.focus()`), the open card is almost always `:focus-within`, so it gains a transform — and a transform creates a stacking context. That stacking context makes the dropdown's `z-index: 10` relative only to the card's own content, not to sibling cards. Sibling cards in the grid below (DOM order) get the same transform on hover, and since they are separate stacking contexts with equal implicit `z-index: auto`, the later sibling paints above the open menu.

## Goals / Non-Goals

**Goals:**
- Raise the card with an open menu above all sibling cards so its dropdown always paints last
- Keep the existing hover/focus lift on all other cards untouched
- Reuse the existing `isMenuOpen` state already present in `ItemCard.tsx`

**Non-Goals:**
- Changing the menu's behavior, focus management, or dismissal logic
- Moving the dropdown into a portal or the document body
- Changing how sibling hover transforms work

## Decisions

### Decision 1: Elevate the open card via a state-driven class

**Approach:** Add a modifier class to the card `article` when `isMenuOpen` is true (e.g., `item-card--menu-open`), and give that class a stacking rule: `position: relative; z-index: 20;` (a value above the existing `z-index: 10` used by the dropdown and the `z-index: 2` used by the tag-overflow popover, and below the mobile sidebar overlays at 1000/1001). A positioned element with an explicit `z-index` participates in the grid's stacking order, so the open card — and everything inside it, including the dropdown — paints above sibling cards that only have `z-index: auto`.

**Rationale:**
- Directly addresses the root cause: the open card currently has no stacking context of its own at the grid level, so siblings with a transform (stacking context at `z-index: auto`) win by DOM order
- The explicit `z-index` on the positioned card guarantees it outranks any sibling that merely has a transform (transform alone never produces a positive z-index)
- Minimal, localized change; no JS restructuring

**Alternative considered:** Removing the `transform` from the hover rule so cards never create stacking contexts. Rejected — the hover lift is a deliberate visual affordance and removing it would change other behavior beyond this bug.

**Alternative considered:** Using `:has()` to select a card containing the open dropdown without a JS class. Rejected — `:has()` on a hovered/opened state is less explicit, and the state class makes the intent obvious and directly testable.

### Decision 2: Keep `z-index` on the dropdown inside the card

**Approach:** Leave the existing `.item-menu-dropdown { z-index: 10 }` in place. With the card elevated, the dropdown's z-index is resolved within the card's new stacking context, which is sufficient — no dropdown-level change is needed.

**Rationale:** Smaller diff; the bug is caused by the missing ancestor elevation, not by the dropdown's own z-index.

## Risks / Trade-offs

- **Risk:** A future rule giving a sibling card a positive `z-index` could outrank the open card again → **Mitigation:** choose `z-index: 20` comfortably above all in-frame popovers (2, 10) and document the choice; only the mobile sidebar overlays (1000/1001) are higher and they are full-screen scrims, not card content.
- **Trade-off:** The open card's entire background and shadow are elevated above siblings, not just the menu → **Acceptable:** this matches the focused-category pattern and is visually consistent with the hover lift; it also keeps the dropdown's clipped neighbors from showing through.
- **Risk:** CSS-only, so the elevation cannot be asserted via unit tests → **Mitigation:** assert the menu-open class presence and behavior in `ItemCard.test.tsx`; visual stacking is covered by the class rule being straightforward.
