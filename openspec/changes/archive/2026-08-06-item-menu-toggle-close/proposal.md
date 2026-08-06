## Why

Clicking the "Item menu" trigger on an item card opens the contextual menu, but clicking the same trigger again while the menu is open does not close it. The menu also has no coordination between cards, so a second card's menu can be opened while another is already open. Users expect a toggle: the same trigger that opens the menu closes it, and opening a menu on one item automatically closes any other open menu.

## What Changes

- Clicking the "Item menu" trigger while its menu is open closes the menu (and returns focus to the trigger).
- Only one item menu is open at a time: opening a menu on one card closes any other open menu.
- The menu-open elevation class (`item-card--menu-open`) is removed when the menu closes.
- All existing menu behavior (Edit/Delete/Confirm, outside-click dismissal, Escape, arrow-key navigation) is preserved.

## Capabilities

### New Capabilities
<!-- No new capabilities -->

### Modified Capabilities
- `item-card-experience`: The contextual menu must toggle closed when its own trigger is clicked again, and at most one item menu may be open at any time.

## Impact

- `src/web/components/ItemCard.tsx`: trigger click toggles the menu closed; menu open state coordination with sibling cards.
- `src/web/components/CollectionList.tsx`: coordinates which card's menu is open (single open menu per collection).
- `src/web/components/__tests__/ItemCard.test.tsx` and `CollectionList.test.tsx`: regression tests for toggle-close and single-open-menu behavior.
- No API, contract, or data layer changes.
