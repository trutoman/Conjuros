# Proposal

## Why

The tags sidebar is capped at the viewport height, so when a user has many tags the `.sidebar-content` region turns into its own scroll pane: a second scrollbar appears inside the sidebar, traps the tag list in a short window, and makes browsing tags fight with scrolling the collection. The page is the natural place to scroll.

## What Changes

- Remove the sidebar's viewport height cap on wide viewports and stop making its content region a scroll container: `.sidebar-content` SHALL never show a scrollbar.
- Remove the `sticky` behavior of the tags sidebar so a sidebar taller than the window scrolls with the page instead of pinning and leaving its lower part unreachable.
- Let the page own vertical scrolling: the taller of the sidebar and the item collection determines the page height, and the browser window shows the only scrollbar.
- On viewports at or below the mobile breakpoint the sidebar is an overlay drawer; it keeps its full-viewport height and, when its content does not fit, the drawer itself scrolls as one unit — still never `.sidebar-content`.

## Capabilities

### New Capabilities

<!-- None: sidebar behavior is already covered. -->

### Modified Capabilities

- `collection-layout-and-navigation`: the sidebar must not scroll its content region internally; page-level scrolling replaces it on wide viewports, and the narrow drawer scrolls as a whole.

## Impact

- Styles only: `src/web/index.css` — `.tags-sidebar` (drop `max-height` and `position: sticky`, keep `height: max-content`), `.sidebar-content` (`overflow-y: visible`), and the narrow override (make `.tags-sidebar` the scroll container at `100vh`).
- No component markup, contract, API, or data changes.
- Existing layout and sidebar tests are unaffected; verification adds browser measurement of the sidebar's scroll geometry (content `scrollHeight` vs `clientHeight`) on wide and narrow viewports.
