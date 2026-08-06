## 1. Lift single-open menu state into CollectionList

- [x] 1.1 In `src/web/components/CollectionList.tsx`, add `openMenuId` state and pass `isMenuOpen`/`onMenuToggle` props to each `ItemCard`

## 2. Make ItemCard a controlled menu component

- [x] 2.1 In `src/web/components/ItemCard.tsx`, replace local `isMenuOpen` state with `isMenuOpen`/`onMenuToggle` props; route trigger click and Escape/outside-click/Cancel close paths through `onMenuToggle`
- [x] 2.2 In `src/web/components/ItemCard.tsx`, update the document `pointerdown` handler to ignore presses on the trigger button (`triggerRef.current`), so a second trigger click only toggles
- [x] 2.3 In `src/web/components/ItemCard.tsx`, add an effect that resets `menuView` to `'menu'` whenever the menu opens

## 3. Regression tests

- [x] 3.1 In `src/web/components/__tests__/ItemCard.test.tsx`, update renders to pass `isMenuOpen`/`onMenuToggle`, and add tests asserting clicking the open menu's trigger calls `onMenuToggle`
- [x] 3.2 In `src/web/components/__tests__/CollectionList.test.tsx`, add a test asserting only one menu is open at a time and that opening a second menu closes the first

## 4. Validation

- [x] 4.1 Run `npm run check` and confirm lint, tests, and build pass
