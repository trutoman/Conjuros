## Why

Currently the Add item form, the Add/Edit tag form, and the Manage tags view completely replace the item list inside the main content frame. Users lose sight of their collection whenever they open one of these windows, and the navigation feels like page switches instead of lightweight dialogs. Presenting every secondary window as a floating modal over a permanently visible item list keeps context, reduces disorientation, and makes dismissal (click outside) consistent.

## What Changes

- Add a shared floating modal overlay (backdrop + dialog panel) used by all secondary windows opened from the collection page.
- Migrate Add item / Edit item (`ItemForm`), Add tag / Edit tag (`TagForm`), and Manage tags (list + search + embedded tag form) to render inside the shared modal while the item list stays mounted and visible behind it.
- Audit and migrate every other secondary window found on the collection page (markdown/file viewer, Manage themes + theme form, delete confirmations) to the same modal pattern so no window ever replaces the main frame again.
- The main content frame always renders the collection subheader (search, filters, Add item) and the item list states (loading, empty, no-results, error, list); modals overlay on top and never unmount the list.
- Dismissal is uniform: clicking the backdrop (outside the dialog panel), pressing Escape, or activating the existing Cancel/Close controls closes the topmost modal and reveals the unchanged list underneath. Backdrop clicks must not trigger actions inside the dialog.
- Preserve keyboard access and focus behavior: focus moves into the dialog on open, Escape closes it, and focus returns to the element that opened it.

## Capabilities

### New Capabilities

- `floating-modal-dialogs`: shared modal overlay contract (backdrop, dialog panel, stacking of nested dialogs such as Manage tags > Tag form, outside-click and Escape dismissal, focus management, list persistence) plus the full inventory of which collection-page windows use it.

### Modified Capabilities

- `collection-layout-and-navigation`: the main content frame no longer swaps its content for forms or management views; the "Item form replaces entire main content frame" requirement is replaced by modal-over-persistent-list behavior.
- `tag-management`: the Add tag form and the Manage tags view no longer replace the collection view; they open as floating modals over the persistent item list, and closing them reveals the unchanged list.
- `item-card-experience`: the markdown/file viewer no longer opens inside the collection item area replacing the list; it opens as a floating modal over the persistent item list.

## Impact

- Frontend only (`src/web/`): `CollectionPage.tsx` conditional rendering in `.main-content-frame`, a new shared `Modal` component (plus CSS in `index.css`), and the hosted views (`ItemForm`, `TagForm`, tag management view, `ItemCardViewer`, `ThemeForm`/theme management view, `DeleteConfirmDialog`).
- No API, contract (`packages/contracts`), or persistence changes.
- Existing frontend tests that assert the list is hidden while a form/view is open (`CollectionPage.*.test.tsx`, `ItemForm.test.tsx`, `TagForm.test.tsx`, `ItemCardViewer.test.tsx`, `TagsPage` if affected) will need updates to the modal assertions.
