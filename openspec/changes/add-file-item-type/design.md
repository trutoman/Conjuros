## Context

Conjuros stores items of kinds `spell`, `web-link`, and `markdown` (see AGENTS.md). The `markdown` kind established the pattern the new `file` kind reuses: a `content` field holding body text, an optional/clearable `filename`, kind-specific form fields, a card with a type badge and actions, and a read-only viewer. Motivation is in proposal.md. `file` differs from `markdown` in exactly three specified ways: filename rules (max 128 characters and no required extension), the form content field (a single plain "Content" textarea with no Markdown editor behavior, no split panes, no preview, and no autosaved draft), and rendering (plain text, never parsed as Markdown, with the provided file icon).

The storage model is already kind-generic: `collectionItemSchema` exposes nullable `content` and `filename` for every item, and both repositories (`InMemoryItemsRepository`, `MongoItemsRepository`) persist those fields (nulling `command`/`url`) and search over `content`. Most persistence code needs no change beyond extending the kind switch in `create`.

## Goals / Non-Goals

**Goals:**
- Introduce `file` end-to-end: contracts → API service → repositories → frontend forms, cards, viewer, and collection filter.
- Keep the API wire format backward compatible: `content`/`filename` remain the shared nullable response fields; only the `kind` enumeration grows.
- Mirror the established `markdown` behaviors (cross-kind guards, required filename on create, clearable filename on update, search over content) except the specified intentional differences.

**Non-Goals:**
- No Markdown parsing or rendering of `file` content anywhere (form or viewer).
- No new libraries, no new database fields, no data migration.
- No changes to `markdown` item behavior.
- No local draft autosave for the `file` form.

## Decisions

### D1 — Contracts: add `file` to the kind enum and a file filename schema

In `packages/contracts/src/items.ts`:
- `itemKinds` becomes `['spell', 'web-link', 'markdown', 'file']`; `ItemKind` and all derived schemas follow automatically.
- Add `fileFilenameSchema`: trimmed, `max(128)`, `regex(/^[^/\\]+$/)`, with NO `.md` constraint (differs from `markdownFilenameSchema`, which is `max(64)` + `.md`).
- Add `fileFilenameUpdateSchema` mirroring `markdownFilenameUpdateSchema`: `z.preprocess(trim, z.union([fileFilenameSchema, z.literal('')]))` so a blank clears the filename.
- Add `fileInputSchema` `{ kind: 'file', ...commonItemFields, filename: fileFilenameSchema, content: z.string().trim().min(1) }`, `.strict()`, and add it to `collectionItemInputSchema`'s discriminated union.
- Add `fileUpdateCandidateSchema` mirroring `markdownUpdateCandidateSchema`, using `fileFilenameUpdateSchema` for `filename`.
- `collectionItemSchema` stays unchanged: nullable `content`/`filename` already exist; the enum just grows.

Rationale: mirrors the working `markdownInputSchema`/candidate pattern so every layer handles both text kinds symmetrically. Alternative rejected: a dedicated `file`-only field, which would duplicate `content` and break the shared read model.

### D2 — Update schema: kind-tolerant top-level filename, strict per-kind candidate

`collectionItemUpdateSchema` today validates `filename` through `markdownFilenameUpdateSchema` (max 64, `.md`) at the top level, and the service re-validates the merged candidate per kind. A `file` update must be able to carry a filename that violates markdown's rules, so make the top-level `filename` accept any valid plain-name OR markdown name:

- Change `collectionItemUpdateSchema.filename` to a union that accepts a valid markdown filename, a valid file filename, or the empty string (e.g. `z.union([markdownFilenameUpdateSchema, fileFilenameSchema, z.literal('')])`), so a `file` update can carry a name that violates markdown's `.md` rule.
- Keep the cross-kind guard in the same schema: `kind === 'file'` rejects `command` and `url` (mirrors `markdown`).
- The service's per-kind candidate schema still enforces the exact rules: a name valid only for `file` is rejected when the candidate kind is `markdown`, and a name valid only for `markdown` is rejected when the candidate kind is `file`.

Rationale: one top-level update schema remains, while precise per-kind validation stays where it already lives. Markdown filename rejections still surface as 400s (now from the candidate parse); tests keep the observable behavior.

### D3 — Service: branch by kind like markdown

In `src/api/services/items.service.ts`, `update()` currently branches `kind === 'markdown'` → `markdownUpdateCandidateSchema` else `collectionItemInputSchema`:
- Extend the branch: `file` → `fileUpdateCandidateSchema` with `filename: update.filename ?? current.filename ?? ''`.
- In the `repository.replace({ ... })` mapping, use `const textLike = kind === 'markdown' || kind === 'file'` to set `content: textLike ? candidate.content : null` and `filename: textLike ? candidate.filename || null : null`.
- `parseCreate`/`parseUpdate` need no change (they already use the top-level schemas).

### D4 — Repositories: extend the create kind mapping only

In both `InMemoryItemsRepository` and `MongoItemsRepository`, `create` currently sets `content`/`filename` when `kind === 'markdown'`; change the condition to `kind === 'markdown' || kind === 'file'` (and leave the `command`/`url` conditions as-is, so file items null both). `list` filters and `MongoItemsRepository.normalizeRead` already include `content`/`filename` and stay unchanged. Client-side and Mongo `search` already match `item.content`.

### D5 — Form: a single plain "Content" textarea for file

In `src/web/components/ItemForm.tsx`:
- Introduce `textKind = kind === 'markdown' || kind === 'file'`:
  - Payload: for `textKind` omit `description` and send `{ content, filename }` (the existing branch already does this for content; extend to `file`).
  - Render the Filename input when `textKind`.
  - Filename input bound to the shared `filename` state (already present).
  - Content editing: keep the Markdown split panes only for `kind === 'markdown'` (preview, `marked`/DOMPurify, height-sync, draft load/save, `handleEditorKeyDown`). For `file` render a single `FormField` labeled "Content" with a plain `<textarea value={content} onChange={...}/>` — no panes, no editor key handling, no draft autosave, no layout-height effects.
  - Keep the existing `error` plumbing (`FormField error={error}`) for `file`, mirroring the non-markdown branch.
- `src/web/lib/itemForm.ts` `messageForInputError`: add a `file` branch —
  - content empty/whitespace → `Content is required for a file`,
  - on create, missing filename → `Filename is required for a file`,
  - invalid filename (non-empty but > 128 chars or containing `/` or `\`) → `Filename must be a name of at most 128 characters with no path separators`,
  - otherwise generic on failure.
  Add a small `isValidFileFilename` helper; keep `isValidFilename` (markdown) untouched.
- `src/web/components/ItemTypeSelector.tsx`: add a `File` radio option (the schema allows any `ItemKind`, so it becomes user-selectable).

### D6 — Card: file badge/icon, plain slug, View + Download actions

In `src/web/components/ItemCard.tsx`:
- Add a `file` branch to the type badge: `<svg viewBox="0 -960 960 960">` with the provided file icon path (`M200-200h560v-367L567-760H200v560Zm0 80q-33 0-56.5-23.5…`), `title`/`aria-label` "File".
- `kindLabel`: `'file'` → `'File'`.
- Inline content: for `file`, use a plain first-line slug (D7) instead of the Markdown stripper so literal text (e.g. `# notes`) is not altered.
- Add actions:
  - `View file` (eye icon) when `item.kind === 'file'`, calling `onView?.(item)`.
  - `Download file` (download icon → `downloadTextFile(item)`) when `item.kind === 'file'`, rendered between View and the Item menu, matching markdown's placement/styling.
- `Copy command` and `Open link` remain exclusive to spell / web-link.

### D7 — Slugs: plain-text slug for file cards

In `src/web/lib/itemCardSlug.ts` add `plainTextSlug(content)`: take the first non-empty line, collapse whitespace to a single space, no Markdown-marker stripping. `markdownSlug` stays untouched. Add unit tests (alongside `itemCardSlug.test.ts`).

### D8 — Download helper: plain text, no forced extension

Add `src/web/lib/downloadFile.ts`:
- `suggestedFileName(item)`: return `item.filename` if set; otherwise a title-derived slug (lowercased, spaces → `-`, empty → `"file"`) with NO extension appended (differs from the markdown helper, which appends `.md`).
- `downloadTextFile(item)`: create a `Blob([content], { type: 'text/plain;charset=utf-8' })` and trigger the same anchor click flow used in `downloadMarkdown.ts`.
- Leave `downloadMarkdown.ts` unchanged for `markdown`.

### D9 — Viewer: generalize `ItemCardViewer` to both text kinds

Keep the single panel wiring in `CollectionPage` (openViewer / closeViewer / Edit). Modify `src/web/components/ItemCardViewer.tsx` to branch on `item.kind`:
- `markdown`: existing behavior (marked + DOMPurify, heading "View markdown").
- `file`: heading "View file", show the optional `filename` (existing block is generic), and render the content as a `<pre>` with `{item.content}` as a React text node (React escapes it, so no script can execute and no Markdown parsing occurs). Provide the same close (✕) and Edit buttons.

### D10 — Collection filter and CSS

- `src/web/pages/CollectionPage.tsx` "Type" dropdown: add `<option value="file">Files</option>`. Client-side search already includes `item.content`, so no change there.
- `src/web/index.css`: add a `--file` accent and `.kind-file` badge rules (mirroring the `.kind-markdown` treatment), plus minimal styles for the file viewer `<pre>` block.

## Risks / Trade-offs

- [Top-level update schema accepts more filenames than before for the shared `filename` field] → The service re-validates every update against the per-kind candidate schema before persisting; API tests cover per-kind filename rejection on create and update. Existing markdown update tests still pass because the final (candidate) validation is unchanged.
- [The file inline slug is plain text with no marker stripping] → intentional, so literal content isn't altered; adds a dedicated `plainTextSlug` and its own unit tests to keep the difference explicit and predictable.
- [Text shown in the file viewer relies on React text nodes for safety] → text nodes cannot execute scripts, so no DOMPurify pass is needed for `file`; the markdown viewer keeps its sanitized approach.
- Migration: none.

## Migration Plan

No data migration. `kind` is an extensible enum, `content`/`filename` are already nullable on every stored item, and `MongoItemsRepository.normalizeRead` null-coerces missing fields. Existing documents load unchanged; existing `markdown` items behave exactly as before. Rollback is a code revert with no stored-state impact.

## Open Questions

None — the spec fixes the low filename limit, the plain-content form, the icon, and the viewer behavior; the design decisions above follow the established `markdown` architecture.