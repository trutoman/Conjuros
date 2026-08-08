## Why

The markdown item form currently shows two synchronized editable textareas (Content - Edit and Content - View), so a user cannot see how their note will look while writing it. Rendering the Markdown live lets users verify formatting before saving, which is the expected authoring experience for notes.

## What Changes

- Add `marked` and `dompurify` as dependencies.
- In the item form, the "Content - View" pane SHALL become a rendered preview instead of an editable textarea: it renders the Markdown from "Content - Edit" in real time as the user types.
- The rendered HTML SHALL be sanitized with DOMPurify before insertion; Markdown is display-only and is never executed.
- "Content - Edit" remains the only editable pane and stays bound to the `content` state.
- Both panes keep the 50/50 split, the doubled initial height, and the "Content - View" label.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `collection-management`: the "Markdown form splits content into editor and viewer panes" requirement changes so the right pane renders sanitized Markdown as a preview (no longer an editable textarea) that updates live from the edit pane.

## Impact

- `package.json`: add `marked` and `dompurify` (and `@types/dompurify` if needed).
- `src/web/components/ItemForm.tsx`: replace the view textarea with a rendered preview (`marked.parse` + `DOMPurify.sanitize`); keep auto-resize of the edit pane, mirror the height to the preview.
- `src/web/index.css`: styles for the preview pane (typography, spacing, equal height with the edit pane).
- `src/web/components/__tests__/ItemForm.test.tsx`: update markdown form tests so the view pane is a rendered preview, not a textarea.
