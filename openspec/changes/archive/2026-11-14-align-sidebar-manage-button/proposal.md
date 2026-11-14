# Proposal

## Why

The `Manage tags` (settings) control sits immediately after the tag match selector in the sidebar header, so the row looks left-heavy and the settings action is easy to miss in the middle of the button strip. Nothing pushes it toward the end of the row.

## What Changes

- Add a dedicated `tags-manage-btn` class to the sidebar settings button and give it `margin-left: auto`, so the free space in the header row is absorbed and the button is pushed to the end of the row.
- Keep the existing header order otherwise: the tags toggle, the clear button, and the match selector stay where they are, and the narrow-viewport close button remains the rightmost control after the settings button.
- Record the end-alignment as a requirement of the `collection-layout-and-navigation` capability.

## Capabilities

### New Capabilities

<!-- None: sidebar header layout is already covered. -->

### Modified Capabilities

- `collection-layout-and-navigation`: the `Manage tags` control must sit at the end of the sidebar header row.

## Impact

- Frontend: one class added in `src/web/components/Sidebar.tsx` and one rule in `src/web/index.css`.
- No contract, API, data, or behavior changes; the button keeps its accessible name and action.
- Tests: existing `Sidebar` and collection tests keep passing (they query roles and accessible names). Alignment is visual, so verification adds a browser measurement of the button's right edge against the header's padding edge.
