## Why

The collection currently stores text-oriented items: commands, web links, notes, and plain-text files. Users need a first-class attachment item that represents a file stored in Supabase Storage instead of carrying the file body as text. This change adds the attachment structure end to end while deliberately leaving the actual file upload, download, and storage wiring for a later change.

## What Changes

- Add a fifth item kind, `attachment`, using the same ownership, tags, description, ordering, and related-item model as the other kinds.
- Add a nullable `storagePath` read field and `storage_path` database column for the future Supabase Storage object reference. It stays `null` in this phase because storage is not implemented.
- Give attachment items a title, optional description, tags, and an optional `filename` captured from the dropped file. The shared `content` field stays present in the data model but is not rendered in the attachment form, is not accepted by attachment writes, and remains `null` for now.
- Reuse the Files drop area for attachments: dropping or choosing one file records its name and shows the same status/error behavior, but does not read the file body, upload it, or persist a storage reference.
- Allow creating an attachment without a file for now; the drop area is optional until storage exists.
- Add the attachment option to the item type selector and collection type filter, show attachment cards with the supplied paperclip glyph and filename, and open a read-only attachment viewer showing title, description, filename, and a “not stored yet” state.
- Add `attachment` to the theme kind colors and icon assets. The supplied 960-grid paperclip path is stored as the `attachment` icon asset and rendered in the existing outline icon style with a scaled stroke.
- Add database migrations for the enum value, `storage_path` column, kind/field check constraint, and missing `attachment` theme color on existing themes. The startup icon backfill supplies the new attachment artwork to existing themes.
- Update contracts, API services/repositories, tests, current documentation, and the affected main specs.

## Capabilities

### New Capabilities

- `attachment-item-viewer`: read-only panel that opens for an attachment item and shows its title, description, filename, and storage-not-available state without rendering text content.

### Modified Capabilities

- `collection-management`: adds the `attachment` item kind, attachment form fields and drop area, optional filename, storage reference field, type filter option, filename search, and validation behavior.
- `item-card-experience`: attachment cards show the attachment badge/glyph, filename, and a “View attachment” action without text-copy or download actions.
- `theme-icon-storage`: the icon key set gains `attachment`, and admins can edit its stored artwork.
- `theme-storage-migration`: existing themes gain the attachment kind color and icon key through migration/backfill.

## Impact

- `packages/contracts/src/items.ts`: `itemKinds`, `attachmentInputSchema`, update guards, and the nullable `storagePath` read field.
- `packages/contracts/src/theme.ts`: `themeKindColorsSchema` and `iconAssetKeys`.
- `src/api/db/schema.ts`: `storage_path` column and the kind/field check constraint.
- `drizzle/`: two new migrations (enum value first, then column/check/theme data) and their snapshots. Historical migrations remain untouched.
- `src/api/services/items.service.ts` and `src/api/repositories/items.repository.ts`: attachment create/update mapping, `storagePath` persistence, and filename search.
- `src/api/repositories/themeSeed.ts`: attachment kind color and default icon asset.
- `src/web/components/FileDropZone.tsx`: shared drop-zone mode that records a filename without reading text.
- `src/web/components/ItemForm.tsx`, `ItemTypeSelector.tsx`, `ItemCard.tsx`, `ItemCardViewer.tsx`, `EmptyState.tsx`, and `CollectionPage.tsx`: attachment form, card, viewer, filter, and modal labels.
- `src/web/lib/iconAssets.ts`, `applyTheme.ts`, `itemForm.ts`, and `index.css`: attachment icon/color/token and validation messages.
- Tests and fixtures across contracts, API, database, and frontend.
- **Non-goals:** no Supabase Storage bucket setup, upload, download, signed URL, file bytes, or storage-path population. No visible attachment content in this phase. No breaking changes to existing item kinds.
