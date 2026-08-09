## 1. Contracts

- [x] 1.1 Add `'file'` to the `itemKinds` tuple in `packages/contracts/src/items.ts`
- [x] 1.2 Add `fileFilenameSchema` (trim, max 128 chars, no path separators, no `.md` requirement) and `fileFilenameUpdateSchema` (trimmed, accepts `''`)
- [x] 1.3 Add `fileInputSchema` (kind `'file'`, `filename`, `content`) and `fileUpdateCandidateSchema`
- [x] 1.4 Add `fileInputSchema` to the `collectionItemInputSchema` discriminated union
- [x] 1.5 Update `collectionItemUpdateSchema`: `filename` accepts a markdown or file name (or `''`), and add the cross-kind guard rejecting `command`/`url` for kind `'file'`

## 2. API Service and Repositories

- [x] 2.1 In `src/api/services/items.service.ts`, branch `file` into `fileUpdateCandidateSchema` and use a `markdown || file` mapping for `content`/`filename` in the repository `replace`
- [x] 2.2 In `src/api/repositories/items.repository.ts`, extend `InMemoryItemsRepository.create` so kind `file` persists `content` and `filename` (nulling `command`/`url`)
- [x] 2.3 Extend `MongoItemsRepository.create` with the same `file` mapping

## 3. Frontend Item Form

- [x] 3.1 Add a `File` radio option in `src/web/components/ItemTypeSelector.tsx`
- [x] 3.2 In `src/web/components/ItemForm.tsx`, add a `file` branch: omit Description, render the Filename input, and render one plain textarea labeled "Content" (no split panes, no preview, no draft, no editor key handling); keep markdown panes for `markdown` only
- [x] 3.3 In `src/web/lib/itemForm.ts`, add a `file` branch to `messageForInputError` (content required, filename required on create, invalid filename > 128 chars or path separators) and an `isValidFileFilename` helper

## 4. Item Card, Slug, Download

- [x] 4.1 Add `plainTextSlug` to `src/web/lib/itemCardSlug.ts` (first non-empty line, whitespace collapsed, no marker stripping)
- [x] 4.2 In `src/web/components/ItemCard.tsx`, add the `file` badge with the provided file icon (document page glyph), `kindLabel` "File", plain-text inline slug, and "View file" (opens viewer) and "Download file" actions
- [x] 4.3 Add `src/web/lib/downloadFile.ts` with `suggestedFileName` (filename or title slug with no extension) and `downloadTextFile` (MIME `text/plain`), and wire it into the card

## 5. Viewer

- [x] 5.1 In `src/web/components/ItemCardViewer.tsx`, branch `file`: "View file" heading, optional Filename label, content rendered as a `<pre>` text node (no Markdown parsing), same close and Edit buttons

## 6. Filter and Styles

- [x] 6.1 Add a `Files` option to the "Type" dropdown in `src/web/pages/CollectionPage.tsx`
- [x] 6.2 Add `--file` accent, `.kind-file` badge styling, and file viewer `<pre>` styling in `src/web/index.css`

## 7. Tests

- [x] 7.1 Add contract/validation tests for the `file` schemas (valid filename, over-128 rejection, path separator rejection, no-extension acceptance, cross-kind rejection)
- [x] 7.2 Add API items tests for file CRUD (create/read/update/delete), required filename on create, clearable filename on update, and type filtering by `file`
- [x] 7.3 Add frontend tests: item form file branch, type selector option, file card badge/actions, file slug, download helper, and file viewer
- [x] 7.4 Add a collection page filter test for the `Files` option if one exists for other kinds

## 8. Verification

- [x] 8.1 Run `npm run check` and resolve any failures