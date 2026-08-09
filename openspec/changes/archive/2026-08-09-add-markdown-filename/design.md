## Context

See proposal.md — Why. Markdown items currently store only `title`, `description`(none), `tags`, and `content`. The read model already has three nullable kind fields (`command`, `url`, `content`), so a fourth nullable, kind-gated field follows the established flat pattern. The API flow for kind-specific fields is already fully wired: discriminated input union, update `superRefine` cross-checks, service kind mapping, repository create + read normalization, and the frontend form/viewer surfaces.

## Goals / Non-Goals

**Goals:**
- Give `markdown` items an optional `filename` — a file-style name (no path) ending in `.md` — that is editable in the edit form and visible in the "View markdown" reader.
- Keep `filename` kind-gated: it only ever applies to `markdown`; `spell`/`web-link` items always return `null` and reject submissions carrying a `filename`.
- Report a friendly validation message for an invalid filename instead of raw library text, consistent with the existing friendly-validation requirement.

**Non-Goals:**
- No file creation, download, export, or render of an actual `.md` file.
- No new search dimension: `filename` is not added to the searchable text.
- No change to the collection card (`ItemCard`) — cards never show the filename.
- No new indexes; the field reuses the existing document shape.

## Decisions

- **`filename` as a fourth nullable, kind-gated field.** `collectionItemSchema` gains `filename: z.string().nullable()`. Both repositories write `null` for non-markdown kinds and normalize missing DB values to `null` on read, exactly mirroring `command`/`url`/`content`.
  - *Alternative rejected*: nesting it inside a markdown-specific object — departs from the flat read model and would ripple through every consumer for no gain.
- **Input rule: optional, trimmed, max 64, no path separators, always `.md`.** `markdownFilenameSchema = z.string().trim().max(64).regex(/^[^/\\]+$/).regex(/\.md$/i)` — the first regex also guarantees non-empty. On **create**, `filename` is `optionalMarkdownFilenameSchema` (a `preprocess` mapping a trimmed-empty value to "not provided" → `undefined`, so it never stores `""`). On **update**, `markdownFilenameUpdateSchema` (a `preprocess` that trims but keeps the empty string) distinguishes an explicit `""` (clear sentinel) from an omitted key; `collectionItemUpdateSchema` therefore carries `filename: markdownFilenameUpdateSchema.optional()` plus two `superRefine` guards rejecting `filename` when `kind` is `spell` or `web-link`, mirroring the `command`/`url`/`content` cross-checks.
- **Empty filename means no filename.** The service resolves `filename` for markdown as `update.filename ?? current.filename ?? undefined`; an empty string from an explicit clear flows through the create-input preprocess to `undefined`, so the repository always stores `null` for items without a filename. Omitting `filename` on an update never clears the field.
- **Friendly validation in `messageForInputError`.** Add `MESSAGES.filenameInvalid = 'Filename must be a name of at most 64 characters ending in .md, with no path separators'`. In the `markdown` branch, when the payload has a non-empty `filename` and validation failed on the `filename` path (checked via `result.error.issues`), return the friendly message; the existing `title` → `content` → generic order is preserved (filename checked between title and content).
- **Viewer shows the filename only when present.** `ItemCardViewer` header shows a one-line "Filename" label + `filename` only when the item has one; no placeholder when `null`. The `"View markdown"` panel already renders `title` from the item, so adding the field there is a small read-only addition.
- **No migration, mirroring the `content` precedent.** Mongo read normalization (`filename: doc.filename ?? null`) prevents pre-existing documents from failing the nullable read model; a one-off idempotent backfill script is optional data hygiene and is omitted unless a similar script is added later.

## Risks / Trade-offs

- [Read model grows a fourth nullable field] → Acceptable; matches the established convention and stays backward compatible.
- [Pre-existing Mongo documents lack `filename`] → Mitigated by read normalization in `MongoItemsRepository` (`filename: doc.filename ?? null`), which never depends on the stored shape.
- [User sends `filename` on a `spell`/`web-link` update] → The `superRefine` guards and the per-kind input schemas reject it before it reaches the service.
- [Empty `filename` semantics ambiguity] → Trimmed empty is normalized to `null` at preprocess time, so create and update behave the same and the API never stores `""`.

## Migration Plan

No migration required for correctness: `MongoItemsRepository` normalizes `filename: doc.filename ?? null` so legacy documents satisfy the nullable read model. No backfill script is added in this change (data hygiene concern only, and the normalization makes it strictly optional and repeatable).