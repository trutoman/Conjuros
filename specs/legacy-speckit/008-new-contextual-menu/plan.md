# Implementation Plan: Item Card Contextual Menu

**Branch**: `008-new-contextual-menu` | **Date**: 2026-08-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/008-new-contextual-menu/spec.md`

## Summary

Replace the three-button `item-actions` layout in `ItemCard` with a two-button layout: the type-specific primary action (Copy or Open) plus a three-dot menu trigger button. The trigger opens a right-aligned dropdown containing Edit and Delete. Delete transitions the dropdown to an inline confirmation view (Confirm / Cancel) before calling `onDelete`. The dropdown uses the WAI-ARIA `role="menu"` pattern with roving tabindex and click-outside dismissal.

## Technical Context

**Language/Version**: TypeScript 5 / React 18 (JSX, functional components, hooks)

**Primary Dependencies**: React 18, Vite, Vitest, @testing-library/react, @conjuros/contracts

**Storage**: N/A — UI-only change; no persistence

**Testing**: Vitest + @testing-library/react; unit tests in `src/web/components/__tests__/`

**Target Platform**: Web browser (modern, evergreen)

**Project Type**: Web application (monorepo: `src/web` frontend, `src/api` backend, `packages/contracts` shared)

**Performance Goals**: N/A — dropdown open/close is a synchronous state toggle

**Constraints**: No new libraries; no changes outside `src/web/`

**Scale/Scope**: One component (`ItemCard.tsx`), two CSS classes, two test files updated

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                             | Status  | Notes                                                                                                                  |
| ------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| Ownership and private-data boundaries | ✅ PASS | UI-only change; no data access                                                                                         |
| Contract-First Architecture           | ✅ PASS | No API or response shape changes; `onEdit`/`onDelete` props unchanged                                                  |
| Test-First Quality and Verification   | ✅ PASS | `ItemCard.test.tsx` and `CollectionPage.test.tsx` must be updated; new tests required for menu, confirm flow, keyboard |
| Security and Safe User Actions        | ✅ PASS | Delete now guarded by explicit confirmation — improvement                                                              |
| Focused Product Experience            | ✅ PASS | Reduces action button count from 3 to 2; simpler visual                                                                |

**Post-design re-check**: All principles remain satisfied. No contract changes needed. Two existing test files require updates to remove stale `action-secondary` assertions.

## Project Structure

### Documentation (this feature)

```text
specs/008-new-contextual-menu/
├── plan.md                          ← this file
├── research.md                      ← Phase 0 output
├── data-model.md                    ← Phase 1 output
├── quickstart.md                    ← Phase 1 output
├── contracts/
│   └── item-card-menu-ui.md         ← Phase 1 output
└── tasks.md                         ← Phase 2 output (/speckit.tasks)
```

### Source Code (affected files)

```text
src/
└── web/
    ├── components/
    │   └── ItemCard.tsx              ← primary change: new state, menu trigger, dropdown
    ├── index.css                     ← new classes: .item-menu-wrapper, .item-menu-dropdown
    └── components/__tests__/
        └── ItemCard.test.tsx         ← update: remove action-secondary assertions, add menu tests

src/
└── web/
    └── pages/__tests__/
        └── CollectionPage.test.tsx   ← update: fix action button index/class assertions
```

**Structure Decision**: Single-project web application. All changes are confined to `src/web/`. No new files needed for the component itself — the menu is co-located inside `ItemCard.tsx` as local state + JSX. CSS additions go into the existing `index.css`.

## Phase 0: Research Output

See [research.md](research.md).

Key decisions:

- **Click-outside**: `document.addEventListener('pointerdown', ...)` inside `useEffect`, scoped to `isMenuOpen`
- **Single-menu-open**: Local state per card; click-outside naturally closes any open menu before opening a new one
- **CSS positioning**: `.item-menu-dropdown` mirrors `.tag-overflow-popover` (`position:absolute; top:calc(100%+0.35rem); right:0`)
- **Menu state**: `isMenuOpen: boolean` + `menuView: 'menu' | 'confirm'`
- **ARIA**: `role="menu"` / `role="menuitem"`, `aria-haspopup="menu"`, `aria-expanded`, roving tabindex

## Phase 1: Design Output

See [data-model.md](data-model.md), [contracts/item-card-menu-ui.md](contracts/item-card-menu-ui.md), [quickstart.md](quickstart.md).

### Design Summary

1. **`ItemCard.tsx`**:
   - Add `isMenuOpen`, `menuView`, `menuRef`, `triggerRef` state/refs
   - Replace inline Edit + Delete buttons with `.item-menu-wrapper` containing the trigger + `.item-menu-dropdown`
   - The dropdown renders either the menu view (Edit + Delete) or the confirm view (Confirm + Cancel)
   - `useEffect` for `pointerdown` click-outside; `onKeyDown` on the dropdown for Escape and arrow navigation

2. **`index.css`**:
   - Add `.item-menu-wrapper { position: relative; }`
   - Add `.item-menu-dropdown { position: absolute; top: calc(100% + 0.35rem); right: 0; z-index: 10; ... }`

3. **`ItemCard.test.tsx`**:
   - Remove assertions that Edit/Delete have `action-secondary` class
   - Add: 2-button layout assertion, menu open/close, click-outside, Escape, Edit, Delete→confirm, Confirm, Cancel, keyboard navigation

4. **`CollectionPage.test.tsx`**:
   - Fix `actionButtons[1]` and `[2]` assertions (indices change; `action-secondary` class removed)
