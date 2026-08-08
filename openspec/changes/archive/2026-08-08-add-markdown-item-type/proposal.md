## Why

The collection currently supports only `spell` items (a `command`) and `web-link` items (a `url`). Users need to store long-form documentation in their collection, e.g. Markdown files describing commands, recipes, or project notes. Supporting a `markdown` item kind lets users keep rich, extensive text alongside their spells and links.

## What Changes

- Add a third item kind, `markdown`, identified by the string `markdown`.
- A `markdown` item stores its body in a new `content` field: an extensive, effectively unbounded text field that holds the raw Markdown source.
- Add the new kind to every data type and every reference across the stack:
  - Contracts: `itemKinds`, input/update/read schemas, query `kind` filter, and types.
  - API service mapping and persistence (in-memory and Mongo repositories), including search over `content`.
  - Frontend type selector, item form, item card, and collection type filter.
- Frontend menus can already display and filter by the new kind:
  - The Add/Edit item form type selector gains a `Markdown` option.
  - The collection "Type" filter gains a `Markdown` option.
  - Item cards render a `markdown` badge and the item's content text.
- No Markdown viewer, renderer, or editor is built in this change; the text is stored and shown verbatim.

## Capabilities

### New Capabilities

### Modified Capabilities
- `collection-management`: Items can be of kind `markdown` and store an extensive `content` field with the Markdown source; kind filtering includes `markdown`; search covers `content`.
- `item-card-experience`: Item cards render `markdown` items with a Markdown badge, a dedicated icon, and the raw content text.

## Impact

- `packages/contracts/src/items.ts`: add `'markdown'` to `itemKinds`, `markdownInputSchema` with unbounded `content`, extend `collectionItemInputSchema` union, `collectionItemUpdateSchema` (+ cross-kind guard), and `collectionItemSchema` read model with a nullable `content` field.
- `src/api/services/items.service.ts`: extend the kind-specific mapping so `markdown` uses `content` and nulls `command`/`url`.
- `src/api/repositories/items.repository.ts`: extend `create` persistence mapping and search text for `content` in both `InMemoryItemsRepository` and `MongoItemsRepository`; normalize nullable fields on read in `MongoItemsRepository` (`content: doc.content ?? null`) so pre-existing documents load cleanly.
- `src/web/components/ItemTypeSelector.tsx`: add a `Markdown` radio option.
- `src/web/components/ItemForm.tsx`: include `content` in the payload and label the content field for `markdown`.
- `src/web/components/ItemCard.tsx`: add `markdown` badge/icon and render `content`.
- `src/web/pages/CollectionPage.tsx`: add `Markdown` option to the "Type" filter dropdown and include `content` in client-side search.
- `src/web/index.css`: add a `--markdown` color variable and `.kind-markdown` classes.
- Tests: contract validation tests, API items tests, and frontend fixtures/tests for the new kind.
- Read normalization in `MongoItemsRepository` maps missing nullable fields to `null` (`content: doc.content ?? null`), so the nullable read field never surfaces `undefined`.
- An optional backfill migration script (e.g., `scripts/backfill-content-null.mjs`) and an npm script to run it, aligning stored documents with the read model as data hygiene.
