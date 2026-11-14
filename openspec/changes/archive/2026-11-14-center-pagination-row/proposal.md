# Proposal

## Why

The pagination row currently stretches across the full content width: the range counter sits at the far left and the controls at the far right. Both ends read as disconnected from the item list, so the row looks like a page footer rather than part of the collection.

## What Changes

- Center the pagination row's contents horizontally as one group: the `Showing X–Y of N items` counter first, followed immediately by the `Previous`, `Next`, and `Last` buttons.
- Keep the existing behavior: same counter text, same three icon buttons, same disabled boundaries, same placement below the list, and the group may still wrap on narrow viewports without losing its centering.
- Record the centered presentation as a requirement of the `collection-pagination` capability.

## Capabilities

### New Capabilities

<!-- None: the pagination capability already exists. -->

### Modified Capabilities

- `collection-pagination`: the pagination row's content must be centered as a group with the counter before the controls.

## Impact

- Web: `src/web/index.css` only — `.collection-pagination` stops distributing the content between the edges and centers it, keeping the existing gap and narrow-viewport wrap.
- No contract, API, data, or component-markup changes; the DOM order (counter, then buttons) already matches the requested left-to-right arrangement.
- Tests: CSS layout is not observable in jsdom, so verification relies on the existing component/page tests staying green, the production build, and a browser measurement of the rendered geometry.
