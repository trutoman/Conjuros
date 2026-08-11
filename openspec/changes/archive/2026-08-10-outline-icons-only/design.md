## Context

Today the icon language is split. The stylesheet defines `.icon` (stroke-based: `fill: none; stroke: currentColor; stroke-width: 1.8`) and a modifier `.icon.icon-filled` (`fill: currentColor; stroke: none`). `ItemCard` renders every item-action icon with `filled`, the search icons in `CollectionPage`/`TagsPage` use `icon icon-filled`, and `TagList` marks its icons `filled`. All icon path data lives in `src/web/lib/iconAssets.ts` (`ICON_ASSETS`, `THEME_MANAGEMENT_ICONS`) — a mix of Material-style filled paths (viewBox `0 -960 960 960`) and Feather-style stroke paths (viewBox `0 0 24 24`). A separate in-flight change (`svg-icons-from-themes`) moves icon definitions into theme documents; this change governs the *style* of those definitions regardless of where they are stored.

## Goals / Non-Goals

**Goals:**
- One outline icon style everywhere: stroke-based rendering, no filled silhouettes.
- Review and convert all icon definitions in `ICON_ASSETS` and `THEME_MANAGEMENT_ICONS` to outline variants.
- Same rendered size and meaning per icon; color stays theme-driven via `currentColor`.
- Retire the `icon-filled` CSS rule and the `filled` props once unused.

**Non-Goals:**
- No new icon meanings or inventory changes (icons stay the same set).
- No interaction/behavior changes — this is visual only.
- No changes to icon storage location (covered by `svg-icons-from-themes`); this change applies to the definitions wherever they live.

## Decisions

**Standardize on stroke-based outline paths rendered with `fill: none; stroke: currentColor`.**
Replace each filled Material path with its outlined counterpart (Material Symbols Outlined equivalents where available, Feather/Lucide-style stroke paths elsewhere). The existing `.icon` class already implements exactly this rendering, so no new CSS primitive is needed.
- Alternative: keep Material filled paths but tint them per theme. Rejected — violates the no-fill requirement and keeps two rendering modes.
- Alternative: `fill: currentColor` on outlined-shape paths (some outlined icons are still `fill`-based geometry). Rejected — the requirement is stroke-based line icons; stroke rendering gives consistent line weight across the set.

**Delete the `filled` escape hatch rather than leaving it dormant.**
Remove the `.icon.icon-filled` rule and the `filled?: boolean` props in `ItemCard`'s `Icon` and `TagList`'s icon component. If a future icon needs emphasis, it should be a distinct outline artwork, not a fill toggle.
- Alternative: keep the class for emergencies. Rejected — a dead variant invites style regression.

**Normalize size at the CSS layer, not per icon.**
`.icon` already fixes `width`/`height` (1.1rem) with `overflow: visible`, so mixed viewBoxes (`0 -960 960 960` vs `0 0 24 24`) render at the same visual size. Keep this; do not re-author viewBoxes unless a path requires it.

## Risks / Trade-offs

- **Outline path artwork may read differently at small sizes** (1.1rem) than the filled versions → Convert icons one-by-one and visually compare; prefer the vendor's official outlined variant to keep recognition.
- **The archived `item-card-experience` spec pins exact filled paths for file/view/download icons** → This change supersedes those constraints; the `icon-style` spec states the outline requirement, and implementation updates the affected icons and any tests asserting specific filled paths. Call out the reconciliation in tasks.
- **Interplay with `svg-icons-from-themes`** (icon definitions moving into theme documents) → Whichever change lands second must apply outline definitions in the theme seeds as well; noted as an explicit task in whichever order they merge.