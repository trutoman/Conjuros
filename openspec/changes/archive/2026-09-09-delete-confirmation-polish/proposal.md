## Why

The delete confirmation dialog buttons ("Delete item" / "Cancel") sit stuck together with no spacing, and deleting a collection item forces users through two confirmations: an inline tick/cross step in the card menu followed by the confirmation dialog. One styled confirmation is enough.

## What Changes

- The delete confirmation dialog action buttons get slight horizontal spacing (themed, consistent with the rest of the dialog).
- The item card menu no longer shows the inline tick/cross confirm step: activating Delete in the menu calls the delete action directly (opening the styled confirmation dialog) and closes the menu.
- Tag and tag-category delete flows are unchanged (they already open the confirmation dialog directly) and pick up the button spacing automatically since they share the dialog.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `item-card-experience`: the item menu Delete action opens the delete confirmation directly; the inline tick/cross confirm step is removed.
- `floating-modal-dialogs`: the delete confirmation dialog action buttons SHALL have visible horizontal spacing.

## Impact

- Affected code: `src/web/components/ItemCard.tsx` (remove `menuView` confirm branch, wire Delete straight through), `src/web/index.css` (button spacing in `.confirm-dialog`), `src/web/components/__tests__/ItemCard.test.tsx` (inline-confirm tests reworked), `DeleteConfirmDialog` tests (spacing assertion).
- APIs: none. Contracts: none. No new dependencies.
- Keyboard/a11y: the menu keeps its ArrowUp/ArrowDown/Escape handling; focus behavior on menu close is preserved.
