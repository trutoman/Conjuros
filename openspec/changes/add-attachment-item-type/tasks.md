## 1. Contracts

- [x] 1.1 Add `'attachment'` to `itemKinds` in `packages/contracts/src/items.ts`
- [x] 1.2 Add `attachmentInputSchema` (`kind`, common fields, optional `filename`) and `attachmentUpdateCandidateSchema` (clearable filename)
- [x] 1.3 Add `attachmentInputSchema` to the `collectionItemInputSchema` discriminated union
- [x] 1.4 Add `storagePath: z.string().nullable()` to `collectionItemSchema`; do not accept it in create or update input schemas
- [x] 1.5 Extend `collectionItemUpdateSchema` guards so attachment rejects `command`, `url`, and `content`, and add the attachment branch to the API/repository kind mapping
- [x] 1.6 Add `attachment` to `themeKindColorsSchema` and `iconAssetKeys` in `packages/contracts/src/theme.ts`

## 2. Database Schema and Persistence

- [x] 2.1 Add the nullable `storage_path` column to `collectionItems` in `src/api/db/schema.ts`
- [x] 2.2 Extend `collection_items_kind_fields_check` with the attachment branch (`command`, `url`, `content` null; `filename` and `storage_path` optional) and require `storage_path IS NULL` for all other kinds
- [x] 2.3 Extend `InMemoryItemsRepository` and `PostgresItemsRepository` create/row mapping for attachment filename and null storage path
- [x] 2.4 Add `attachmentUpdateCandidateSchema` handling in `ItemsService.update`; preserve `storagePath` and keep `content` null
- [x] 2.5 Add `filename` to in-memory and Postgres item search

## 3. Migrations

- [x] 3.1 Generate the Drizzle migration(s) after the schema change and inspect the generated SQL and snapshot
- [x] 3.2 Create `0005_*` with only `ALTER TYPE "public"."item_kind" ADD VALUE 'attachment'`
- [x] 3.3 Create `0006_*` that adds `storage_path`, recreates the check constraint with the attachment branch, and adds `kind_colors.attachment` to themes lacking it
- [x] 3.4 Verify the 0006 snapshot records the new enum value, column, and check constraint
- [x] 3.5 Add a PGlite migration test that applies 0000–0004, seeds an item and theme, applies 0005–0006, and asserts the attachment enum value, storage column, and theme color
- [x] 3.6 Verify fresh 0000→0006 and upgraded 0004→0006 migration paths

## 4. Attachment Drop Zone and Form

- [x] 4.1 Extract the shared drag/picker/status shell from `FileDropZone` and add `AttachmentDropZone` with metadata-only behavior
- [x] 4.2 Ensure the attachment zone uses the same visual surface, status, drag-over state, keyboard support, and single-file error as Files
- [x] 4.3 Ensure the attachment zone never calls `File.text()`, never uploads, and reports only the file name to the form
- [x] 4.4 Add the `Attachment` option to `ItemTypeSelector`
- [x] 4.5 In `ItemForm`, render Title, Description, optional Filename, the attachment drop area on create, tags, and actions; render no Content field for attachment
- [x] 4.6 Send attachment `filename` on create when present and on edit (including an empty value to clear); omit `content`
- [x] 4.7 Add attachment validation messages: title required and invalid filename; no error for an absent filename

## 5. Card, Viewer, Filter, and Empty State

- [x] 5.1 Add the attachment badge, inline filename fallback, `View attachment` eye action, and hidden copy/open/download actions to `ItemCard`
- [x] 5.2 Add attachment mode to `ItemCardViewer`: title, description, filename, `No file stored yet` status, no content body, Edit/close controls
- [x] 5.3 Update `CollectionPage` modal labels and the `Attachments` type filter option
- [x] 5.4 Update the empty-state copy to cover all item types without listing only commands and links

## 6. Theme and Icon

- [x] 6.1 Add the supplied paperclip path and `0 -960 960 960` viewBox to `ICON_ASSETS.attachment`
- [x] 6.2 Add `attachment` to the light/dark seed `kindColors` with the chosen default colors
- [x] 6.3 Update `ThemeForm`, `applyTheme`, and `index.css` with the attachment kind color, `--attachment` token, and `.kind-attachment` styling
- [x] 6.4 Add an attachment-specific icon class with scaled stroke width so the 960-grid glyph matches the outline icon weight
- [x] 6.5 Verify existing themes receive the missing attachment kind color and icon through migration and backfill

## 7. Tests and Fixtures

- [x] 7.1 Add contract tests for attachment create/update, optional filename, storage-path rejection, text-field rejection, and `storagePath` null reads
- [x] 7.2 Add API/repository tests for attachment CRUD, ownership, filter, filename search, and the new check constraint
- [x] 7.3 Add frontend tests for the type selector, attachment form field order/hidden Content, drop-zone filename-only behavior, card, viewer, filter, and empty state
- [x] 7.4 Update all collection fixtures to include `storagePath: null`
- [x] 7.5 Update theme tests for the twenty-two icon keys, attachment color, and attachment icon/backfill

## 8. Documentation and Verification

- [x] 8.1 Update `README.md`, `AGENTS.md`, and relevant current docs to mention attachment items and that storage is not implemented yet
- [x] 8.2 Run `npm run check` and resolve lint, test, and build failures
- [x] 8.3 Verify `GET /api/items?kind=attachment` works and `kind: "attachment"` create/update accepts metadata while rejecting text fields and client storage paths
- [x] 8.4 Verify the attachment card/viewer show metadata without rendering content or offering download/open actions
