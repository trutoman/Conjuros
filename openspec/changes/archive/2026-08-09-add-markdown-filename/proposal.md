## Why

A `markdown` item stores only its `content`; there is no stable, file-like name for the note. Users cannot give a note a distinct name for reading or later export — the card title is a display label, not a file name — and the markdown "view" and "edit" surfaces have no place to show or set one. Adding an optional `filename` gives each note a file-style identity without touching the collection cards.

## What Changes

- Add an optional `filename` data field to `markdown` items. It SHALL be a plain file name only (no system path), trimmed, non-empty, at most 64 characters, and always ending with the `.md` extension (case-insensitive). For non-markdown items, and for markdown items with none set, `filename` SHALL be `null`.
- The field SHALL be editable in the markdown edition form: a "Filename" input rendered between Title and the Content panes, only when the item kind is `markdown`.
- The field SHALL be visible (read-only) in the "View markdown" panel, shown under the header.
- The field SHALL NOT appear in the collection view / item cards; spell and web-link cards are unaffected.
- Invalid filenames (empty, over 64 characters, containing `/` or `\`, or not ending in `.md`) SHALL be rejected with validation errors; the form SHALL show a friendly message rather than raw library text.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `collection-management`: markdown items gain an optional `filename` field enforced by the API contract (create, update, read, cross-kind guards), the markdown form adds a Filename input between Title and the Content panes, and form validation gains a friendly filename message.
- `markdown-item-viewer`: the reader shows the item's `filename`, when present, under its header.

## Impact

- `packages/contracts/src/items.ts` — add optional `filename` to `markdownInputSchema`, `collectionItemUpdateSchema` (with a cross-kind guard), and a nullable `filename` to `collectionItemSchema`.
- `src/api/services/items.service.ts` — carry `filename` through create/update candidate and replace payload (`content` chain at `items.service.ts:52-69`).
- `src/api/repositories/items.repository.ts` — store markdown `filename` on the in-memory and Mongo create paths; map missing DB `filename` to `null` in `normalizeRead` (`items.repository.ts:161-169`).
- `src/web/components/ItemForm.tsx` — render a "Filename" input for the markdown kind and include it in the submit payload (`payload` at `ItemForm.tsx:152-174`).
- `src/web/lib/itemForm.ts` — filename rule + friendly message in `messageForInputError`.
- `src/web/components/ItemCardViewer.tsx` — show the filename under the header.
- `src/web/components/ItemCard.tsx` — unchanged (filename never shown on cards).
- Tests and fixtures: `src/tests/shared/validation.test.ts`, `src/tests/api/items.test.ts`, `src/web/components/__tests__/itemCard.fixtures.ts`, `ItemForm.test.tsx`, `ItemCardViewer.test.tsx`, `CollectionPage.test.tsx`, `src/web/lib/__tests__/itemForm.test.ts` — add `filename: null` to typed `CollectionItem` literals and new filename cases.
- No DB migration required: repository read normalization maps missing documents; a backfill script is optional data hygiene.