## Why

Markdown notes currently treat `filename` as optional, so notes can exist without a real file name; users then can't rely on a stable name when reading or exporting a note. Requiring a filename at creation gives every new note a usable file name, and a dedicated download action lets users save the note as a `.md` file straight from the collection card.

## What Changes

- **BREAKING (create contract):** a new `markdown` item SHALL include a `filename` (same rules as today: trimmed, non-empty, at most 64 characters, no path separators, ends in `.md`, case-insensitive). Create requests for `markdown` without a `filename` are rejected. Updates keep today's behavior: `filename` can be changed or cleared; read model stays nullable for legacy items.
- The markdown form SHALL require the Filename input on create (friendly message when blank), while still allowing edits that clear it.
- A new **Download markdown** icon action appears on `markdown` item cards only, in the `item-actions` row **between** the existing "View markdown" button and the "Item menu" (three-dots) trigger. It uses the download icon glyph supplied by the product.
- Clicking it SHALL trigger the browser's regular file-save flow for the item's stored `content` as a UTF-8 Markdown (`text/markdown`) file, suggesting the item's `filename` as the default name; when the item has no `filename`, the suggested name falls back to a title-derived name ending in `.md`.
- No new API endpoint: the viewer/editor reuse the already-loaded item; the download is purely a client-side Blob + anchor navigation.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `collection-management`: the "Markdown items carry an optional filename" requirement becomes "Markdown items require a filename on creation" (required create input; updates may change or clear); "Item form shows friendly field validation messages" gains a required-filename message.
- `item-card-experience`: a new requirement adds the DownloadMarkdown action button to markdown cards between View and the menu trigger, with the download/save behavior and suggested-name rules.

## Impact

- `packages/contracts/src/items.ts` — `markdownInputSchema.filename` becomes `markdownFilenameSchema` (required) on create; drop the now-unused `optionalMarkdownFilenameSchema`. `collectionItemUpdateSchema` keeps the clearable `markdownFilenameUpdateSchema`; `collectionItemSchema` stays nullable. Add `markdownUpdateCandidateSchema` (`markdownInputSchema.omit({ filename: true }).extend({ filename: markdownFilenameUpdateSchema })`) so the update path can still represent a cleared/legacy `null` filename.
- `src/api/services/items.service.ts` — `update()` must no longer rebuild markdown candidates through `collectionItemInputSchema` (which would reject cleared/legacy filenames); it resolves `update.filename ?? current.filename ?? ''` and parses via `markdownUpdateCandidateSchema`, storing `candidate.filename || null`. Spell/web-link candidate paths unchanged.
- `src/web/lib/itemForm.ts` — add `MESSAGES.filenameRequired` ("Filename is required for a markdown note"); the markdown branch reports it on create when the filename is blank (after the existing content check, before the invalid-filename check), but skips it on edit so clearing stays allowed.
- `src/web/components/ItemForm.tsx` — parse with `collectionItemInputSchema` when creating and `collectionItemUpdateSchema` when editing (`item` present), so create requires the filename while edit may clear it (submits `filename: ""`); `messageForInputError` receives an `isCreate` flag; `onSubmit`/`save` types widen to `CollectionItemInput | CollectionItemUpdate`.
- `src/web/components/ItemCard.tsx` — render the DownloadMarkdown icon-action for `markdown`, placed between the View button and the menu trigger.
- `src/web/lib/downloadMarkdown.ts` (new) — tiny helper: blob of `content` (MIME `text/markdown;charset=utf-8`), object URL, temporary `<a download="name.md">`, click, revoke; pure function for tests.
- Tests: contract (create without filename rejected; invalid still rejected; update set/clear keeps working), API (`POST /api/items` markdown without `filename` → 400; with → stored), frontend (`ItemCard` shows the button position, click calls the download with the right suggested name; `messageForInputError` returns the required-filename message on create but not on edit), existing tests that create markdown without a filename updated to include one (or to assert the 400).
- No DB migration: read normalization already maps missing `filename` to `null`; existing seed data remains readable.