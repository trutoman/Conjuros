## Why

Two dismiss controls rely on text-only affordances where users expect a conventional close control:

- The Add tag form is only dismissible via its `Cancel` button in the form actions row.
- The tag management view uses a text `← Collection` button to return to the collection view.

Both should expose a borderless floating "X" close button.

## What Changes

- Add a floating, borderless close button showing an "X" in the top-right corner of the Add tag form. It closes the form and returns to the previous view, matching the existing `Cancel` button behavior.
- Replace the `← Collection` button in the tag management view (`tag-management-view`) with a floating, borderless close button showing an "X" in the top-left corner of the view. It returns to the collection view, matching the replaced button's behavior.
- Both buttons have no visible frame and are announced to assistive technology via accessible labels.
- No changes to form data handling, validation, save behavior, or the remaining `Cancel` buttons.

## Capabilities

### New Capabilities

### Modified Capabilities
- `tag-management`: The Add tag form gains a floating top-right close button that dismisses the form and returns to the previous view (equivalent to `Cancel`); the tag management view replaces its `← Collection` control with a floating top-left close button that returns to the collection view.

## Impact

- `src/web/components/TagForm.tsx`: add the close button and wire it to the existing `onCancel` handler.
- `src/web/pages/CollectionPage.tsx`: replace the `← Collection` button in the tag management view with a close button wired to `closeManageTags`.
- `src/web/index.css`: style the shared borderless floating close button (`.form-close`) positioned in the form's top-right corner, with a top-left variant for the tag management view.
- Frontend component tests for `TagForm` and the tag management flows in `CollectionPage`.
- No API, contract, or data layer changes.
