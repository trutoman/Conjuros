# UI Contract: Item Card Contextual Menu

**Feature**: 008-new-contextual-menu
**Date**: 2026-08-01

---

## Scope

This contract defines the visual structure, ARIA attributes, and interaction behaviour of the contextual menu introduced in the `ItemCard` component.

---

## Button Layout — `item-actions` container

The `item-actions` div contains exactly **2 buttons** per card:

| Position | Button                                      | Always visible? | Class         |
| -------- | ------------------------------------------- | --------------- | ------------- |
| 1        | Type-specific primary action (Copy or Open) | Yes             | `icon-action` |
| 2        | Menu trigger (three-dot icon)               | Yes             | `icon-action` |

The `action-secondary` class is **removed** from Edit and Delete; neither button appears directly in `item-actions`.

---

## Menu Trigger Button

```html
<button
  type="button"
  class="icon-action"
  aria-label="Item menu"
  aria-haspopup="menu"
  aria-expanded="false|true"
  aria-controls="item-menu-{item._id}"
>
  <!-- three-vertical-dots SVG icon -->
</button>
```

| Attribute       | Value when closed   | Value when open     |
| --------------- | ------------------- | ------------------- |
| `aria-expanded` | `"false"`           | `"true"`            |
| `aria-haspopup` | `"menu"`            | `"menu"`            |
| `aria-controls` | `"item-menu-{_id}"` | `"item-menu-{_id}"` |

---

## Dropdown — Menu View

Visible when `isMenuOpen === true && menuView === 'menu'`.

```html
<div class="item-menu-dropdown" id="item-menu-{item._id}" role="menu" aria-label="Item options">
  <button type="button" class="icon-action" role="menuitem" aria-label="Edit">
    <!-- pencil icon -->
  </button>
  <button type="button" class="icon-action danger" role="menuitem" aria-label="Delete">
    <!-- trash icon -->
  </button>
</div>
```

---

## Dropdown — Confirm View

Visible when `isMenuOpen === true && menuView === 'confirm'`.
Replaces the menu view content in-place (same dropdown container).

```html
<div
  class="item-menu-dropdown item-menu-dropdown--confirm"
  id="item-menu-{item._id}"
  role="menu"
  aria-label="Confirm delete"
>
  <button type="button" class="icon-action danger" role="menuitem" aria-label="Confirm delete">
    <!-- confirm/check icon or text label -->
  </button>
  <button type="button" class="icon-action quiet" role="menuitem" aria-label="Cancel delete">
    <!-- cancel/close icon or text label -->
  </button>
</div>
```

---

## CSS — `.item-menu-wrapper` and `.item-menu-dropdown`

The trigger button and dropdown are wrapped in a `position: relative` container:

```css
.item-menu-wrapper {
  position: relative;
}

.item-menu-dropdown {
  position: absolute;
  top: calc(100% + 0.35rem);
  right: 0;
  z-index: 10;
  min-width: 2.6rem; /* fits icon-action buttons */
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.35rem;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 0.75rem;
  box-shadow: var(--shadow);
}
```

---

## Keyboard Contract

| Key           | Context           | Effect                                   |
| ------------- | ----------------- | ---------------------------------------- |
| Enter / Space | Focus on trigger  | Opens menu; focuses first menuitem       |
| ArrowDown     | Menu open         | Moves focus to next menuitem (wraps)     |
| ArrowUp       | Menu open         | Moves focus to previous menuitem (wraps) |
| Enter / Space | Focus on menuitem | Activates the item                       |
| Escape        | Menu open         | Closes menu; returns focus to trigger    |
| Tab           | Menu open         | Closes menu; moves focus out of card     |

---

## Dismissal Rules

The menu closes (and `menuView` resets to `'menu'`) when:

1. The user clicks outside the `.item-menu-wrapper` element
2. The user presses Escape
3. The user activates Edit (opens edit form)
4. The user activates Confirm (calls `onDelete`)
5. The user activates Cancel

---

## Icon: Menu Trigger

SVG path (Material Symbols — `more_vert`):

```
M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z
```

`viewBox="0 -960 960 960"`, rendered as `icon icon-filled`.
