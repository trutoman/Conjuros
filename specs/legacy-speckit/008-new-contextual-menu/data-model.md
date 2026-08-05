# Data Model: Item Card Contextual Menu

**Feature**: 008-new-contextual-menu
**Date**: 2026-08-01

---

## Overview

This feature introduces no new data entities, no API changes, and no contract changes. All changes are confined to local UI state within the `ItemCard` React component.

---

## New UI State

Two new `useState` values are added to `ItemCard`:

### `isMenuOpen: boolean`

| Attribute      | Value                                                                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Type           | `boolean`                                                                                                                                 |
| Initial value  | `false`                                                                                                                                   |
| Scope          | Local to each `ItemCard` instance                                                                                                         |
| Set to `true`  | User clicks the menu trigger button                                                                                                       |
| Set to `false` | User clicks outside the dropdown; user presses Escape; user activates Edit; user activates Confirm or Cancel inside the confirmation view |

### `menuView: 'menu' \| 'confirm'`

| Attribute          | Value                                          |
| ------------------ | ---------------------------------------------- |
| Type               | `'menu' \| 'confirm'`                          |
| Initial value      | `'menu'`                                       |
| Scope              | Local to each `ItemCard` instance              |
| Set to `'confirm'` | User clicks Delete while `menuView === 'menu'` |
| Reset to `'menu'`  | Any time `isMenuOpen` is set to `false`        |

---

## State Transitions

```
[closed]
   │  click trigger
   ▼
[open — 'menu' view]
   │  click Edit          → onEdit(item); close → [closed]
   │  click Delete        → [open — 'confirm' view]
   │  click outside       → close → [closed]
   │  Escape              → close → [closed]
   ▼
[open — 'confirm' view]
   │  click Confirm       → onDelete(item); close → [closed]
   │  click Cancel        → close → [closed]
   │  click outside       → close → [closed]
   │  Escape              → close → [closed]
```

---

## Refs

| Ref          | Type                                | Purpose                                                     |
| ------------ | ----------------------------------- | ----------------------------------------------------------- |
| `menuRef`    | `useRef<HTMLDivElement \| null>`    | Root of the dropdown wrapper; used to detect outside clicks |
| `triggerRef` | `useRef<HTMLButtonElement \| null>` | Menu trigger button; receives focus when the menu closes    |

---

## No Changes To

- `CollectionItem` data type (packages/contracts)
- `Tag` data type
- `ItemCard` props: `item`, `tags`, `onEdit`, `onDelete` remain unchanged
- Any API endpoint, Zod schema, or backend service
