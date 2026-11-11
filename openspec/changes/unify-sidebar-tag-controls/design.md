## Context

The sidebar currently separates the tags toggle from the clear and match controls and puts tag management in a footer. The shared icon renderer uses stroked, unfilled paths, while the supplied settings glyph is a filled shape on a 960-unit coordinate grid. Themes persist icon artwork and can already merge missing keys from defaults.

## Goals / Non-Goals

**Goals:**

- Reuse the theme icon contract, editor, defaults, and compatibility/backfill paths.
- Keep all tag actions usable in expanded, collapsed, and narrow-drawer states.
- Make non-match toolbar buttons visually uniform without changing the existing match selector.

**Non-Goals:**

- Change tag filtering, tag-management functionality, the mobile topbar, or theme-management placement.
- Redesign other application buttons or alter all icons' rendering.

## Decisions

1. Add `settings` to the shared icon key list and bundled defaults. Use viewBox `0 -960 960 960` and this exact path:

   ```text
   m421-132-15-111q-23-7-51-22.5T308-299l-102 46-59-105 90-67q-2-13-3.5-27t-1.5-27q0-12 1.5-26t3.5-30l-90-68 59-102 101 44q22-18 48-33t50-22l16-112h118l15 112q27 10 50 23t45 32l106-44 58 102-94 70q4 15 5 28t1 25q0 11-1.5 24t-4.5 30l93 68-59 105-104-47q-23 20-46.5 34.5T554-244l-15 112H421Zm18-22h81l15-111q30-8 54.5-22t51.5-39l102 44 40-69-90-67q4-19 6-33.5t2-28.5q0-16-2-29.5t-6-30.5l92-69-40-69-105 44q-18-20-49-39t-57-22l-13-111h-82l-12 110q-32 6-57.5 20.5T318-635l-103-43-40 69 90 66q-5 14-7 30t-2 34q0 16 2 31t6 30l-89 67 40 69 102-43q24 25 50 39t59 22l13 110Zm38-241q36 0 60.5-24.5T562-480q0-36-24.5-60.5T477-565q-35 0-60 24.5T392-480q0 36 25 60.5t60 24.5Zm3-85Z
   ```

   Render this icon with `fill: currentColor` and no stroke using a scoped class or equivalent; the SVG's literal fill color is not embedded so it adapts to themes. An inline hardcoded SVG would bypass theme editing and is rejected.

2. Keep the existing missing-key normalization and backfill mechanism and extend its coverage to `settings`, including legacy arrays and preserving customized records. Seeded and newly edited themes receive the same default through existing key iteration. Do not overwrite existing custom artwork. This avoids a separate data migration where the existing mechanism is sufficient.

3. Use a single flex header for the tags, clear, match, settings, and conditional close controls. Share the clear button's square styling across all non-match controls, including the narrow drawer close action; retain the match toggle's own styles and pressed semantics. Keep the same action callbacks and conditional visibility. A separate footer or nested independently positioned control group would not satisfy the requested single toolbar.

4. Remove only visible text, retaining explicit accessible names, `aria-expanded`, `aria-controls`, and match group/pressed state. Verify narrow widths rather than shrinking or clipping controls silently.

## Risks / Trade-offs

- [The full toolbar can exceed the existing drawer width] → Adjust spacing or container sizing and verify both desktop and narrow layouts without clipping or wrapping controls unexpectedly.
- [A filled glyph may inherit outline styling] → Scope its fill/stroke override to settings and verify the actual rendered SVG and theme switching.
- [Existing theme records may not contain the new key] → Test read normalization, persisted backfill, legacy records, and preservation of custom entries.

## Migration Plan

Deploy the extended contract, bundled artwork, theme normalization/backfill, and UI together. Existing themes gain the default on read and through the existing backfill; custom settings values survive. Rollback uses the prior application version and its existing theme handling; no destructive database schema change is required.
