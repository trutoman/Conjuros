## Context

See proposal.md — Why. `ItemCard.tsx:311-343` renders kind-specific action buttons (spell "Copy command", web-link "Open link") as conditional JSX inside `.item-actions`, followed by the always-rendered `.item-menu-wrapper` (`ItemCard.tsx:344`). Markdown cards currently render no kind-specific action. `CollectionPage.tsx:70-76` holds mutually-exclusive panel state (`formItem`/`formTag`/`deleteItem`/`deleteTag`/`manageTags`) and renders one branch inside `.main-content-frame` (`CollectionPage.tsx:212-386`). `ItemForm.tsx:46-49` already produces sanitized markdown HTML via `DOMPurify.sanitize(marked.parse(content) as string)`. There is no existing read-only viewer.

## Goals / Non-Goals

**Goals:**
- Add a "View markdown" action button to markdown item cards, styled and placed like the other two kind-specific action buttons, with an eye icon glyph.
- Open a read-only viewer panel in the collection item area that renders the full sanitized markdown and shows "View markdown" + item title.
- Viewer offers a close (✕) path back to the collection and an Edit button that opens the same item form as the contextual menu Edit.

**Non-Goals:**
- No API or `packages/contracts` changes; `content` stays stored unchanged.
- No new renderer library; reuse the existing `marked` + `DOMPurify` pipeline.
- No editing inside the viewer; editing always goes through the existing `ItemForm`.

## Decisions

### 1. Add a `viewItem` panel state in `CollectionPage.tsx`

Add `viewerItem: CollectionItem | null | undefined` to the panel state in `CollectionPage.tsx` (alongside `formItem`, `manageTags` at `:70-78`), with `openItemViewer(item: CollectionItem)` and `closeViewer()` mirrors of the existing open helpers (`:98-119`). Render a new mutually-exclusive branch in `.main-content-frame` (`:212-386`) that shows `<ItemCardViewer …>` when `viewerItem !== undefined`. Rationale: mirrors exactly how the item form and manage-tags panels open/close, keeps one panel open at a time, and requires no layout change. Alternative considered (overlay/modal) rejected — it would diverge from the established in-frame panel UX.

### Decision 2. Proxy the viewer from the card through a new `onView` prop

Add `onView: (item: CollectionItem) => void` to `CollectionList.tsx` and forward it to each `ItemCard` (`:104-112`, mirroring `onEdit`). In `ItemCard.tsx` render, for `item.kind === 'markdown'`, an `icon-action` button with `aria-label="View markdown"` whose inline SVG is the eye glyph provided in the request, placed in `.item-actions` before `.item-menu-wrapper`. Rationale: keeps the change minimal and consistent with the existing `onEdit`/`onDelete` wiring.

### Decision 3. New `ItemCardViewer` component reusing existing chrome and sanitized rendering

Create `src/web/components/ItemCardViewer.tsx` with props `{ item, onClose, onEdit }`. Reuse the `.item-form` chrome: a `.form-close` ✕ button (`aria-label="Close markdown viewer"`) and an `h2` "View markdown" followed by the item title. Below, render `DOMPurify.sanitize(marked.parse(item.content ?? '') as string)` into a `.content-pane-preview`-style container via `dangerouslySetInnerHTML` — the exact same sanitizer pipeline `ItemForm.tsx:46-49` uses. An "Edit" button calls `onEdit` and SHALL use the default (primary) button style — `var(--primary)` background with white text (`index.css:75-79`) — matching the "Add item" and "Save item" primary actions; it SHALL NOT use the `quiet` muted style. Rationale: reuses proven sanitization and existing styles; Edit is the viewer's primary forward action, so muting it would be inconsistent with every other primary action in the app.

### Decision 4. Wire Edit to the existing edit form path

`CollectionPage.tsx` opens the viewer with `openViewer(item)`, and the viewer's Edit calls a handler that clears the viewer then calls the existing `openItemForm(item)` (`:98-102`), so it lands on the precise same edit screen as the contextual menu Edit. Rationale: single `formItem` source of truth keeps open/close logic trivially correct.

## Risks / Trade-offs

- [Rendering raw content HTML again in a new location] → Mitigation: reuse the `marked` + `DOMPurify` pipeline already validated in `ItemForm`; add an XSS-script test for the viewer.
- [Hardcoded `#e3e3e3` fill in the new icon could look off on other themes] → Mitigation: matches the current icon styling in the other action buttons; trivial to adjust if needed.
- [Adding a fourth panel state increases branching in `CollectionPage`] → Mitigation: handled via the same open/close helpers that already clear sibling state.

## Migration Plan

Frontend-only change; no data or contract migration. Rollback is reverting `ItemCard.tsx`, `CollectionPage.tsx`, `CollectionList.tsx`, the new `ItemCardViewer.tsx`, CSS, and `AGENTS.md` edits.

## Open Questions

None.