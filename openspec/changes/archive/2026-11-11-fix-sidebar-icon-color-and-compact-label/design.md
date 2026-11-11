## Context

See proposal.md for motivation. The sidebar clear action is an icon-only button in the header, and the collection topbar provides a Tags drawer button at the narrow viewport breakpoint with an existing accessible label.

## Goals / Non-Goals

**Goals:**
- Keep the clear icon visually consistent with neighboring controls under the active theme.
- Reduce the narrow topbar button to its icon without losing its accessible name or interaction state.

**Non-Goals:**
- Change tag clearing or drawer interaction behavior.
- Change the wide topbar or desktop sidebar layout.

## Decisions

- Use the shared theme-derived control color for the clear icon instead of an icon-specific warning/danger tint. This matches the neighboring controls and keeps the appearance coherent across themes.
- Remove or visually hide only the topbar button's visible text at the narrow breakpoint, relying on its existing accessible name. This keeps the compact presentation while preserving its screen-reader label and button semantics; removing the accessible name is not an alternative.
- Keep the icon sourced from the active theme's `tags` asset and retain existing expanded-state and panel associations.

## Risks / Trade-offs

- [Hiding visible button text could also hide its accessible name if implemented as a content-only change] → Verify the button remains discoverable by its accessible name and continues exposing expanded/control attributes.
- [Changing clear-button color could reduce contrast in a theme] → Use the same theme-derived color as neighboring controls and validate existing themed rendering.
