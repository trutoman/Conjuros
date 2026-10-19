## Context

`CollectionPage` already tracks a `MOBILE_BREAKPOINT_PX = 768` and a `isNarrowViewport` flag, and the stylesheet already turns `.app-sidebar` into an off-canvas panel (`position: fixed; left: -280px`) with a `.sidebar-backdrop` inside the `@media (max-width: 768px)` block. Before this change, a narrow viewport forced that panel expanded and stacked above the collection (`shouldForceExpandedSidebar`), so the sidebar always occupied the layout. The persisted preference lives in `localStorage` under `conjuros_sidebar_open`. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**

- Make the existing sidebar panel behave as an on-demand drawer on narrow viewports, without adding a new component or dependency.
- Keep desktop expand/collapse and its persistence exactly as they are.
- Collapse the contradictory `650px` and `768px` media blocks into one narrow breakpoint.

**Non-Goals:**

- Building a new drawer/dialog primitive, focus trap, or animation system.
- Changing the `Sidebar` props contract or the tags filtering behavior.
- Any API, contract, or persistence change.

## Decisions

- **Reuse `.app-sidebar` as the drawer.** The `768px` block already positions it off-canvas and styles `.sidebar-backdrop`, so showing it conditionally is enough. A separate drawer component would duplicate markup and the `Sidebar` props wiring for no benefit. Alternative considered: a `Modal`-based drawer — rejected because the tag panel is a navigation surface, not a modal form, and `Modal` would add a second focus/label contract.
- **Track drawer open state separately (`isMobileDrawerOpen`).** The narrow drawer must not touch `conjuros_sidebar_open`, otherwise opening tags on a phone would also change the desktop preference. The drawer state starts `false` on every load, which satisfies the "not persisted" scenario. Alternative considered: reuse `isSidebarOpen` and skip the `localStorage.setItem` on narrow — rejected because the persisted value would still be read and make the mobile default depend on the last desktop session.
- **Gate rendering with `showSidebar = !isNarrowViewport || isMobileDrawerOpen`.** This removes the collapsed-but-rendered sidebar from the narrow layout entirely (matching the "not rendered" scenario) while leaving wide viewports untouched.
- **Keep `effectiveSidebarOpen` forced `true` on narrow.** The drawer always renders in its expanded form; `stacked-mobile` stays on the wrapper so the existing narrow styling keeps targeting it.
- **Dismiss through the existing paths.** The drawer's close control passes `onClose`, the backdrop calls `handleToggleSidebar`, and `Sidebar`'s `Escape` handler calls `onToggleOpen`. `handleToggleSidebar` short-circuits to `closeMobileDrawer()` on narrow, so all three routes converge without new listeners.
- **One breakpoint (`768px`).** The two duplicated `@media (max-width: 650px)` blocks are deleted; the narrow rules they carried (topbar stacking, filter-bar single column, full-width collection rows, title sizing) are covered by the `768px` block, and the obsolete `650px` add-button sizing rule (and the CSS-text test asserting it) is dropped.
- **Pin item inline content to a single truncated line.** `.item-inline-content` truncation moves to `.item-card .item-inline-content` with `overflow-wrap: normal` and `word-break: normal` so no inherited word-breaking style can wrap it. This is a no-op for current markup (the class only appears inside item cards) and exists as hardening.

## Risks / Trade-offs

- [Backdrop renders only when the drawer is shown and expanded] → `{showSidebar && effectiveSidebarOpen && ...}` keeps the backdrop from lingering after the drawer closes; the updated tests cover open/close.
- [Narrow drawer state can outlive a resize to desktop] → `showSidebar` ignores `isMobileDrawerOpen` above the breakpoint, so a stale `true` has no effect on wide layouts; it is also cleared on the next narrow toggle.
- [Removing the `650px` blocks could drop a rule that only existed there] → The `768px` block already redefines the same selectors; `npm run check` (lint/test/build) plus the updated `CollectionPage` tests guard the behavior.
