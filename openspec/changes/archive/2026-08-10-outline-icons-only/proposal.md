## Why

The UI renders icons in two inconsistent styles: most icons use a stroked, outline style (`.icon` with `fill: none`), while others — item-card actions and the search icon — render filled (`.icon.icon-filled`). The result is a visually mixed icon language where some controls are solid silhouettes and others are line drawings. The icons should be reviewed and unified so every icon is a line (outline) icon with no fill.

## What Changes

- Every SVG icon across the application renders in the outline/line style (stroke-based, `fill: none`); no icon uses the filled silhouette style.
- Review all existing icon definitions (`ICON_ASSETS`, `THEME_MANAGEMENT_ICONS`, inline SVGs) and convert filled glyphs to their outline equivalents, keeping the same meaning and rendered size.
- Remove the `icon-filled` variant and the per-component `filled` props once nothing consumes them.
- Icon color continues to come from `currentColor`/theme CSS custom properties — icons carry no hardcoded color.

## Capabilities

### New Capabilities
- `icon-style`: A single consistent outline icon style across the entire UI, with stroke-based rendering and theme-driven color.

### Modified Capabilities
<!-- None: no existing main spec constrains icon fill style; item-card-experience references specific SVG paths but not fill-vs-outline, and will be reconciled when this change lands. -->

## Impact

- `src/web/lib/iconAssets.ts` — icon path definitions reviewed/converted to outline variants
- `src/web/components/ItemCard.tsx`, `src/web/components/TagList.tsx` — `filled` prop and `icon-filled` usage removed; item action icons switch to outline
- `src/web/pages/CollectionPage.tsx`, `src/web/pages/TagsPage.tsx` — search icon switched from `icon-filled` to outline
- `src/web/components/UserWidget.tsx`, `src/web/components/TagColumnIcon.tsx`, `src/web/components/ThemeForm.tsx`, `src/web/components/Sidebar.tsx` — verify outline style
- `src/web/index.css` — remove the `.icon.icon-filled` rule
- Component tests that assert `icon-filled` class or filled rendering
- Note: coordinates with the in-flight `svg-icons-from-themes` change, which moves icon definitions into themes — whichever lands second reconciles icon definitions so themes also store outline paths