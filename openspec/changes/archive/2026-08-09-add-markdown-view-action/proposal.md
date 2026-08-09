## Why

Markdown item cards are the only item kind without a dedicated action affordance: users can only copy a spell's command or open a web-link from the card, while markdown cards require opening the contextual menu to do anything. Since the card stores the full note but only shows a one-line slug, users have no quick way to read the rendered note.

## What Changes

- Add a "View markdown" action button to `markdown` item cards, shown in the card's item-actions row exactly like the spell "Copy command" and web-link "Open link" buttons, with an eye icon as its glyph.
- The button opens a read-only markdown viewer panel in the collection item area (replacing the collection list inside `.main-content-frame`), mirroring how Add/Edit item and Manage tags panels open.
- The viewer SHALL be titled "View markdown", followed by the item's title, and SHALL render the item's `content` as HTML using `marked` and sanitized with DOMPurify.
- The viewer SHALL offer a close (✕) button that returns to the collection view and an Edit button that opens the same item form used by the contextual menu's Edit action.
- Markdown cards SHALL still not offer the spell "Copy command" or web-link "Open link" actions.

## Capabilities

### New Capabilities
- `markdown-item-viewer`: a read-only panel that renders a markdown item's stored `content` with `marked`/DOMPurify, titled "View markdown" plus the item title, with a close action back to the collection and an Edit action opening the item form.

### Modified Capabilities
- `item-card-experience`: markdown item cards gain a "View markdown" action button with an eye icon in the item-actions row; the requirement that markdown cards offer no kind-specific actions is amended accordingly (spell/web-link actions stay absent).

## Impact

- `src/web/components/ItemCard.tsx` — render a "View markdown" action button for `markdown` items in the item-actions row (ItemCard.tsx:311-343).
- `src/web/components/ItemCardViewer.tsx` — new viewer panel component (header with close button + "View markdown" + item title, Edit button, sanitized rendered content).
- `src/web/pages/CollectionPage.tsx` — new `viewItem` state so the viewer opens/closes inside `.main-content-frame` mutually exclusively with the form and manage-tags panels.
- `src/web/components/CollectionList.tsx` — forward an `onView` item handler, mirroring `onEdit`.
- `src/web/index.css` — viewer styles; reuse `.item-form`/`.content-pane-preview` patterns where possible.
- `src/web/components/__tests__/ItemCard.test.tsx`, `src/web/pages/__tests__/CollectionPage.test.tsx`, new `src/web/components/__tests__/ItemCardViewer.test.tsx` — cover the new button, panel open/close/Edit behavior, and sanitized rendering.
- `AGENTS.md` — update the frontend rule that markdown cards "offer no kind-specific actions".
- No API or `packages/contracts` changes; `content` stays stored unchanged.