## 1. Direct Item Delete Confirmation

- [x] 1.1 Remove the inline `menuView` tick/cross confirmation state and branch from `src/web/components/ItemCard.tsx`; make the item-menu Delete action call `onDelete(item)` and close the menu directly
- [x] 1.2 Update `src/web/components/__tests__/ItemCard.test.tsx` to verify Delete opens the external confirmation flow through `onDelete`, closes the menu, and renders no inline confirm/cancel menuitems

## 2. Confirmation Dialog Spacing

- [x] 2.1 Add a named actions container class to `DeleteConfirmDialog` and style it with a small horizontal flex gap, without changing dialog colors or behavior
- [x] 2.2 Extend `DeleteConfirmDialog` tests to verify the actions container and spacing rule cover item, tag, and tag-category confirmation usage

## 3. Validation

- [x] 3.1 Run `npm run check` (lint -> test -> build) and fix regressions
- [x] 3.2 Manually verify item Delete opens one styled confirmation directly, Cancel has no side effect, and tag/category dialogs show separated buttons
