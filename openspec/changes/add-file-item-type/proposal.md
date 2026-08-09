## Why

The collection supports `spell`, `web-link`, and `markdown` items. Users need to store plain-text documents whose file name and format are entirely their own choice (no fixed `.md` extension), while keeping the same read, download, view, and edit workflow that `markdown` items already enjoy. Introducing a `file` item kind gives users a general-purpose text container with a user-chosen file name.

## What Changes

- Add a fourth item kind, `file`, identified by the string `file`.
- A `file` item mirrors `markdown`: it stores its body in the `content` field (extensive, plain text, no markdown interpretation) and carries an optional `filename`.
- Same action buttons as `markdown` items: a "View" action that opens a read-only viewer, and a "Download" action that saves the content as a text file. Also the same form structure (title, optional Filename, content, tags, no Description).
- Explicit differences from `markdown`:
  - `filename` is a plain file name of at most 128 characters (markdown: 64) and MAY NOT require any specific extension (unlike markdown's mandatory `.md`).
  - The Add/Edit content field is a single plain textarea labeled "Content" — no "Content - Edit"/"Content - View" split panes, and no live preview.
  - The content textarea is the standard, unadorned textarea: no Tab indentation, no list/quote continuation on Enter, no auto-closing pairs, and no local draft autosave.
  - Cards and forms represent `file` items with a dedicated file icon (a document page glyph).
- No Markdown rendering is performed for `file` content anywhere: the viewer shows the content as plain preformatted text.

## Capabilities

### New Capabilities
- `file-item-viewer`: A read-only "View file" panel inside the collection item area that shows a `file` item's full `content` as sanitized plain text, shows its optional `filename`, and opens the item edit form.

### Modified Capabilities
- `collection-management`: Items can be of kind `file`, storing `content` and a `filename` whose rules (max 128 characters, no required extension) differ from `markdown`; the collection "Type" filter gains a `File` option; search covers `file` `content`; the item form renders a single "Content" textarea for `file` and friendly validation messages for the new kind.
- `item-card-experience`: Item cards render `file` items with a `file` badge and the provided file icon, show a single-line slug of the content, and offer "View file" and "Download file" action buttons (no report spell "Copy command" or web-link "Open link" actions).

## Impact

- `packages/contracts/src/items.ts`: add `'file'` to `itemKinds`; add `fileFilenameSchema` (trimmed, ≤ 128 chars, no path separators, no extension rule) and `fileFilenameUpdateSchema`; add `fileInputSchema` (kind `file`, `content`, `filename`); extend `collectionItemInputSchema`, `collectionItemUpdateSchema` (+ cross-kind guard: `file` rejects `command`/`url`), and `collectionItemSchema` (`content`/`filename` already nullable and shared).
- `src/api/services/items.service.ts`: extend the kind-specific update mapping so `file` resolves `content` and `filename` like `markdown` but with the file filename schema.
- `src/api/repositories/items.repository.ts`: extend the `create` persistence mapping so a `file` kind persists `content` and `filename` (and nulls `command`/`url`) in both `InMemoryItemsRepository` and `MongoItemsRepository`. Search over `content` and read normalization already cover the field and need no change.
- `src/web/components/ItemTypeSelector.tsx`: add a `File` radio option.
- `src/web/components/ItemForm.tsx`: branch `file` to a Filename input plus a single plain "Content" textarea (no panes, no preview, no draft, no editor key handling); no Description field for `file`.
- `src/web/components/ItemCard.tsx`: add a `file` badge with the provided file icon, single-line content slug, and "File" type label.
- `src/web/components/ItemCardViewer.tsx`: support `file` items with a plain-text read-only view (sanitized) titled "View file", showing `content` and optional `filename`, with an Edit action.
- `src/web/lib/itemForm.ts`: add `file` friendly validation messages (content required; filename required on create; filename ≤ 128 chars, no path separators).
- `src/web/lib/downloadMarkdown.ts` (or a new download helper): add a generic plain-text file download for `file` items — MIME `text/plain`, suggested name from `filename` or a title-derived slug without an `.md` suffix.
- `src/web/pages/CollectionPage.tsx`: add a `File` option to the "Type" filter dropdown.
- `src/web/index.css`: add `.kind-file` badge styling and any viewer variants.
- Tests: contract tests for `file` schemas, API items tests (create/read/update/delete, filename rules), and frontend fixtures/tests for the badge, actions, viewer, filter, and form.