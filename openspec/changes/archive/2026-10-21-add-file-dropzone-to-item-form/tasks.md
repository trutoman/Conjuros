## 1. File Drop Zone Component

- [x] 1.1 Create `src/web/components/FileDropZone.tsx` with `onFileLoaded(fileName, content)` and an accessible `role="button"` surface plus a hidden `<input type="file">`
- [x] 1.2 Implement dragenter/dragover/dragleave/drop handling with `preventDefault`, a drag-depth counter, and a visible active-drag state
- [x] 1.3 Process exactly one file per drop or picker selection: read it as text (`file.text()` with a `FileReader` fallback) and call `onFileLoaded(file.name, text)`
- [x] 1.4 Reject multiple files and read failures with friendly messages, leaving `onFileLoaded` uncalled so current form values stay unchanged
- [x] 1.5 Show a polite live status naming the loaded file, clear prior errors on success, and reset the picker input value after each selection
- [x] 1.6 Make the zone keyboard operable: focusable, Enter and Space open the picker, and the control exposes an accessible name

## 2. Item Form Integration

- [x] 2.1 In `src/web/components/ItemForm.tsx`, render the drop zone only when `item === undefined` and `kind === 'file'`
- [x] 2.2 Wrap the tag fieldset and drop zone in an `.item-form-footer` row for that branch, leaving the tag fieldset markup and every other kind's layout unchanged
- [x] 2.3 Wire `onFileLoaded` to the existing `setFilename` and `setContent` state setters so both fields update and remain editable

## 3. Styling

- [x] 3.1 Add `.item-form-footer` as a two-column grid with tags on the left and the drop zone on the right, and collapse it to one column at the narrow breakpoint
- [x] 3.2 Add `.file-drop-zone` styles using existing theme tokens: dashed border, muted hint text, drag-over tint, status text, and error text
- [x] 3.3 Verify the hidden picker input uses the existing `.visually-hidden` utility and that the tag pills keep their current appearance

## 4. Tests

- [x] 4.1 Test that the drop zone renders for a new `file` item, is absent for `spell`/`web-link`/`markdown`, and is absent in the edit form
- [x] 4.2 Test that dropping a text file fills Filename with the full name including extension and Content with the exact text, including line breaks
- [x] 4.3 Test that a second drop replaces the previously loaded filename and content
- [x] 4.4 Test the picker path (`change` on the hidden input) loads the chosen file and that the same file can be selected again
- [x] 4.5 Test that dropping multiple files shows the single-file message and leaves both fields unchanged
- [x] 4.6 Test that a read failure shows an error and leaves both fields unchanged
- [x] 4.7 Test keyboard activation opens the picker and that the drag-over state appears and clears
- [x] 4.8 Test that the loaded file name is exposed in a live status message
- [x] 4.9 Test that an over-128-character dropped name is kept in Filename and saving reports the existing friendly file filename message

## 5. Verification

- [x] 5.1 Run `npm run check` and resolve any lint, test, or build failures
