## Why

Creating a `file` item currently requires the user to type or paste the file name and its entire contents into the form. Dragging a file from the desktop into the Add item form removes that manual copy step and makes the file item workflow match how users already handle documents.

## What Changes

- Add a file drop zone to the **Add item** form, visible only while the selected item kind is `file`.
- Position the drop zone beside the tag selector, using the empty area to the right of the tag pills; on narrow viewports the tag selector and drop zone stack.
- Accept a single file dragged from the operating system and also allow choosing one through a native file picker for pointer and keyboard users.
- On drop or pick:
  - set `filename` to the dropped file's full name including its extension;
  - set `content` to the file's UTF-8 decoded text.
- Leave both fields editable after loading, and let a later drop replace the previously loaded name and content.
- Show drag-over feedback, an accessible status message naming the loaded file, and a friendly error when the file cannot be read.
- Do not change the API, contracts, persistence, or the edit form.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `collection-management`: the Add item form gains a `file`-only drop zone that populates the Filename and Content fields from a dropped or selected local file.

## Impact

- `src/web/components/ItemForm.tsx`: render the drop zone for new `file` items and own the filename/content updates.
- `src/web/components/FileDropZone.tsx` (new): drag/drop and file-picker behavior, drag state, status and error text.
- `src/web/index.css`: drop zone layout beside the tag selector, drag-over styling, and narrow-screen stacking.
- `src/web/components/__tests__/ItemForm.test.tsx` (or a dedicated `FileDropZone` test): coverage for visibility, drop, picker selection, replacement, status, errors, and accessibility.
- No changes to `packages/contracts`, the API, or the database.
