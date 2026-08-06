## 1. Add the menu-open state class

- [x] 1.1 In `src/web/components/ItemCard.tsx`, add a menu-open modifier class (e.g., `item-card--menu-open`) to the card `article` className when `isMenuOpen` is true, preserving the existing `item-card kind-${item.kind}` classes

## 2. Elevate the open card in CSS

- [x] 2.1 In `src/web/index.css`, add an `.item-card.item-card--menu-open` rule with `position: relative; z-index: 20;` so the open card and its dropdown paint above sibling cards

## 3. Regression tests

- [x] 3.1 In `src/web/components/__tests__/ItemCard.test.tsx`, add a test asserting the card `article` receives the menu-open class when the "Item menu" trigger is clicked
- [x] 3.2 Add a test asserting the menu-open class is removed when the menu is closed (Escape or outside click)

## 4. Validation

- [x] 4.1 Run `npm run check` and confirm lint, tests, and build pass
