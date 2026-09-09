## Context

See `proposal.md` Why. Current state:

- `ItemCard.tsx` holds a `menuView: 'menu' | 'confirm'` state. The Delete menuitem runs `handleDeleteStart` (switches to the inline tick/cross view); the tick runs `handleDeleteConfirm` (`onDelete(item)` + `closeMenu()`). `onDelete` in `CollectionPage.tsx:404` is `setDeleteItem`, which opens the `DeleteConfirmDialog` modal — hence the double confirmation.
- `DeleteConfirmDialog.tsx:27` wraps "Delete item" / "Cancel" in a plain `div` with no gap, so the buttons touch.
- Menu keyboard handling (`handleMenuKeyDown`, focus-first-item effect, close resets `menuView`) and the modal's own Cancel/backdrop/Escape dismissal already exist and stay.

Constraints: no API/contract change; tag/tag-category flows untouched (they already open the dialog directly); keep menu keyboard and focus behavior intact.

## Goals / Non-Goals

**Goals:**

- One confirmation for item deletes: menu Delete → styled dialog, menu closed.
- Slight visible gap between the dialog's action buttons in every delete flow.

**Non-Goals:**

- Restyling the dialog beyond button spacing (covered by `delete-confirm-dialog-theme`).
- Changing what the dialog says or when item deletion itself is allowed.

## Decisions

### 1. Delete menuitem calls through directly; remove the confirm branch

- Replace `handleDeleteStart` wiring with a `handleDelete`-style handler mirroring `handleEdit`: `onDelete(item); closeMenu();`. Delete the `'confirm'` view, its dropdown block, and the `menuView` state; simplify the focus effect deps to `isMenuOpen` and drop the reset effect.
- Rationale: the modal already owns cancellation (Cancel button, backdrop, Escape via `CollectionPage`), so the inline step adds nothing but a click.
- Alternative considered: keep the inline step and drop the modal — rejected; the user explicitly wants the styled dialog, and the modal carries the cascade copy and error display.

### 2. Spacing via a named actions class, flex gap only

- Give the dialog button container a class (e.g. `confirm-dialog-actions`) with `display: flex; gap: 0.75rem;` — no alignment or sizing changes, no hardcoded colors.
- Alternative considered: styling the bare `div` child selector — rejected; a named class survives markup edits (e.g. the `details`/`error` paragraphs added earlier).

### 3. Rework the inline-confirm tests, extend the dialog test

- `ItemCard.test.tsx`: the three inline-confirm tests become direct-call assertions (Delete → `onDelete` called, menu closed, no `Confirm delete`/`Cancel delete` menuitems rendered). The ArrowUp/ArrowDown test is unaffected (menu view still has exactly Edit + Delete).
- `DeleteConfirmDialog.test.tsx`: assert the actions container renders the buttons with a non-zero gap (computed style or CSS-rule check, matching the existing rule-text pattern in that file).

## Risks / Trade-offs

- [Risk] Accidental double-delete if users double-click Delete in the menu → Mitigation: unchanged from today — the modal still requires an explicit confirm; the menu closes immediately so the trigger is gone.
- [Risk] Focus return after menu close changes (the cancel-delete path used to refocus the trigger) → Mitigation: `closeMenu()` toggles the same state as before; `Modal` moves focus into the dialog on open, which is the desired flow.
- [Risk] Other tests reference the removed menuitems → Mitigation: grep for `Confirm delete`/`Cancel delete` and update; run `npm run check`.

## Migration Plan

No migration. Frontend-only change; rollback by reverting. Verify with `npm run check` (lint → test → build).

## Open Questions

None.
