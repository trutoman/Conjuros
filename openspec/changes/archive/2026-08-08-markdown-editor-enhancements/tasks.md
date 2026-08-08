## 1. Editor helper module

- [x] 1.1 Create `src/web/lib/markdownEditor.ts` with a shared `EditResult` type (`{ value, selectionStart, selectionEnd }`) and an `applyEdit` helper that sets the new value and returns the target selection
- [x] 1.2 Implement `indentSelection(value, start, end)` that inserts four spaces at the cursor or prefixes four spaces to each selected line
- [x] 1.3 Implement `dedentSelection(value, start, end)` that removes up to four leading spaces from the current line or each selected line
- [x] 1.4 Implement `handleEnter(value, start, end)` that continues blockquote (`>`), unordered (`-`/`*`/`+`) and ordered (`N.`) list lines, preserves indentation, increments ordered numbers, terminates on an empty list item, and returns a plain newline otherwise
- [x] 1.5 Implement `handleAutoClose(value, start, end)` with a marker table (`**`, `*`, `_`, `` ` ``, `~~`, `[`, `(`, `>`) that inserts the closing marker and places the cursor between the pair, or skips over an existing closing marker when the text after the cursor already matches
- [x] 1.6 Add unit tests for `markdownEditor.ts` covering all scenarios from the `markdown-editor` spec (Tab indent/dedent, list continuation, empty-item termination, quote continuation, indentation preservation, auto-close pairs, skip-over)

## 2. Wire editor into the form

- [x] 2.1 In `src/web/components/ItemForm.tsx`, add an `onKeyDown` handler on the "Content - Edit" textarea that intercepts Tab, Shift+Tab, and Enter and applies the helper results via `setContent`
- [x] 2.2 Add a `useLayoutEffect` that restores `setSelectionRange` on the edit textarea from the latest `EditResult` selection after content updates
- [x] 2.3 Verify focus stays in the editor after Tab/Shift+Tab (no focus traversal) and that the live preview still updates
- [x] 2.4 Fix Shift + Tab in the markdown editor so it dedents the current line or selection and keeps focus in the textarea (no focus traversal); add a component-level regression test in `ItemForm.test.tsx` asserting the dedented value and focus retention

## 3. Local draft autosave

- [x] 3.1 Implement draft helpers in `src/web/lib/markdownEditor.ts` (or a sibling `draft.ts`): `draftKey(formId)`, `loadDraft(formId)`, `saveDraft(formId, content)`, `clearDraft(formId)`, with `saveDraft` wrapped in try/catch to tolerate quota/availability failures
- [x] 3.2 In `ItemForm.tsx`, derive the form id (`add` for Add mode, item `id` for Edit) and seed the `content` state from the saved draft when opening the form (Add: draft or empty; Edit: draft if present else item content)
- [x] 3.3 Add a debounced `useEffect` (~300ms) that writes the draft whenever `content` changes while `kind === 'markdown'`, plus an unmount cleanup that writes synchronously
- [x] 3.4 Clear the draft after a successful submit
- [x] 3.5 Add a "Discard draft" button in the "Content - Edit" pane (visible when a draft exists) that clears the draft and resets `content` to the item's saved content (or empty in Add mode)
- [x] 3.6 Update `src/web/components/__tests__/ItemForm.test.tsx` with tests for draft save/restore, per-form scoping (Add vs Edit do not collide), draft cleared on save, and discard-draft behavior (mock `localStorage`)

## 4. Validation

- [x] 4.1 Run `npm run lint` and fix any issues
- [x] 4.2 Run `npm run test` and ensure all tests pass
- [x] 4.3 Run `npm run build` and ensure the production build succeeds
- [x] 4.4 Re-run `npm run lint`, `npm run test`, and `npm run build` after the Shift+Tab fix and pane-growth work

## 5. Both panes grow to fit content

- [x] 5.1 In `src/web/components/ItemForm.tsx`, change the auto-resize `useLayoutEffect` so the shared pane height is the maximum of the edit textarea's `scrollHeight` and the preview pane's content height, instead of mirroring the editor height only
- [x] 5.2 In `src/web/index.css`, remove the preview pane's internal scrolling/clipping (`overflow-y: auto`) so growth keeps the full content of both panes visible
- [x] 5.3 Add component tests in `ItemForm.test.tsx` covering both growth directions: panes grow when the editor text is taller and when the rendered preview is taller
- [x] 5.4 Update the "Content panes grow with added lines" test to reflect the shared-height behavior if the current assertion changes
- [x] 5.5 Give the "Content - Edit" and "Content - View" pane headers equal height (consistent `min-height`/`line-height`) so the editor textarea and the preview pane always start at the same vertical position, including when the "Discard draft" button is visible; add a component test asserting the two panes stay top-aligned with and without the button
- [x] 5.6 Re-run `npm run lint`, `npm run test`, and `npm run build` after the pane-alignment work
