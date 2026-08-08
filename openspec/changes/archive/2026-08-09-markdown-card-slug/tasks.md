## 1. Slug helper

- [x] 1.1 Create `markdownSlug(content: string): string` in `src/web/lib/` (e.g. `itemCardSlug.ts`) that returns the first non-empty line of `content`, stripped of markdown markers, with internal whitespace collapsed
- [x] 1.2 Strip leading heading (`#{1,6}`), list (`-`/`*`/`+`/`N.`), blockquote (`>`) markers and inline emphasis/links/code/images markers from the selected line
- [x] 1.3 Return `''` when `content` is null-like, empty, or all-whitespace
- [x] 1.4 Add unit tests in `src/web/lib/__tests__/` covering: first non-empty line selection across leading blank lines, heading/emphasis/link/code/list stripping, whitespace collapsing, and empty/all-whitespace fallback

## 2. Wire slug into the markdown card

- [x] 2.1 In `src/web/components/ItemCard.tsx`, make the inline content for `markdown` items use `markdownSlug(item.content ?? '')` while spell/web-link keep the existing `contentValue`
- [x] 2.2 Keep the full `content` value unchanged on the item and in Edit; do not add new markdown actions

## 3. Component tests

- [x] 3.1 Update `src/web/components/__tests__/ItemCard.test.tsx` "renders markdown content inline" to assert the card shows the slug of the first non-empty line instead of the full content
- [x] 3.2 Add component tests: multi-line markdown stays a single row (only first non-empty line in inline content), markdown markers are stripped, and the full content remains available when editing
- [x] 3.3 Update `itemCard.fixtures.ts` markdown fixture if needed so its content exercises multi-line slug behavior

## 4. Validation

- [x] 4.1 Run `npm run lint`
- [x] 4.2 Run `npm run test` and ensure all tests pass
- [x] 4.3 Run `npm run build`