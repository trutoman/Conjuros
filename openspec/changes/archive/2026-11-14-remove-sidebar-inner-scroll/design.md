# Design

## Context

See proposal.md and the capability delta. Today `.tags-sidebar` combines `height: max-content` with `max-height: calc(100vh - 4rem)`, `position: sticky`, and `overflow: hidden`, while `.sidebar-content` is `flex: 1; overflow-y: auto`. The height cap plus the flex child's auto overflow is what produces the inner scrollbar. On narrow viewports `.app-sidebar .tags-sidebar` overrides the cap with `height/max-height: 100vh` inside a fixed drawer.

## Goals / Non-Goals

**Goals:**

- Make `.sidebar-content` never a scroll container on any viewport.
- Let the document own vertical scrolling on wide viewports, with the page growing to the taller column.
- Keep the narrow drawer usable when its content exceeds the window.

**Non-Goals:**

- Changing the sidebar's width, collapse behavior, category grouping, or tag controls.
- Changing the mobile drawer's overlay, backdrop, or open/close behavior.
- Making the sidebar as tall as the collection by force (only the natural max of both columns matters).

## Decisions

**1. Remove the height cap and the sticky behavior together**

Drop `max-height` and `position: sticky; top: 1rem` from `.tags-sidebar`. Removing only the cap would leave a sticky element taller than the viewport pinned at the top, with its lower part unreachable while the page scrolls. Removing only sticky would keep the cap and therefore the inner scrollbar. A JS measurement that enables sticky only when the content fits was rejected: it adds runtime layout work and a resize/observer path for a purely visual preference.

**2. Make the content region non-scrolling**

Change `.sidebar-content` to `overflow-y: visible`. Because the parent no longer has a height cap, the content simply flows and the sidebar's natural height becomes the flex item's height. `.app-shell-body` already uses `align-items: flex-start`, so each column keeps its own height and the page grows to the larger one.

**3. Keep the narrow drawer itself as the scroll surface**

In the mobile media query, `.app-sidebar .tags-sidebar` keeps `height: 100vh` and gains `overflow-y: auto` (overriding the base `overflow: hidden`). The drawer is the single scrolling surface, so the overlay stays a fixed full-height panel while its content remains reachable, and `.sidebar-content` still never scrolls. A drawer that grows past `100vh` was rejected: it is fixed-positioned, so the page scroll cannot reveal content beyond the viewport.

## Risks / Trade-offs

- **Users who relied on the sidebar staying pinned while scrolling a long collection lose that.** → Accepted by request: the sidebar now scrolls with the page. Short sidebars move out of view together with the collection.
- **A very large tag list makes the page considerably taller.** → Expected: the page scrollbar is the permitted scroll surface and every tag stays reachable.
- **Mobile drawer scrollbars can be visually heavy on some platforms.** → Only the drawer scrolls there; desktop never shows an inner scrollbar.
- **`overflow: hidden` on `.tags-sidebar` still clips decorative overflow on desktop.** → Height is content-driven, so nothing is clipped; the radius stays clean. The narrow override replaces it with `auto`.

## Migration Plan

CSS-only change shipped with the web bundle. Rollback is a revert of the stylesheet edit; no data or API impact.
