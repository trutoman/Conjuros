## Why

The "Content - Edit" textarea is a plain controlled input: users must retype lists by hand, cannot indent or dedent, and lose everything typed if the form is closed accidentally. Markdown authors expect editor ergonomics — Tab/Shift+Tab, automatic list continuation and indentation, and automatic closing of Markdown pairs — plus a local draft so work survives a mis-click.

## What Changes

- **Tab** in the edit pane inserts spaces (or indents the selected line) instead of moving focus.
- **Shift + Tab** dedents the current line or selection.
- **Enter** continues Markdown lists (`-`, `*`, `+`, `1.`) and blockquotes (`>`) by inserting a matching marker on the new line; an empty list item terminates the list.
- **Auto-indentation**: new lines keep the indentation of the previous line for lists and quotes.
- **Auto-closing Markdown pairs**: typing an opening marker (`**`, `*`, `_`, `` ` ``, `~`, `[`, `(`, `<`) inserts the matching closing marker and leaves the cursor between them.
- **Local draft autosave**: the current `markdown` content of the form is saved to `localStorage` as the user types and restored when the same form is reopened; the user can discard the draft.
- **Pane growth**: the edit textarea and the preview pane grow together so the full content of both is always visible; the shared height follows whichever pane's content is taller, so viewer growth also grows the editor.
- **Pane alignment**: the edit textarea and the preview pane always start at the same vertical position; showing or hiding the "Discard draft" button must not shift the editor relative to the preview.
- Out of scope for this change: drag & drop image insertion.

## Capabilities

### New Capabilities

- `markdown-editor`: keyboard editing behavior (indent/dedent, list continuation, auto-indentation, auto-closing pairs) and local draft autosave for the Markdown editor.

### Modified Capabilities

- `collection-management`: the "Markdown form splits content into editor and viewer panes" requirement is extended with the new editor editing behaviors and the local draft autosave behavior.

## Impact

- `src/web/components/ItemForm.tsx` — new key handlers on the edit textarea, auto-close logic, and draft save/restore.
- `src/web/index.css` — pane growth and viewer overflow adjustments so both panes stay fully visible.
- Tests: `src/web/components/__tests__/ItemForm.test.tsx`.
- No API changes, no new dependencies (drafts live in `localStorage`; editor logic is hand-written on the controlled textarea).
