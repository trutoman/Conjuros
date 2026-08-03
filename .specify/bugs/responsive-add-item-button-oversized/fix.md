# Bug Fix Report: responsive-add-item-button-oversized

## Scope

Apply the responsive remediation so the `add-item-button` keeps a bounded, intentional size on narrow viewports and no longer expands into an oversized square.

## Files Changed

- `src/web/index.css`
- `src/web/pages/__tests__/CollectionPage.test.tsx`

## Implementation Details

1. Added narrow-breakpoint button size override in `src/web/index.css` (`@media (max-width: 650px)`):
   - `align-self: flex-start`
   - `width: 2.75rem`
   - `height: 2.75rem`
   - `aspect-ratio: auto`
   - `padding: 0`
   - `font-size: 1.7rem`

2. Kept desktop/tablet baseline behavior unchanged:
   - Existing default `.collection-subheader .add-item-button` rule remains intact for larger widths.

3. Added regression test in `src/web/pages/__tests__/CollectionPage.test.tsx`:
   - `defines bounded add button size at narrow breakpoint`
   - Verifies CSS contains explicit bounded mobile declarations for the add button.

## Deviations from Assessment

- No scope deviations.

## Verification Evidence

- `npx vitest run src/web/pages/__tests__/CollectionPage.test.tsx`
  - Result: 1 test file passed, 13 tests passed.
- `npm run lint`
  - Result: passed.
- `npm run check`
  - Result: passed (`lint + vitest run + build`)
  - Full suite: 23 test files passed, 104 tests passed.

## Outcome

The responsive add button no longer scales to a giant size at narrow widths. It now keeps a compact fixed size and no longer displaces the collection content excessively.
