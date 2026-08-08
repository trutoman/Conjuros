## Context

See proposal.md - Why. The Markdown editor is a plain controlled textarea in `src/web/components/ItemForm.tsx` bound to `content` state with an `onChange` that only calls `setContent`. There is no keyboard handling, no draft persistence (the only `localStorage` usage is the sidebar toggle in `CollectionPage`), and no debounce anywhere in the frontend. The edit pane also drives live preview via `useMemo` + `DOMPurify` and auto-resize via `useLayoutEffect`. The form is used for both Add (`item` undefined) and Edit (`item` set) modes.

## Goals / Non-Goals

**Goals:**
- Deliver Tab/Shift+Tab indentation, Enter list/quote continuation with auto-indent, and auto-closing of Markdown pairs as pure editor logic on the controlled textarea.
- Persist a local draft of the Markdown content in `localStorage`, scoped per form, restored on reopen, cleared on successful save, discardable.
- Keep all behavior in `ItemForm.tsx` and small pure helpers so it is unit-testable without DOM.

**Non-Goals:**
- No server-side autosave; no API changes.
- No image drag & drop or upload (explicitly deferred).
- No new dependencies — the editor logic is hand-written; no CodeMirror/Monaco/Tiptap.
- No changes to the preview pane rendering beyond what already exists.

## Decisions

### 1. Text editing as a pure helper module (`src/web/lib/markdownEditor.ts`)
All key operations are pure functions taking `(value, selectionStart, selectionEnd)` and returning `{ value, selectionStart, selectionEnd }`: `indentSelection`, `dedentSelection`, `handleEnter`, and `handleAutoClose`. The textarea's `onKeyDown` applies the result via a single `setContent` + cursor restore effect. Rationale: unit-testable without a DOM and matches the project's pattern of thin components plus testable helpers. Alternative considered: ad-hoc handlers inline in the component — rejected because the Enter list logic is stateful (list markers, indentation, empty-item termination) and hard to test inline.

### 2. Indentation unit is 4 spaces
Tab inserts four spaces; Shift+Tab removes up to four leading spaces per line. Alternatives considered: 2 spaces or tabs. 4 spaces was chosen because it matches Markdown's nested-list convention and the user asked for "2/4" with no preference.

### 3. Enter handling operates on the current line
On Enter, the helper reads the current line, detects a leading blockquote marker (`>`), unordered list marker (`-`/`*`/`+`), or ordered list marker (`N.`), and any indentation before the marker. It emits a new line preserving indentation: same marker for unordered/quote, incremented number for ordered. If the current line contains only the marker (and optional whitespace), the new line is plain text with no marker. All other lines produce a plain newline. Rationale: simple, predictable, and covers the specified scenarios without a full Markdown parser.

### 4. Auto-close uses a marker table with skip-over
A constant table maps opening sequences (`**`, `*`, `_`, `` ` ``, `~~`, `[`, `(`, `>`) to their closing sequence. On the closing character of an opening pair, the helper checks if the character(s) after the cursor already equal the closing sequence — if so it advances the cursor past them instead of inserting duplicates; otherwise it inserts the closing sequence and positions the cursor between the pair. Rationale: satisfies the "no duplicate closing marker" scenario cheaply. Blocks in the middle of a word are still auto-closed; this is accepted as typical editor behavior and kept simple.

### 5. Draft autosave scoped by form identity, debounced, write-only-on-change
Draft key: `conjuros_md_draft_<form-id>` where `<form-id>` is `add` for the Add form or the item `id` for Edit. The draft is written from a `useEffect` on `content` only when `kind === 'markdown'`, debounced ~300ms. On form open, initial `content` state is seeded from the saved draft if one exists (Add) or from the item content unless a newer draft exists (Edit). On successful submit, the draft is removed. A "Discard draft" affordance in the editor pane resets `content` to the saved item content (or empty) and clears the draft. Rationale: `localStorage` is the least invasive persistence (no API, survives refresh); scoping by form prevents cross-item overwrites; debouncing limits writes on large pastes. Alternative considered: autosave to the server — rejected, the user chose local draft only.

### 6. Cursor restoration via a small effect keyed by an incrementing counter
Since React does not reliably preserve textarea selection on `setContent`, the helpers return an explicit target selection, and a `useLayoutEffect` restores `setSelectionRange` on the textarea whenever a "selection requested" counter changes. Rationale: necessary for Tab/Enter/auto-close to place the cursor correctly; a counter avoids restoring on every unrelated re-render.

### 7. Shared pane height follows the taller of editor and preview
Both panes are sized to a single shared height so neither clips its content: the height is the maximum of the edit textarea's `scrollHeight` and the preview pane's content height, recomputed on `content` change via the existing auto-resize `useLayoutEffect`. The preview's internal scroll (`overflow-y: auto`) is removed because growth replaces scrolling. Rationale: keeps the full content of both panes visible — when the rendered Markdown (wrapping, headings, code blocks) is taller than the raw text, both panes still grow; the current implementation only mirrors the editor height (`viewPane.style.height = editPane.style.height`) and lets the preview overflow. Alternative considered: an independent max-height cap per pane — rejected because it would clip content and contradict the "always fully visible" goal.

### 8. Shift + Tab must keep focus and dedent
The `onKeyDown` handler must call `event.preventDefault()` for both Tab and Shift + Tab so the browser never performs focus traversal, and route Shift + Tab to `dedentSelection`. A component-level test (jsdom) must assert the dedent produces the expected value and that focus stays in the textarea after the keydown; the pure-helper unit tests alone do not cover focus retention.

### 9. Equal-height pane headers keep the two panes top-aligned
The "Content - Edit" and "Content - View" panes each render a header row above their content area. When a draft exists, the "Discard draft" button appears in the Edit header, which makes that header taller than the plain "Content - View" label and pushes the editor textarea down relative to the preview. Fix: give both pane headers a fixed height (a consistent `min-height`/`line-height` applied to both headers) so their content areas always start at the same vertical line, whether or not the button is shown. Rationale: a stable header height keeps the two textareas visually aligned regardless of draft state, which is the stated requirement; the button remains inside the Edit header flow. Alternatives considered: absolutely positioning the button outside the flow (rejected — complicates the header layout and spacing), or reserving header space only when a draft exists (rejected — still produces a jump when the button appears).

## Risks / Trade-offs

- **Debounced draft writes can lose the last keystrokes on immediate tab close** → write the draft synchronously in the component unmount cleanup, and keep the debounce short (~300ms).
- **Auto-close can surprise users mid-word** (e.g. typing `*` inside a word) → the skip-over logic handles the common "typing a second marker" case; further refinement (only auto-close when preceded by whitespace/start) is a deferred open question.
- **Draft may restore stale content in Edit if the item changed on another device** → acceptable for a local-only draft; the "Discard draft" affordance covers recovery.
- **LocalStorage size limits** → only the Markdown content is stored; large notes could hit the ~5MB quota, acceptable for typical notes and surfaced only if `localStorage.setItem` throws (draft write is wrapped in try/catch and silently skipped on failure).

## Migration Plan

No migration required: no persisted schema, no API, no data model changes. Deploy as part of the normal frontend build. Rollback is a revert of the frontend changes; any previously written drafts remain inert keys in `localStorage` (harmless).

## Open Questions

- Whether auto-close should only trigger when the cursor is preceded by whitespace or start-of-line (word-boundary gating). Deferrable: adjust the marker table/heuristics later without changing specs.
- Whether the "Discard draft" affordance should also apply to the Add form (where there is no saved item content). Resolvable at implementation with a sensible default (discard → empty content).
