## Why

The sidebar footer exposes an "Add tag" button that opens the tag form inline in the collection frame, duplicating the tag creation entry point already available inside the tag management view. Keeping two entry points to the same form creates ambiguity about where tags are created. The tag management view also renders a redundant "Tags" heading inside the tags panel below the "Manage tags" heading of the tag management header, so the view shows two titles for one list.

## What Changes

- Remove the "Add tag" button from the sidebar footer in `src/web/components/Sidebar.tsx`, along with its `onAddTag` prop and its wiring in `src/web/pages/CollectionPage.tsx`.
- Remove the now-unreachable inline tag form branch in `CollectionPage.tsx` and the `openTagForm` helper that only served that button.
- Remove the "Tags" heading (`<h2>Tags</h2>`) from the tags panel in `src/web/components/TagList.tsx`, so the tag management view shows a single heading: the "Manage tags" heading of the tag management header.
- Delete tests that cover the removed sidebar add-tag flow (`src/web/pages/__tests__/CollectionPage.inlineTag.test.tsx`).
- Tag creation remains available through the "Add tag" button in the tag management view header.

## Capabilities

### New Capabilities
<!-- No new capabilities -->

### Modified Capabilities
- `tag-management`: The sidebar footer no longer provides a direct "Add tag" entry point (inline tag creation is removed); the tags panel in the tag management view no longer renders its own "Tags" heading, leaving the "Manage tags" heading of the tag management header as the single title.

## Impact

- `src/web/components/Sidebar.tsx`: remove the `onAddTag` prop and the sidebar footer "Add tag" button.
- `src/web/pages/CollectionPage.tsx`: remove the `onAddTag` prop pass to `Sidebar`, remove the `openTagForm` helper, and remove the inline (non-manage) tag form branch.
- `src/web/components/TagList.tsx`: remove the `Tags` heading from the tags panel.
- `src/web/pages/__tests__/CollectionPage.inlineTag.test.tsx`: delete, as it covers the removed sidebar add-tag flow.
- No API, contract, or data layer changes.
