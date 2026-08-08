## Why

Markdown notes are meant to hold extensive content, so an extra short `description` field adds little value in the form for that kind. `description` stays in the data model (it may be `null` for markdown items), but it is hidden from the item form, and the `content` field takes the full remaining form space to prepare for the upcoming editor/viewer experience.

## What Changes

- **Data model:** `description` remains a field on all item kinds; it is not removed. The read model makes it nullable, and `markdown` items store and return `null` when no description is provided.
- **Input:** `description` becomes optional/nullable in the shared input fields, so a markdown item can be created without one. No cross-kind validation guard is added.
- **Repositories:** markdown items are stored with `description: null` when omitted; reads normalize a missing `description` to `null`, so no migration is required.
- **Item form:** the markdown form (Add and Edit) hides the `Description` field. The `Content` field fills the remaining vertical space and renders as a 50/50 vertical split into two synchronized textareas: an editable "editor" on the left and an editable "viewer" on the right, both bound to the same value. No Markdown rendering is implemented yet; the layout is the preparation.
- **Search:** `description` stays searchable; null-safe joins (`?? ''`) prevent a `null` value from leaking into the search text.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `collection-management`: `markdown` items keep a nullable `description` in the data model; the item form for markdown hides the Description field and renders Content as two synchronized textareas (editor + viewer) filling the remaining space.

## Impact

- `packages/contracts/src/items.ts`: make `description` optional/nullable in `commonItemFields`; make `collectionItemSchema.description` nullable.
- `src/api/services/items.service.ts`: no change required — description already flows through update candidates and the replace payload accepts `null`.
- `src/api/repositories/items.repository.ts`: store `input.description ?? null` on create; add `description: doc.description ?? null` to Mongo read normalization; null-safe search joins.
- `src/web/components/ItemForm.tsx`: hide Description for markdown; render Content as two synchronized textareas in a 50/50 vertical split; omit `description` from the markdown payload.
- `src/web/index.css`: styles for the split content layout.
- Tests: contract, API, and frontend tests updated for the nullable description and the split content field.
