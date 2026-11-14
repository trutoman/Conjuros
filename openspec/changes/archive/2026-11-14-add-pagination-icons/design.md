# Design

## Context

See proposal.md for motivation and the delta specs for requirements.

Current state that shapes the approach:

- The pagination row was introduced by the archived `add-collection-pagination` change and renders between the filter controls and the list. Its component already computes `totalPages`, the displayed range, and disabled boundaries.
- Icons are theme data, not bundled markup: `Theme.iconAssets` is a contract-validated record keyed by `IconAssetKey`, seeded from `ICON_ASSETS` in `src/web/lib/iconAssets.ts`. `buildIconAssetsRecord` fills missing keys on read, `backfillIconAssets` persists them at startup (`backfillThemeIcons`), and `ThemeForm` renders one editable field per key from `iconAssetKeys`.
- `ThemeIcon` renders a single `<path d>` inside `<svg class="icon">`, whose CSS is `fill: none; stroke: currentColor; stroke-width: 1.8`. The lone filled exception is `settings`, which carries the `icon-settings` class.
- The `icon-style` capability requires outline artwork and no hardcoded color, which is why the supplied filled Material glyphs must be redrawn as strokes.

## Goals / Non-Goals

**Goals:**

- Move the pagination row below the item list without changing counter, page-size, filter-reset, or clamping behavior.
- Make the three navigation icons first-class theme assets, editable per theme and present in every theme without a SQL migration.

**Non-Goals:**

- Adding a first-page jump, page-number buttons, or a page-size selector.
- Changing `icon-style` or reintroducing a general filled-icon variant.
- Restyling the pagination counter or its typography.

## Decisions

**1. Three new keys rather than reusing existing artwork**

Add `previous-page`, `next-page`, and `last-page` to `iconAssetKeys` and `ICON_ASSETS`. The controls must be independently themeable: reusing `collapse`/`expand` would make the chevrons shared with accordions, and an admin editing one would silently change the other. Inline SVGs were rejected because they would escape per-theme artwork and the theme editor.

**2. Outline redraws of the supplied glyphs**

The request's SVGs are filled Material Symbols paths. Their outline equivalents keep the same metaphor at the same 24×24 size: a stroked chevron for `next-page` (`M9 6 L15 12 L9 18`), its mirror for `previous-page`, and a chevron plus a vertical bar for `last-page`. No `fill` attribute is added, so `.icon` applies `fill: none` and `stroke: currentColor`; this satisfies both the user's selected style and `icon-style`. `settings` keeps its existing filled exception untouched. Alternatives considered: adding `fill` to the new entries (rejected: violates `icon-style`), or adding a filled class to the buttons (rejected: new styling exception for no gain).

**3. Existing themes pick the icons up automatically**

Because the keys are added to the catalogue that `buildIconAssetsRecord` and the seed builder already iterate, no migration file is needed: stored themes receive the defaults on read, and `backfillThemeIcons` at startup persists them. A SQL migration was rejected as unnecessary data churn and a second source of default artwork.

**4. Placement handled by render order, not CSS**

`CollectionPage` will render `<CollectionPagination>` after the list block instead of before it, so the row follows the item cards in DOM order and in screen-reader order. Absolute positioning or CSS `order` was rejected because it would break reading order. The row keeps rendering nothing while loading, on error, and when `total === 0`.

**5. Component API gains `onLast`, buttons become icon-only**

`CollectionPagination` receives `onLast` and renders three `type="button"` controls with `ThemeIcon name="previous-page" | "next-page" | "last-page"`. Each keeps an explicit `aria-label` (`Previous page`, `Next page`, `Last page`) since the visible text disappears; `Last` is disabled when `page >= totalPages`. The counter keeps plain-text rendering. `CollectionPage` computes the target page as `Math.max(1, Math.ceil(total / pageSize))`.

## Risks / Trade-offs

- **The shipped icons differ from the literal SVGs by being stroked.** → Same chevron/bar metaphor, size, and viewBox; the user chose the outline option explicitly.
- **Longer navigation for assistive technology now that the row follows 27 cards.** → The row is a labelled `<nav>` landmark and stays reachable by landmark navigation; no extra tab stops beyond the three buttons.
- **A theme with customized `expand`/`collapse` will not affect the new icons.** → Intentional: the new keys are independent, and admins can customize them in `ThemeForm`.
- **Tests and fixtures that assert the exact icon key set will fail until updated.** → Update the expected key list in the theme API tests in the same change.
- **The startup backfill only runs when the API restarts.** → Read-time normalization already supplies the icons, so the UI works immediately; the persisted copy lands on the next startup.

## Migration Plan

1. Extend the contract enum and `ICON_ASSETS` with the three outline paths; seeds and read normalization pick them up.
2. Update the frontend to render the icons and move the row; keep the existing page/filter logic unchanged.
3. Ship API and web together (one image). No database migration; the existing startup `backfillThemeIcons` persists the new keys. Rollback is a revert, with stored themes keeping the extra keys harmlessly (the sync-fill behavior ignores unknown keys).

## Open Questions

None.
