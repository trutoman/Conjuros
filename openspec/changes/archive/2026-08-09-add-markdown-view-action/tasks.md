## 1. CollectionPage panel wiring

- [x] 1.1 Add `viewerItem: CollectionItem | null | undefined` panel state in `src/web/pages/CollectionPage.tsx` alongside `formItem`/`manageTags`
- [x] 1.2 Add `openViewer(item)` and `closeViewer()` helpers mirroring `openItemForm`/`closeManageTags`, clearing sibling panel state when opening
- [x] 1.3 Render a new mutually-exclusive branch in `.main-content-frame` that shows `<ItemCardViewer>` when `viewerItem !== undefined`, before the form/manage-tags branches
- [x] 1.4 Open the viewer on the item's "View markdown" action (via a handler passed down to the cards) and close it on viewer close
- [x] 1.5 Wire the viewer's Edit to clear the viewer and call the existing `openItemForm(item)` so it opens the same edit form as the contextual menu

## 2. ItemCard "View markdown" action button

- [x] 2.1 Add `onView?(item)` prop to `ItemCard.tsx` and forward it through `CollectionList.tsx` (mirroring `onEdit`)
- [x] 2.2 Render, for `item.kind === 'markdown'`, an `icon-action` button in `.item-actions` with `aria-label="View markdown"` using the provided eye icon SVG (fill `#e3e3e3`), placed before `.item-menu-wrapper` exactly like the spell/web-link buttons
- [x] 2.3 Keep spell and web-link cards free of the new button; keep markdown cards free of "Copy command"/"Open link"/"Copy content"

## 3. ItemCardViewer component

- [x] 3.1 Create `src/web/components/ItemCardViewer.tsx` with props `{ item, onClose, onEdit }`
- [x] 3.2 Render a `.item-form`-style header with a `.form-close` ✕ button (`aria-label="Close markdown viewer"`), an `h2` showing "View markdown", and the item's `title` after it
- [x] 3.3 Render the full `content` with `DOMPurify.sanitize(marked.parse(item.content ?? '') as string)` into a `.content-pane-preview`-style container via `dangerouslySetInnerHTML`
- [x] 3.4 Add an "Edit" button (`onClick={onEdit}`) that opens the item edit form for the same item, styled with the default primary button look (not the muted `quiet` style)
- [x] 3.5 Add viewer styling to `src/web/index.css`, reusing `.item-form`/`.form-close`/`.content-pane-preview` styles where possible

## 4. Tests

- [x] 4.1 Update `src/web/components/__tests__/ItemCard.test.tsx` "shows only the menu button" markdown case to assert a "View markdown" button (eye icon) now appears and clicking it invokes `onView` with the item
- [x] 4.2 Assert spell/web-link cards never show "View markdown", and markdown cards still omit "Copy command"/"Open link"/"Copy content"
- [x] 4.3 Add `src/web/components/__tests__/ItemCardViewer.test.tsx`: header shows "View markdown" + item title; content renders markdown; `<script>` content is sanitized; close button calls `onClose`; Edit button calls `onEdit`
- [x] 4.4 Update `src/web/pages/__tests__/CollectionPage.test.tsx`: the markdown "no kind-specific actions" assertion now expects "View markdown"; add cases for opening the viewer from a markdown card, the viewer replacing the list, closing back to the list, and Edit opening the edit form
- [x] 4.5 Check mutual exclusion: opening the viewer closes any open item form / manage-tags state

## 5. Docs and validation

- [x] 5.1 Update the `AGENTS.md` frontend rule so markdown cards offer a "View markdown" action instead of "no kind-specific actions"
- [x] 5.2 Run `npm run lint`
- [x] 5.3 Run `npm run test` and ensure all tests pass
- [x] 5.4 Run `npm run build`