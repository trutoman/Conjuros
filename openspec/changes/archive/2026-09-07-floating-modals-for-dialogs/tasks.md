## 1. Shared Modal foundation

- [x] 1.1 Create `src/web/components/Modal.tsx` (backdrop + dialog panel with `role="dialog"`, `aria-modal="true"`, accessible name; backdrop self-target `onMouseDown` dismissal; Escape to close topmost; focus into dialog on open and restore to opener on close; `isDismissDisabled` prop for pending submits)
- [x] 1.2 Extend `.dialog-backdrop` styles in `src/web/index.css` for centered floating panel, max-width sizing, and nested-modal stacking above the existing delete-confirm styling
- [x] 1.3 Add `Modal` unit tests (backdrop click closes, inside click does not, Escape closes, focus moves in and back out, dismiss disabled while busy)

## 2. Migrate item and tag windows

- [x] 2.1 Render `ItemForm` (Add/Edit item) inside `Modal` in `CollectionPage` while the subheader + list stay mounted; verify save/cancel flows unchanged
- [x] 2.2 Render Manage tags view and `TagForm` (Add/Edit tag) as stacked `Modal`s in `CollectionPage` (tag form nested above Manage tags); keep the Add-tag entry point inside Manage tags only
- [x] 2.3 Migrate `ItemCardViewer` (markdown/file) into `Modal`, keeping Edit handoff (viewer Edit opens the item form modal)

## 3. Migrate remaining windows

- [x] 3.1 Migrate Manage themes view and `ThemeForm` into `Modal` following the same stacked pattern
- [x] 3.2 Migrate `DeleteConfirmDialog` (item, tag, theme) onto the shared `Modal` while preserving its existing role/labels
- [x] 3.3 Audit `CollectionPage` for any other branch that hides the list and migrate it; confirm `.main-content-frame` always renders subheader + list states

## 4. Tests and validation

- [x] 4.1 Update `CollectionPage` tests (list stays visible with each modal open; backdrop click reveals unchanged list; nested tag-form dismissal returns to Manage tags)
- [x] 4.2 Update `ItemForm`, `TagForm`, and `ItemCardViewer` tests to the modal assertions
- [x] 4.3 Run `npm run check` (lint → test → build) and fix failures
