# Quickstart: Validate Item Card Contextual Menu

**Feature**: 008-new-contextual-menu
**Date**: 2026-08-01

---

## Prerequisites

- Node.js installed; `npm install` run from the repo root
- Docker running (for integration tests): `npm run docker:up`

---

## Run the unit tests

```bash
# From repo root — runs ItemCard and CollectionPage component tests
npm run test -- --reporter=verbose src/web/components/__tests__/ItemCard.test.tsx
npm run test -- --reporter=verbose src/web/pages/__tests__/CollectionPage.test.tsx
```

**Expected**: All tests pass, including:

- `item-actions has exactly 2 buttons for a spell` (Copy + menu trigger)
- `item-actions has exactly 2 buttons for a web-link` (Open + menu trigger)
- `clicking menu trigger opens dropdown with Edit and Delete`
- `clicking outside the dropdown closes it`
- `pressing Escape closes the menu`
- `clicking Delete shows inline confirmation`
- `clicking Confirm calls onDelete`
- `clicking Cancel does not call onDelete`
- `arrow keys move focus between menu items`
- `Escape returns focus to the trigger`

---

## Run all checks

```bash
npm run check
```

**Expected**: TypeScript compilation passes, lint passes, all tests pass.

---

## Verify in the browser

```bash
npm run dev
```

1. Open the collection page with at least one spell and one web-link.
2. **Layout**: Confirm each card shows exactly 2 buttons in the action area.
3. **Open menu**: Click the three-dot button on any card → dropdown appears below-right-aligned to the button with Edit and Delete stacked vertically.
4. **Dismiss**: Click anywhere outside the dropdown → it closes.
5. **Edit**: Open the menu → click Edit → the edit form opens.
6. **Delete confirmation**: Open the menu → click Delete → the dropdown content changes to Confirm / Cancel.
   - Click **Confirm** → item is deleted.
   - Reopen and click **Cancel** → nothing happens; menu closes.
7. **Keyboard**: Tab to the three-dot button → Enter → ArrowDown moves to Delete → Enter → ArrowDown moves to Confirm → Enter → item deleted.
8. **One at a time**: Open menu on card A → click menu trigger on card B → card A's menu closes, card B's opens.

---

## References

- UI contract: [contracts/item-card-menu-ui.md](contracts/item-card-menu-ui.md)
- Data model: [data-model.md](data-model.md)
- Research decisions: [research.md](research.md)
