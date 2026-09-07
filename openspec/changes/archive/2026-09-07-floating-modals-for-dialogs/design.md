## Context

See proposal.md (Why) for motivation. Current state: `CollectionPage.tsx` conditionally renders exactly one view inside `.main-content-frame` — the item viewer, Manage tags (or its embedded tag form), Manage themes (or its embedded theme form), the item form, or the collection subheader + list. Opening any window unmounts the list. The only existing overlay pattern is `DeleteConfirmDialog`, which already renders a `.dialog-backdrop` with `role="dialog"` and `aria-modal="true"`. `TagsPage.tsx` is legacy (unused by `App.tsx`, which renders `CollectionPage` directly) and is out of scope except for shared components it imports.

## Goals / Non-Goals

**Goals:**

- The `.main-content-frame` always renders the subheader + list states; every secondary window renders as a sibling modal overlay.
- One shared modal implementation reused by all windows, including nested stacking (Manage tags > Tag form).
- Uniform dismissal (backdrop click, Escape, existing Cancel/Close controls) and focus behavior without changing any save/delete/reorder logic.

**Non-Goals:**

- No visual redesign of the forms, lists, or viewer content themselves; no new animations or component libraries.
- No changes to API shapes, contracts, auth, or persistence.
- No changes to `TagsPage.tsx` routing or revival; shared components it uses keep working as before.

## Decisions

- **New shared `Modal` component** (`src/web/components/Modal.tsx`) that renders a backdrop element plus a dialog panel (`role="dialog"`, `aria-modal="true"`, labelled by the hosted view's heading). Rationale: a single place for backdrop-click handling, Escape handling, and focus management; alternatives considered were per-view ad-hoc backdrops (rejected: inconsistent dismissal and duplicated a11y logic) and a third-party dialog library (rejected: project rule forbids adding libraries without specific need, and the need is small).
- **Reuse the existing `.dialog-backdrop` styling** already used by `DeleteConfirmDialog`, extended in `index.css` for centering, max-width panel sizing, and a stacking scale (CSS variable or modifier class per nesting level). Rationale: visual consistency with the one modal that already exists; no new design language.
- **Keep the existing boolean/object state model in `CollectionPage`** (`formItem`, `formTag`, `manageTags`, `viewerItem`, `manageThemes`, `formTheme`, `deleteItem/Tag/Theme`); only change the render tree so the list block renders unconditionally and each window renders as a `<Modal>` sibling when its state is active. Rationale: minimal state churn, existing open/close handlers keep working, save flows untouched.
- **Backdrop click detection via `onMouseDown` self-target check on the backdrop element** (close only when the event target is the backdrop itself). Rationale: avoids closing on drag-out or clicks bubbling from inside the panel; simpler and more predictable than document-level click listeners.
- **Escape handling and focus management inside `Modal`** (keydown listener for Escape closing the topmost modal; focus the panel/heading on mount and restore focus to the opener on unmount via a ref captured at open). Rationale: per-modal listeners naturally implement topmost-first closing for stacked modals; no global modal manager needed.
- **Nested modals render as stacked siblings** (Manage tags modal + Tag form modal), each with its own backdrop, higher `z-index` for the topmost. Rationale: matches the current embedded-form flow (`formTag` inside manage-tags mode) with the smallest state change — closing the inner modal falls back to the outer one.
- **Host the viewer and theme management in `Modal` too**, including `DeleteConfirmDialog` migrated onto (or verified compatible with) the shared component. Rationale: the user's explicit rule — no window may replace the main frame — requires the full inventory, not just the three named windows.

## Risks / Trade-offs

- [Risk] Tests asserting the list is hidden while a form/view is open will fail → Mitigation: update `CollectionPage.*`, `ItemForm`, `TagForm`, and `ItemCardViewer` tests to the modal assertions in the same change; run `npm run check` before finishing.
- [Risk] Focus return to the opener may misbehave if the opener unmounted (e.g. list re-rendered after save) → Mitigation: guard the restore call and fall back to focusing the main frame heading; covered by a test.
- [Risk] Backdrop clicks during async save could dismiss mid-submit → Mitigation: disable backdrop/Escape dismissal while a hosted form is in a pending submit state (pass an `isBusy`/`disabled` prop into `Modal`).
- [Trade-off] The list behind the modal stays mounted and its queries keep running — slightly more rendering work while a dialog is open, accepted for persistent context and simpler state.

## Migration Plan

- Frontend-only change behind no flag; single deploy, no data migration. Rollback is a plain revert — no persisted state changes.
- Order: add `Modal` + styles first, then migrate windows one by one (item form, tag management + tag form, viewer, themes, delete confirms), updating tests per window; finish with `npm run check` (lint → test → build).
