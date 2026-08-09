## 1. Contracts

- [x] 1.1 Add `markdownFilenameSchema` (`z.string().trim().max(64).regex(/^[^/\\]+$/).regex(/\.md$/i)`) to `packages/contracts/src/items.ts`, plus a `preprocess` that maps a trimmed-empty value to "not provided"
- [x] 1.2 Add optional `filename` to `markdownInputSchema`
- [x] 1.3 Add `filename` to `collectionItemUpdateSchema` (optional, clear-preserving preprocess) and `superRefine` guards rejecting `filename` for `spell`/`web-link` kinds
- [x] 1.4 Add `filename: z.string().nullable()` to `collectionItemSchema`

## 2. API Service

- [x] 2.1 Extend `items.service.ts` update/candidate mapping so `markdown` resolves `filename` (from update or current) and normalized empty → `null`; add `filename: candidate.kind === 'markdown' ? candidate.filename : null` to the replace payload

## 3. Repositories

- [x] 3.1 In `InMemoryItemsRepository.create`, add `filename: input.kind === 'markdown' ? input.filename : null`
- [x] 3.2 In `MongoItemsRepository.create`, add the `filename` field mapping for markdown items
- [x] 3.3 Normalize `filename: doc.filename ?? null` on read in `MongoItemsRepository` so pre-existing documents satisfy the nullable read model

## 4. Frontend

- [x] 4.1 Add `filename` to `ItemForm.tsx`: render a "Filename" input for the `markdown` kind between Title and the Content panes, bound to the item's value, and include it in the submit payload (only for markdown)
- [x] 4.2 Add `MESSAGES.filenameInvalid` and a `filename` check in the `markdown` branch of `messageForInputError` in `src/web/lib/itemForm.ts`
- [x] 4.3 Show the item `filename` (label "Filename" + value) in `ItemCardViewer.tsx` under the header only when present
- [x] 4.4 Confirm `ItemCard.tsx` unchanged (filename never on cards)

## 5. Tests

- [x] 5.1 Add contract tests in `src/tests/shared/validation.test.ts`: markdown create/update with filename, empty clears, invalid filename (path, too long, wrong extension), and filename rejection on `spell`/`web-link`
- [x] 5.2 API tests in `src/tests/api/items.test.ts` covering filename persistence, read normalization, edit, clearing, and cross-kind guard
- [x] 5.3 Frontend tests: Filename input renders only for markdown and is prefilled in edit mode; `messageForInputError` returns the friendly filename message; viewer shows the filename and omits it when `null`
- [x] 5.4 Update typed `CollectionItem` fixtures (`filename: null`) in card/form/viewer/page fixtures and `CollectionPage.test.tsx`

## 6. Docs and Validation

- [x] 6.1 Note the markdown `filename` field in `README.md`/`AGENTS.md` product/domain descriptions
- [x] 6.2 Run `npm run check` (lint, test, build) and fix any failures