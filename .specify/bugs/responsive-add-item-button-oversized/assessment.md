# Bug Assessment: responsive-add-item-button-oversized

## Input Report

Original report (translated summary):
At a narrow responsive width (minimum allowed), the `add-item-button` (`+`) becomes gigantic and takes almost the full screen, pushing collection content down. The button should keep a stable size regardless of viewport width.

## Verdict

- Status: confirmed
- Confidence: high
- Type: responsive layout regression
- Severity: major (primary action dominates viewport and degrades content usability)

## Reproduction

1. Open Collection page.
2. Resize viewport to a narrow width (`<= 650px`).
3. Observe the `+` add button in the collection subheader.

Observed result:
- The add button scales to a very large square and can consume most of the visible width/height area in the header zone.
- Collection content is pushed downward, harming scanability and usability.

Expected result:
- The add button keeps an intentional, bounded size on all breakpoints.
- Narrow layout should not allow the button to dominate the viewport.

## Suspected Root Cause

A rule interaction in `src/web/index.css` causes the oversized rendering on narrow widths:

1. Base rule for `.collection-subheader .add-item-button` sets:
   - `aspect-ratio: 1 / 1`
   - `align-self: stretch`
2. Narrow breakpoint (`@media (max-width: 650px)`) changes `.collection-subheader` to:
   - `flex-direction: column`
   - `align-items: stretch`
3. In column layout, stretched cross-axis sizing can expand button width to container width; with `aspect-ratio: 1 / 1`, height follows width, yielding a giant square button.

## Scope and Impact

- Affected area: Collection page subheader layout on mobile/small screens.
- Accessibility impact: oversized control creates poor visual hierarchy and can reduce immediate access to list content.
- Data/security impact: none.

## Proposed Remediation

1. Override button sizing for narrow breakpoint (`<= 650px`):
   - remove stretch behavior (`align-self: flex-start` or center)
   - set explicit bounded size (`width`/`height` or `inline-size`/`block-size`)
   - optionally remove or override `aspect-ratio` for mobile if explicit size is used.
2. Keep desktop/tablet behavior unchanged.
3. Verify resulting control remains tap-friendly while compact.

## Test Plan (for fix stage)

- Add a responsive regression test validating the button does not use stretch-driven oversized dimensions in narrow layout.
- Verify collection content remains visible above the fold on narrow viewport after fix.
- Run focused page tests and full project checks (`npm run check`).

## Notes

This assessment intentionally did not modify application source code. Changes belong to `speckit.bug.fix` stage.
