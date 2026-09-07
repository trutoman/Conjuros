## Why

The sidebar `Clear` button icon does not display correctly: it renders blank (or nearly invisible). The `clear` artwork lives on Material's 960-unit grid (`viewBox="0 -960 960 960"`) while every icon is rendered through the shared `.icon` styling (`fill: none; stroke: currentColor; stroke-width: 1.8`). A 1.8-unit stroke on a 960-unit grid displays at roughly 0.03 px — sub-pixel and effectively invisible — and `fill: none` removes the filled areas the artwork was designed with.

## What Changes

- The `clear` artwork is rescaled from the 960-unit grid to the shared 24-unit grid (`viewBox="0 0 24 24"`), preserving the exact supplied geometry (x / 40, (y + 960) / 40), so the shared stroke styling renders it at the same visual weight as every other icon.
- Stored themes carrying either previous `clear` artwork (the outline redrawing or the 960-grid verbatim path) converge on the rescaled artwork via read normalization plus backfill; admin-customized values are still preserved.
- Button markup, label ("Clear" above the icon), placement, and disabled/deselect behavior are unchanged.

## Capabilities

### New Capabilities

- None — this change fixes the rendering of an existing behavior.

### Modified Capabilities

- `theme-icon-storage`: `iconAssets.clear` artwork moves to the 24-unit grid with geometry identical to the supplied SVG; read normalization and backfill migrate both superseded variants without touching customizations.

## Impact

- Frontend: `ICON_ASSETS.clear` defaults only (no markup or style change).
- Backend: backfill/read-normalization superseded-artwork rule extended to both previous variants.
- Tests: icon artwork assertions (viewBox, rescaled geometry), migration tests for both old variants plus custom preservation.
