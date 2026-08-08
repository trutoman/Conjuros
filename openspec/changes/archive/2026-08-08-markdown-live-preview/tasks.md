## 1. Dependencies

- [x] 1.1 Install `marked` and `dompurify` (and `@types/dompurify` if the type definitions are not bundled) as production dependencies in `package.json`

## 2. Frontend

- [x] 2.1 In `ItemForm.tsx`, replace the "Content - View" textarea with a read-only `.content-pane-preview` `div` that keeps the `aria-label="Content - View"` accessible label and is no longer editable
- [x] 2.2 In `ItemForm.tsx`, compute the preview HTML with `marked.parse(content)` piped through `DOMPurify.sanitize`, memoized on `content`, and inject it via `dangerouslySetInnerHTML`
- [x] 2.3 Update the auto-resize `useLayoutEffect` so it sizes the preview `div` to the same computed height as the "Content - Edit" textarea (still `min-height: 8rem`, growing with added lines)
- [x] 2.4 Add `src/web/index.css` styles for `.content-pane-preview` (same `min-height: 8rem` and pane styling as the textarea, plus typography for rendered Markdown: headings, paragraphs, code, links, lists)

## 3. Tests

- [x] 3.1 Update `src/web/components/__tests__/ItemForm.test.tsx`: "Content - View" is a rendered preview (not a textarea) that shows formatted HTML, typing in "Content - Edit" updates the preview in real time, and a `<script>` embedded in content does not execute
- [x] 3.2 Update the auto-resize test so it asserts both the edit textarea and the preview pane share the computed height

## 4. Docs and Validation

- [x] 4.1 Run `npm run check` (lint, test, build) and fix any failures
