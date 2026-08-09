## Approach

Two independent workstreams shipped as one change:

1. **Required `filename` on create** — flip `markdownInputSchema.filename` to the existing `markdownFilenameSchema` (required) and keep every other filename rule unchanged. Because `items.service.update()` currently rebuilds its candidate through `collectionItemInputSchema`, and the item form routes both create and edit through that same schema, both places must stop demanding a filename when one may legitimately be absent (edit clears, legacy items have `null`). The decoupling is small: a dedicated update-candidate schema and a create/edit split in the form's submit validation.
2. **Download action on markdown cards** — a client-only download, no API change. `ItemCard` already receives the full item (including `content` and `filename`), so clicking builds a Blob of the stored content and triggers a standard browser file-save flow. No viewer, no navigation.

## Decisions

- **Create is required; update may clear.** `markdownInputSchema.filename = markdownFilenameSchema` (trimmed, ≤64 chars, no `/` or `\`, `.md` case-insensitive). An explicit `''` on update stays the clear sentinel (stored as `null`); legacy items keep a `null` filename and stay editable. Read model unchanged (`filename: z.string().nullable()`).
- **`messageForInputError` order.** Existing markdown branch checks the invalid-filename rule before the empty-content rule; add the required-filename rule *after* the content check so the existing "Content is required for a markdown note" test (blank filename + blank content) keeps its message. The new message fires only when content is valid but the filename is blank on create.
- **Create/edit split in the form.** `ItemForm.submit` parses with `collectionItemInputSchema` when `item` is undefined and `collectionItemUpdateSchema` otherwise, so edit submits `filename: ""` and the API clears it (this also fixes a latent gap where the UI could never clear a filename). `messageForInputError(payload, result, isCreate)` skips the required-filename rule on edit.
- **Download fallback name.** `item.filename` when present, else `title.toLowerCase().replace(/\s+/g, '-') + '.md'`; an empty slug falls back to `note.md`. Satisfies "a priori se utilizara el nombre que tiene el elemento" while keeping legacy/cleared items downloadable.
- **Icon.** Reuse the exact `path d` (arrow-into-tray download glyph) from the SVG pasted in the propose message, with `viewBox="0 -960 960 960"` and `filled`, consistent with the other `ItemCard` icons.
- **No `## Summary` leftovers.** `item-card-experience/spec.md` was already renamed `## Purpose` (OpenSpec 1.7.0 requirement); noted as a docs-only change so validation stays green.

## Constraints

- **Browser cannot force the OS save dialog.** Web pages trigger the browser's own save flow via an anchor download; whether the browser opens a "Save As" dialog or auto-downloads is browser/settings-dependent. The spec therefore says "triggers the browser's standard file-save flow", not "opens the OS dialog programmatically".
- **Shared create schema must not reject update candidates.** Do not add filename requirements to `collectionItemUpdateSchema`; only `markdownInputSchema` (create) becomes required.

## Key Changes

### Contracts (`packages/contracts/src/items.ts`)

- `markdownInputSchema.filename`: `optionalMarkdownFilenameSchema` → `markdownFilenameSchema`.
- Remove `optionalMarkdownFilenameSchema` (no remaining uses).
- Add `markdownUpdateCandidateSchema = markdownInputSchema.omit({ filename: true }).extend({ filename: markdownFilenameUpdateSchema })` (accepts a valid name or the `''` clear sentinel).
- `collectionItemUpdateSchema` and `collectionItemSchema` unchanged.

### API service (`src/api/services/items.service.ts`)

- `update()` builds the markdown candidate with `filename: update.filename ?? current.filename ?? ''` and parses it with `markdownUpdateCandidateSchema` (spell/web-link branches keep using `collectionItemInputSchema`).
- Store `filename: candidate.kind === 'markdown' ? candidate.filename || null : null` (unchanged storage rule; `''` → `null`).

### Form validation (`src/web/lib/itemForm.ts`)

- Add `MESSAGES.filenameRequired = 'Filename is required for a markdown note'`.
- `messageForInputError(payload, result, isCreate = true)`:
  - markdown branch order: (1) empty/whitespace content → contentRequired; (2) if `isCreate` and filename blank → filenameRequired; (3) non-empty invalid filename → filenameInvalid; (4) result.success ? null : generic.

### Item form (`src/web/components/ItemForm.tsx`)

- `submit()`: `const result = item ? collectionItemUpdateSchema.safeParse(payload) : collectionItemInputSchema.safeParse(payload);` and `messageForInputError(payload, result, item === undefined)`.
- `onSubmit` prop type → `CollectionItemInput | CollectionItemUpdate`; `CollectionPage.save` accepts the same union and passes it to `update`/`create` unchanged.

### Download helper (`src/web/lib/downloadMarkdown.ts`, new)

```ts
export function suggestedMarkdownFileName(item: { filename?: string | null; title: string }): string
// filename ?? slugify(title) + '.md', empty slug -> 'note.md'

export function downloadMarkdownFile(item: { content?: string | null } & Parameters<typeof suggestedMarkdownFileName>[0]): void
// Blob([content ?? ''], { type: 'text/markdown;charset=utf-8' }) -> object URL ->
// temporary <a download=suggestedMarkdownFileName(item)> -> click -> remove -> revokeObjectURL
```

### Item card (`src/web/components/ItemCard.tsx`)

- Inside the existing `{item.kind === 'markdown' && (…)}` fragment, after the "View markdown" button (line ~361) and before `item-menu-wrapper`:
  `<button type="button" className="icon-action" aria-label="Download markdown" onClick={() => downloadMarkdownFile(item)}>` with the download `Icon`.
- Only renders for `markdown`; spell/web-link cards unchanged.

## Testing

- **Contract** (`src/tests/shared/validation.test.ts`): update existing create-parses to include `filename`; replace "normalizes an empty markdown filename to 'not provided'" with a rejection assertion; add `markdownUpdateCandidateSchema` set/clear checks.
- **API** (`src/tests/api/items.test.ts`): the create-without-filename POSTs (lines ~145 and ~229) assert `400` (or add a filename); keep the existing update rename/clear/guard assertions; add a create-with-filename success assert.
- **Form** (`ItemForm.test.tsx`): new "reports a missing filename" (blank filename, valid content → message, not submitted); new "edit clears the filename" (submit `''` → onSubmit with filename `''`); existing "no content" test unchanged.
- **Helper** (`downloadMarkdown.ts`): unit-test the suggested name (filename wins; slug fallback; empty slug → `note.md`).
- **Card** (`ItemCard.test.tsx`): "Download markdown" button present on markdown cards and ordered after "View markdown"/before the menu trigger; absent on spell/web-link; clicking calls `downloadMarkdownFile` (mock `URL.createObjectURL`/`revokeObjectURL` and `HTMLAnchorElement.prototype.click`).

## Migration

- None: `filename` stays nullable in storage and reads; existing documents are unaffected. The only API behavior change is that new markdown creates without a `filename` are rejected with 400 (documented in the spec's BREAKING note).