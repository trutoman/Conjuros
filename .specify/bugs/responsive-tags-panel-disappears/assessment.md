# Bug Assessment: responsive-tags-panel-disappears

## Input Report

Original report (translated summary):
When viewport width reaches a certain narrow range and the tags panel is in reduced mode, the panel disappears completely and the Tags button reference is no longer visible. Expected behavior on very narrow displays is to stack layout vertically: collection panel first, then an expanded tags panel below it.

## Verdict

- Status: confirmed
- Confidence: high
- Type: responsive layout regression
- Severity: major (core filtering controls become unreachable)

## Reproduction

1. Open Collection page with width <= 768px.
2. Collapse tags sidebar (or load with persisted `conjuros_sidebar_open=false`).
3. Observe tags sidebar area.

Observed result:

- Sidebar container is moved off-screen to the left.
- No visible on-screen control remains to re-open tags from the collection viewport.

Expected result:

- On narrow screens, users must still have an always-reachable tags entry point.
- For very narrow widths, layout should switch to vertical stacking with collection first and tags panel expanded below.

## Suspected Root Cause

1. Mobile media query forces `.app-sidebar` into an off-canvas pattern:
   - `position: fixed`
   - `left: -280px`
   - visible only when `.expanded` sets `left: 0`
2. The collapse/expand state currently drives both desktop reduced mode and mobile visibility.
3. When collapsed in mobile range, the entire sidebar leaves viewport, including the internal `tags-toggle-btn` control.

Primary files involved:

- `src/web/index.css` (mobile media query and sidebar positioning)
- `src/web/pages/CollectionPage.tsx` (isSidebarOpen persistence and class toggling)
- `src/web/components/Sidebar.tsx` (internal toggle lives inside sidebar, so it disappears with container)

## Scope and Impact

- Affected area: Collection filtering UX on mobile and narrow tablet widths.
- Accessibility impact: users cannot discover or reach tag filters once sidebar is collapsed off-canvas.
- Data integrity/security impact: none.

## Proposed Remediation

1. Split responsive behavior by breakpoint:
   - Desktop/tablet wide: keep reduced/expanded sidebar behavior.
   - Narrow viewport: disable off-canvas hidden state and render sidebar in document flow below collection.
2. Add/adjust CSS breakpoint rules so narrow layout becomes vertical stack:
   - parent body uses column flow.
   - `.main-content-frame` first, tags sidebar block second.
   - sidebar width set to 100%, sticky disabled for stacked mode.
3. Force tags panel open in stacked mobile mode (or ignore collapsed state there), ensuring controls are always visible.
4. Preserve desktop persisted preference without applying hidden off-canvas behavior at narrow breakpoints.

## Test Plan (for fix stage)

- Unit test: verify responsive class/state logic does not hide all tags controls at narrow width.
- UI behavior checks:
  - wide viewport: reduced mode still works.
  - narrow viewport: collection appears first, tags panel visible below and expanded.
  - resize transitions between breakpoints keep sidebar usable.
- Run project validation command (`npm run check`) and relevant web tests.

## Notes

This assessment intentionally did not modify application source code. Changes belong to `speckit.bug.fix` stage.
