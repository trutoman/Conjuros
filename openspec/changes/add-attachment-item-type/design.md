## Context

The item model already supports four kinds through one table, one discriminated contract union, one collection page, and one shared card/viewer surface. Themes store a color and icon artwork per item kind. The attachment kind reuses those patterns but is the first kind whose file content is not text: it needs a storage reference field that stays empty until Supabase Storage is implemented. Requirements are in `specs/*/spec.md`; motivation is in `proposal.md`.

## Goals / Non-Goals

**Goals:**
- Add `attachment` end to end with the smallest viable contract, persistence, and UI surface.
- Reserve a nullable `storagePath` for the future object key without exposing a write path yet.
- Reuse the existing drop-zone look and interaction while avoiding any file read, upload, or storage write.
- Keep existing item kinds and existing theme documents working.

**Non-Goals:**
- No Supabase Storage bucket, client SDK, upload endpoint, signed URL, download, or file-byte persistence.
- No attachment content rendering; `content` remains hidden and null.
- No enforcement that an attachment must have a file while storage is unavailable.
- No changes to existing item kind behavior or ownership rules.

## Decisions

### D1 — Contract shape: `attachment` kind with optional filename and read-only `storagePath`

In `packages/contracts/src/items.ts`:

- Add `'attachment'` to `itemKinds` after `'file'`.
- Add `attachmentInputSchema` with `kind: 'attachment'`, the common fields (title, description, tags, relatedItemIds), and `filename: fileFilenameSchema.optional()`. It accepts no `content`, `command`, `url`, or `storagePath`.
- Add `attachmentUpdateCandidateSchema` mirroring the file candidate: common fields plus `filename: fileFilenameUpdateSchema` so an edit can change or clear the name.
- Add `storagePath: z.string().nullable()` to `collectionItemSchema`. It is a read field only; `collectionItemUpdateSchema` does not accept it.
- Extend the update super-refinement: an attachment rejects `command`, `url`, and `content`; every other kind keeps its current guards.

Rationale: a dedicated read field keeps the future storage key out of the shared `content`/`filename` semantics and prevents clients from setting an internal path. Alternative rejected: storing the path in `content` or `url`, which would overload text and link validation.

### D2 — API and persistence: metadata now, reference null

- `ItemsService.update` gets an `attachment` branch using `attachmentUpdateCandidateSchema`; the repository mapping sets `command`, `url`, and `content` to `null`, sets `filename` from the candidate, and preserves the current `storagePath` (always `null` in this phase).
- Both item repositories set `storagePath: null` on create and include `storage_path` in their row mapping. `CollectionItem` responses therefore always expose `storagePath: null` for every kind until storage exists.
- Search adds `filename` to the in-memory string match and the Postgres `ILIKE` condition. This makes attachments findable by file name and also improves file/markdown filename search.
- The kind/field check gets an attachment branch: `command`, `url`, and `content` are null; `filename` and `storage_path` are unconstrained. All non-attachment branches require `storage_path IS NULL`.

Rationale: the database and API expose the future reference shape without pretending an upload happened. Alternative rejected: storing a fake URL or placeholder path, which would make the UI lie about storage.

### D3 — Two migrations because PostgreSQL cannot use a new enum value in the same transaction

Add two Drizzle migrations:

1. `0005_*`: `ALTER TYPE "public"."item_kind" ADD VALUE 'attachment'`. This migration only adds the label.
2. `0006_*`: add `storage_path text`, drop/recreate `collection_items_kind_fields_check` with the attachment branch, and add the attachment kind color to every theme that lacks it.

Drizzle’s migrator wraps a migration file in a transaction; PostgreSQL allows the enum label to be added inside that transaction but not used until it commits. Splitting the enum addition from the constraint and data updates avoids the “unsafe use of new value” failure. Fresh databases apply 0000→0006; existing databases apply 0005→0006.

The theme data update is:

```sql
UPDATE "themes"
SET "kind_colors" = "kind_colors" || '{"attachment":"#be123c"}'::jsonb
WHERE NOT ("kind_colors" ? 'attachment');
```

Rationale: two small migrations are safer and easier to reason about than a single transactional enum rewrite. Alternative rejected: recreating the enum type, which would rewrite the table and complicate rollback.

### D4 — Attachment drop zone reuses the file surface but never reads the file

Extract the drag/picker/status shell from `FileDropZone` into a shared internal drop-zone component, and add `AttachmentDropZone` with metadata-only behavior. Both render the same `.file-drop-zone` visual surface, icon treatment, status live region, single-file error, and drag-over state. The file wrapper still reads text into `content`; the attachment wrapper only reports `file.name` to the form and never calls `File.text()` or any upload API.

In `ItemForm`:

- Attachment shows Title, Description, optional Filename, the attachment drop area (create only), tags, and actions. It renders no Content field.
- The submit payload for attachment sends `filename` when non-empty on create, and sends `filename` (including an empty value) on edit so it can be cleared. It omits `content`.
- The attachment drop area is hidden when `item !== undefined` and for every other kind.

Rationale: sharing the surface satisfies the requested identical drop area while keeping text-file behavior unchanged. Alternative rejected: making the existing FileDropZone read the body and discard it, which would waste memory on large attachments and blur the two behaviors.

### D5 — Card and viewer present attachment metadata, not content

`ItemCard` adds an `isAttachment` branch: an `Attachment` badge, the `attachment` icon asset, inline filename (or `No file attached`), the description accordion, a `View attachment` eye action, and no copy/open/download actions.

`ItemCardViewer` gains an attachment mode: `View attachment` heading, title, description when present, filename when present, a `No file stored yet` status while `storagePath` is null, no content body, and the same Edit/close controls. `CollectionPage` updates the modal label and keeps opening the viewer for attachment cards.

The supplied 960-grid paperclip path is stored verbatim in `ICON_ASSETS.attachment` with `viewBox: '0 -960 960 960'`. The badge applies an attachment-specific class with a scaled stroke width so the 960-grid path keeps the same visual weight as the 24-grid outline icons; no fill or hardcoded color is introduced.

Rationale: a reference-only item should show what is known (name/description) without implying the file is downloadable. Alternative rejected: a dedicated attachment page, which the modal-based collection does not need.

### D6 — Theme keys: new attachment color and icon, with migration/backfill

- Add `attachment` to `themeKindColorsSchema` and `iconAssetKeys` (twenty-two keys).
- Seed light with `#be123c` and dark with `#fb7185` for `kindColors.attachment`; add `ICON_ASSETS.attachment` using the supplied path.
- `ThemeForm` gains an attachment color field automatically through its field list; the icon form already iterates every `IconAssetKey`.
- `applyTheme` writes/removes `--attachment`; `index.css` declares the token and `.item-card.kind-attachment`.
- Existing themes receive the kind color from migration 0006; the existing startup icon backfill adds missing `iconAssets.attachment` from `ICON_ASSETS` and preserves custom values.

Rationale: theme documents are validated with required kind colors, so missing keys would break reads. The migration plus existing backfill covers both required theme maps without a new theme-repair service.

### D7 — Tests focus on the new boundary, not the future upload

- Contract tests for attachment create/update, optional filename, storage-path rejection, content/command/url rejection, and `storagePath` null reads.
- API/repository tests for attachment CRUD, filter, filename search, ownership, and the database check constraint.
- A PGlite migration test that applies 0000–0004, seeds a row and theme, applies 0005–0006, and asserts the enum accepts `attachment`, `storage_path` exists, and the theme color was added.
- Frontend tests for the type selector, form field order and hidden Content, drop-zone filename capture (no text read), card badge/filename/actions, viewer metadata/status, filter, and theme keys.

## Risks / Trade-offs

- **Enum value cannot be used in the same transaction** → Split 0005 and 0006 and verify both fresh and upgraded PGlite paths.
- **Existing themes fail kind-color validation** → Migration 0006 adds the missing key before the API serves requests; test covers it.
- **Users expect upload to work immediately** → The UI shows the metadata drop area and the viewer states `No file stored yet`; the form accepts attachments without files; docs call out the storage non-goal.
- **`storagePath` leaks an internal identifier** → It remains owner-scoped in the API, is never rendered raw in the UI, and cannot be written by clients.
- **960-grid icon renders too thin or too heavy** → Use a scaled attachment-specific stroke and verify the badge in light/dark themes.
- **Search behavior broadens** → Filename search is additive and does not change existing title/description/tag matches.
- **Attachment without filename looks empty** → Card/viewer fall back to `No file attached` / `No file stored yet` instead of rendering blank content.

## Migration Plan

1. Merge contracts, API, DB migrations, frontend, tests, and docs in one release.
2. API startup applies 0005 (enum label), then 0006 (column, check, theme colors) before seeding/backfill and serving traffic.
3. Seed defaults now include `attachment`; backfill adds the icon artwork to existing themes.
4. Verify fresh 0000→0006 and upgraded 0004→0006 paths, `GET /api/items?kind=attachment`, and an attachment create/read/update cycle.
5. Rollback is code revert plus a manual reverse migration: remove the attachment check branch, drop `storage_path`, and either leave the unused enum label or rebuild the enum. No file data exists to migrate back.

## Open Questions

None.
