## Why

The item card's contextual menu (opened from the three-dot "Item menu" trigger) does not reliably paint above sibling cards. Because opening the menu moves focus into the card, the card's `:focus-within` hover rule applies `transform: translateY(-2px)`, which creates a new stacking context that traps the menu's `z-index` inside the card. Sibling cards below in DOM order — especially when hovered (they apply the same transform) — then paint over the open menu, hiding its Edit/Delete actions and making them unclickable.

## What Changes

- Ensure the item card that has an open contextual menu is raised above all sibling cards so the dropdown always renders in the foreground.
- Preserve the existing hover/focus lift behavior (`transform: translateY(-2px)`) on cards without an open menu.
- Keep all existing menu behavior unchanged: trigger, focus management, outside-click/Escape dismissal, and Edit/Delete/Confirm actions.
- Add regression coverage asserting the open menu's stacking elevation.

## Capabilities

### New Capabilities
<!-- No new capabilities -->

### Modified Capabilities
- `item-card-experience`: The open contextual menu on an item card must always appear above other collection cards, including cards that are hovered or focused.

## Impact

- `src/web/components/ItemCard.tsx`: add a menu-open state class on the card `article` when the menu is open.
- `src/web/index.css`: add a rule elevating the card with an open menu (positioning + explicit `z-index`) so its stacking context outranks sibling cards.
- `src/web/components/__tests__/ItemCard.test.tsx`: add regression tests for the menu-open class.
- No API, contract, or data layer changes.
