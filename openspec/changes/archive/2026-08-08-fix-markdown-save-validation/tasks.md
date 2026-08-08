## 1. Validation message helper

- [x] 1.1 Create `messageForInputError(payload, result)` (pure helper, e.g. in `src/web/lib/itemForm.ts`) that maps a failed `collectionItemInputSchema` parse to a friendly message: empty/whitespace `title` → "Title is required"; `markdown` empty/whitespace `content` → "Content is required for a markdown note"; `spell` empty/whitespace `command` → "Command is required for a spell"; `web-link` invalid URL → "URL must use the http or https protocol"; any other failure → "Check the item details"
- [x] 1.2 Use `.trim() === ''` to detect empty/whitespace-only values so whitespace-only fields are treated as missing
- [x] 1.3 Add unit tests for `messageForInputError` covering every scenario from the `collection-management` spec delta (empty/whitespace title, empty/whitespace content, whitespace command, invalid URL, generic fallback, no raw Zod text)

## 2. Wire helper into the item form

- [x] 2.1 In `src/web/components/ItemForm.tsx`, replace the `submit()` error-mapping logic so it calls `messageForInputError` and no longer shows `result.error.issues[0]?.message`
- [x] 2.2 Keep `onSubmit` uninvoked on validation failure so invalid items are never submitted

## 3. Component tests

- [x] 3.1 Update `src/web/components/__tests__/ItemForm.test.tsx` markdown tests to assert "Title is required" for empty title and "Content is required for a markdown note" for empty content
- [x] 3.2 Add component tests: whitespace-only title → "Title is required"; whitespace-only content → "Content is required for a markdown note"; whitespace-only command → "Command is required for a spell"; invalid `web-link` URL → "URL must use the http or https protocol"; assert no raw "String must contain at least 1 character(s)" text is ever rendered

## 4. Validation

- [x] 4.1 Run `npm run lint`
- [x] 4.2 Run `npm run test` and ensure all tests pass
- [x] 4.3 Run `npm run build`
