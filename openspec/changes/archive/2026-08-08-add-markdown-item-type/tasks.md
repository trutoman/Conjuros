## 1. Contracts

- [x] 1.1 Add `'markdown'` to `itemKinds` in `packages/contracts/src/items.ts`
- [x] 1.2 Add `markdownInputSchema` (kind `markdown`, `content` as non-empty trimmed string with no max) and include it in the `collectionItemInputSchema` discriminated union
- [x] 1.3 Add `content` to `collectionItemSchema` as a nullable string, and add `content` to `collectionItemUpdateSchema` with `superRefine` guards rejecting `command`/`url` for `markdown` and `content` for `spell`/`web-link`

## 2. API Service

- [x] 2.1 Extend `items.service.ts` update mapping so `markdown` resolves `content` (from update or current) and nulls `command`/`url`; add `content: candidate.kind === 'markdown' ? candidate.content : null` to the replace payload

## 3. Repositories

- [x] 3.1 In `InMemoryItemsRepository.create`, add `content: input.kind === 'markdown' ? input.content : null` and include `item.content` in `matchesQuery` search text
- [x] 3.2 In `MongoItemsRepository.create`, add the `content` field mapping and include `{ content: expression }` in the `$or` search filter
- [x] 3.3 Normalize nullable fields on read in `MongoItemsRepository` (`content: doc.content ?? null`, same for `command`/`url`) so pre-existing documents satisfy the nullable read model without a migration
- [x] 3.4 Add an optional backfill script (e.g., `scripts/backfill-content-null.mjs`) that sets `content: null` on existing `collectionItems` documents missing the field, following the `scripts/normalize-tag-categories.mjs` pattern
- [x] 3.5 Register the migration as an npm script and document the run command in `README.md`/`AGENTS.md`

## 4. Frontend

- [x] 4.1 Add a `Markdown` radio option to `ItemTypeSelector.tsx`
- [x] 4.2 Update `ItemForm.tsx` to build the `markdown` payload with `content` and label the content field `Content` for markdown (keep `Command`/`URL` labels for existing kinds); update the required-field error message handling
- [x] 4.3 Update `ItemCard.tsx` to include `item.content` in `contentValue`, add a `Markdown` badge/icon, and render no copy/open actions for markdown
- [x] 4.4 Update `CollectionPage.tsx`: add a `Markdown` option to the "Type" filter dropdown and include `item.content` in the client-side searchable text
- [x] 4.5 Add a `--markdown` color variable (light and dark) and `.item-card.kind-markdown` / `.item-type-badge.kind-markdown` rules in `src/web/index.css`

## 5. Tests

- [x] 5.1 Add contract tests in `src/tests/shared/validation.test.ts` covering markdown create/update, long content preservation, and cross-kind field rejection
- [x] 5.2 Add a `createMarkdownItem` fixture in `itemCard.fixtures.ts` and frontend tests for the markdown badge, content rendering, and absence of copy/open actions
- [x] 5.3 Add API tests covering create/edit/search/filter for `markdown` items and the cross-kind guard
- [x] 5.4 Add a frontend test that the "Type" filter and item form type selector expose a `Markdown` option
- [x] 5.5 Add a frontend test in `src/web/pages/__tests__/CollectionPage.test.tsx` that selects the `Markdown` type filter and searches by content, asserting only matching markdown items are shown (covers the "Search result respects the type filter" scenario)

## 6. Docs and Validation

- [x] 6.1 Update `README.md` and `AGENTS.md` product/domain descriptions to mention markdown items
- [x] 6.2 Run `npm run check` (lint, test, build) and fix any failures
