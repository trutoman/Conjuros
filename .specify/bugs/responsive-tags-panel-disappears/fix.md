# Bug Fix Report: responsive-tags-panel-disappears

## Scope

Apply the remediation defined in `assessment.md` so that narrow viewports no longer hide access to tags controls and instead render tags panel in a stacked, visible layout.

## Files Changed

- `src/web/pages/CollectionPage.tsx`
- `src/web/index.css`
- `src/web/pages/__tests__/CollectionPage.test.tsx`

## Implementation Details

1. Added responsive viewport state in `CollectionPage`:
   - Introduced `MOBILE_BREAKPOINT_PX = 768`.
   - Added `isNarrowViewport` state updated by a `resize` listener.
   - Computed `effectiveSidebarOpen` to force expanded sidebar when viewport is narrow.

2. Prevented narrow-layout hidden sidebar behavior:
   - In narrow mode, sidebar is always rendered as expanded.
   - Backdrop rendering is disabled in narrow stacked mode.
   - Sidebar close handler is omitted in narrow mode to avoid rendering close UI there.

3. Converted narrow layout from off-canvas to stacked flow in CSS:
   - `.app-shell-body` switches to column direction at `max-width: 768px`.
   - `.main-content-frame` ordered first, `.app-sidebar` ordered second.
   - `.app-sidebar` no longer uses `position: fixed` + `left: -280px` on narrow viewports.
   - `.tags-sidebar` uses normal flow (`position: static`, full-height constraints removed).
   - `.sidebar-backdrop` and `.sidebar-close` are hidden for stacked narrow layout.

4. Added regression tests:
   - Verifies that narrow viewport keeps sidebar expanded even when persisted preference is collapsed.
   - Verifies close-sidebar control is not rendered in narrow stacked layout.
   - Added `localStorage.clear()` in test teardown to isolate persisted state.

## Deviations from Assessment

- No scope deviations.

## Verification Evidence

- `npx vitest run src/web/pages/__tests__/CollectionPage.test.tsx src/web/components/__tests__/Sidebar.test.tsx`
  - Result: 2 test files passed, 21 tests passed.
- `npm run lint`
  - Result: passed.

## Outcome

The responsive bug is fixed: on narrow widths, users keep visible access to the tags panel, and layout now stacks as requested (collection section first, tags panel below).
