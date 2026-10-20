## Context

The Add item form is rendered by `src/web/components/ItemForm.tsx` and is reused for both creating and editing items. For kind `file` it already shows a Filename input and a plain Content textarea. The tag fieldset sits directly above the action buttons, leaving unused horizontal space to its right. The project has no upload endpoint: a `file` item is plain text stored in `content` with a `filename`, so a dropped file only needs to populate those two form fields client-side. Requirements are in `specs/collection-management/spec.md`; motivation is in `proposal.md`.

## Goals / Non-Goals

**Goals:**
- Add a file-only drop zone to the create flow without changing the shape of the item payload.
- Reuse the existing file filename/content validation instead of duplicating rules in the drop zone.
- Keep the control usable by mouse, touch, and keyboard, with visible drag feedback and assistive status.
- Keep `ItemForm` readable by isolating drop behavior in a small component.

**Non-Goals:**
- No upload endpoint, multipart request, or server-side file handling.
- No drop zone in the edit form, no multi-file queue, no progress indicator.
- No changes to contracts, API, repositories, or persistence.
- No binary/file-type sniffing beyond decoding the file as UTF-8 text.

## Decisions

### D1 — Extract a focused `FileDropZone` component

Add `src/web/components/FileDropZone.tsx` that owns drag state, the hidden file input, the status message, and the error message. It exposes `onFileLoaded(fileName: string, content: string)` to the parent.

Rationale: `ItemForm` already owns markdown drafts, previews, validation, and submit state. Keeping DOM drag events and async file reads out of it limits the change surface and lets the drop zone be tested directly. Alternative rejected: inline handlers in `ItemForm`, which would add several refs and states to an already large component.

### D2 — Place the zone beside tags in a dedicated footer row

For the Add form with kind `file`, wrap the existing tag fieldset and the drop zone in `.item-form-footer`, a two-column grid (tags left, drop zone right). The action buttons stay immediately after this row. Below a narrow breakpoint the grid collapses to one column so the drop zone stacks under the tags.

Rationale: matches the requested layout, keeps the existing tag fieldset markup and accessible legend, and leaves every other kind's layout untouched. Alternative rejected: absolutely positioning the drop zone, which would break with long tag lists and narrow screens.

### D3 — Show the zone only when `item === undefined` and `kind === 'file'`

`ItemForm` already distinguishes create from edit by the presence of `item`. The footer grid is used only for that combination; otherwise the tag fieldset renders exactly as today.

Rationale: the request targets creating an item, and an edit form already has stored values that are cheaper to adjust by hand than to replace wholesale. The zone is also absent when the user switches between kinds in both forms, so no stale markup remains.

### D4 — Read through `File.text()` with a `FileReader` fallback

The drop handler takes `dataTransfer.files`; the picker handler takes `input.files`. Both require exactly one file. A small `readFileText` helper uses `await file.text()` when available and otherwise wraps `FileReader.readAsText` in a promise. The component then invokes `onFileLoaded(file.name, text)`, and `ItemForm` sets `filename` and `content` with its existing state setters. After a picker selection the input value is reset so choosing the same file again still fires `change`.

Rationale: every supported browser decodes `File.text()` as UTF-8, matching the plain-text item model. The fallback keeps the component testable and working in jsdom 26, which does not implement `Blob.text()`. Keeping values in existing form state means submission, validation, and draft behavior are unchanged.

### D5 — Reject multiple files and read failures without touching current values

If `files.length !== 1`, show "Drop a single file" and return. If `file.text()` rejects, show "That file could not be read" and return. In both cases the component reports the error and never calls `onFileLoaded`, so the current Filename and Content remain intact. Successful loads clear the error and set a status naming the file. Filename length and separator rules stay in the existing `messageForInputError` path, so an invalid dropped name is accepted into the field and rejected on save with the established friendly message.

Rationale: a single, predictable failure path avoids partial updates and keeps validation rules in one place. Alternative rejected: validating the name in the drop zone, which would duplicate `fileFilenameSchema` rules.

### D6 — Drag events and accessibility

The zone is a `role="button"` with `tabIndex={0}` and an accessible label; Enter and Space open the hidden input. `dragenter`/`dragover` call `preventDefault` and mark the active state; `dragleave` clears it using a drag-depth counter so moving over child text does not flicker; `drop` clears it before processing. The hidden input uses the existing `.visually-hidden` class. Status uses a polite live region and errors use `role="alert"`.

Rationale: file drops are a pointer affordance, but the same outcome must remain available without a mouse. A depth counter is more reliable than checking `relatedTarget` for a zone with nested text.

### D7 — Styling uses theme variables

The drop zone uses existing theme tokens (`--border-strong`, `--surface`, `--page-bg-accent`, `--primary`, `--text-muted`, `--danger`) for its dashed border, muted hint, active drag tint, status, and error. No new palette values or animations are introduced.

Rationale: keeps every theme consistent without adding theme-specific assets.

## Risks / Trade-offs

- **Large files** can consume memory and freeze the form while decoding → No artificial cap is added because item content has no server-side limit; the user can clear or replace the fields. A future size guard can be added without changing the API.
- **Binary files** decode to replacement characters rather than failing → The drop zone only fulfills the plain-text contract; users see the decoded text in the editable Content field before saving. File-type sniffing is intentionally out of scope.
- **Overwriting typed content** when a file is dropped into a partially filled form → The drop is an explicit action and the fields remain editable afterward; no confirmation is added to keep the flow fast.
- **Layout regression for the file form** from wrapping the tag fieldset → The footer grid applies only to the create+file branch, and the narrow breakpoint stacks the columns.
- **Test environment file decoding** differs from browsers because jsdom 26 lacks `Blob.text()` → `readFileText` falls back to `FileReader`; tests assert on the resulting field values rather than on a specific reader implementation.

## Migration Plan

This is a frontend-only change with no data or API migration. It ships with the normal web build; rollback is a revert of the component, form, and CSS changes.
