## Why

The Add item form is only dismissible via its `Cancel` button in the form actions row. The Add tag form and the tag management view already expose a floating "X" close button in the top-right corner, so the item form is inconsistent with the rest of the collection experience.

## What Changes

- Add a floating, borderless close button showing an "X" in the top-right corner of the Add item form (and the Edit item form, which uses the same component). It closes the form and returns to the previous view, matching the existing `Cancel` button behavior.
- The button has no visible frame and is announced to assistive technology via an accessible label.
- No changes to form data handling, validation, save behavior, or the remaining `Cancel` button.

## Capabilities

### New Capabilities

### Modified Capabilities
- `collection-management`: The item form (Add item and Edit item) gains a floating top-right close button that dismisses the form and returns to the previous view (equivalent to `Cancel`).

## Impact

- `src/web/components/ItemForm.tsx`: add the close button and wire it to the existing `onCancel` handler.
- `src/web/index.css`: reuse the existing shared `.form-close` style already used by the tag form and tag management view.
- Frontend component tests for `ItemForm` and the collection page flows in `CollectionPage`.
- No API, contract, or data layer changes.
