## Required filename on markdown create

- [x] 1.1 In `packages/contracts/src/items.ts`, set `markdownInputSchema.filename` to `markdownFilenameSchema` (required) and remove the now-unused `optionalMarkdownFilenameSchema`.
- [x] 1.2 Add `markdownUpdateCandidateSchema = markdownInputSchema.omit({ filename: true }).extend({ filename: markdownFilenameUpdateSchema })` to `packages/contracts/src/items.ts`.
- [x] 1.3 In `src/api/services/items.service.ts`, rebuild the markdown update candidate with `filename: update.filename ?? current.filename ?? ''` via `markdownUpdateCandidateSchema`; keep spell/web-link candidates on `collectionItemInputSchema`; store `candidate.filename || null`.
- [x] 1.4 In `src/web/lib/itemForm.ts`, add `MESSAGES.filenameRequired = 'Filename is required for a markdown note'` and make `messageForInputError(payload, result, isCreate = true)` report it in the markdown branch (after the content check, before the invalid-filename check, only when `isCreate`).
- [x] 1.5 In `src/web/components/ItemForm.tsx`, parse with `collectionItemUpdateSchema` when `item` is set and `collectionItemInputSchema` otherwise; pass `isCreate` to `messageForInputError`; widen `onSubmit` to `CollectionItemInput | CollectionItemUpdate`.
- [x] 1.6 In `src/web/pages/CollectionPage.tsx`, widen `save(input)` to the `CollectionItemInput | CollectionItemUpdate` union.

## Download action on markdown cards

- [x] 2.1 Add `src/web/lib/downloadMarkdown.ts` with `suggestedMarkdownFileName` (filename → title-slug `.md`, empty slug → `note.md`) and `downloadMarkdownFile` (Blob `text/markdown;charset=utf-8`, object URL, temporary `<a download>`, click, revoke).
- [x] 2.2 In `src/web/components/ItemCard.tsx`, add a "Download markdown" icon-action button inside the `item.kind === 'markdown'` fragment, after the "View markdown" button and before the menu wrapper, using the provided download icon (`viewBox="0 -960 960 960"`, `filled`), calling `downloadMarkdownFile(item)`.

## Spec-file docs fix

- [x] 3.1 Rename `## Summary` → `## Purpose` in `openspec/specs/item-card-experience/spec.md` (OpenSpec 1.7.0 requirement).

## Tests

- [x] 4.1 `src/tests/shared/validation.test.ts`: add `filename` to existing markdown create fixtures; replace "normalizes an empty markdown filename to 'not provided'" with a rejection assertion; add set/clear assertions for `markdownUpdateCandidateSchema`.
- [x] 4.2 `src/tests/api/items.test.ts`: create-without-filename markdown POSTs now expect `400` (or gain a `filename`); keep update rename/clear/guard coverage; add a create-with-filename success assertion.
- [x] 4.3 `src/web/components/__tests__/ItemForm.test.tsx`: add "reports a missing filename" (valid content, blank filename → message, not submitted) and "edit clears the filename" (submits `filename: ''`); keep existing "no content" test message unchanged.
- [x] 4.4 `src/web/lib/__tests__/downloadMarkdown.test.ts`: suggested-name rules (filename wins, slug fallback, empty slug → `note.md`).
- [x] 4.5 `src/web/components/__tests__/ItemCard.test.tsx`: "Download markdown" present on markdown cards between View and the menu trigger; absent on spell/web-link; click triggers the download (mock `URL.createObjectURL`/`revokeObjectURL` and `HTMLAnchorElement.prototype.click`).

## Verify

- [x] 5.1 Run `npm run check` (lint, test, build) and fix any failures.
- [x] 5.2 Run `openspec validate --change markdown-required-filename-and-download` (from repo root) and fix any spec issues.