## Why

The sidebar's clear icon appears in a different color from the adjacent controls, making the header visually inconsistent. On narrow viewports, the topbar Tags control also spends space on a visible label when the user wants an icon-only compact control.

## What Changes

- Make the sidebar clear icon use the same theme-derived color as the neighboring sidebar header icons.
- On narrow viewports, show only the tags artwork in the topbar Tags button while retaining an accessible name for assistive technology.
- Keep the wide layout, button actions, and accessible behavior unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `collection-layout-and-navigation`: Require consistent clear-icon coloring in the sidebar header and an icon-only visible Tags control on narrow viewports.

## Impact

- Sidebar header and narrow topbar presentation in the frontend.
- Related component, responsive-style, and accessibility tests.
- No API, persistence, or dependency changes.
