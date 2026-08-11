## Context

After `svg-icons-from-themes` + `backfill-theme-icon-assets`, each theme document carries a 20-key `iconAssets: Record<key, { path, viewBox }>` and every icon is rendered as a standalone inline `<svg><path d=... /></svg>`. The art lives in the DB, but every `<svg>` carries its own geometry, the same Lucide paths are duplicated per theme and per render, and CSS-driven theming relies on the `.icon` stroke setup rather than attribute inheritance from the sprite.

SVG sprites flip the model: a single hidden `<svg><symbol id="spell" viewBox="…"><path d=…/></symbol>…</svg>` at the document root, and consumers render `<svg class="icon" viewBox="…"><use href="#spell" /></svg>`. The browser reuses the symbol definition across every `<use>`. The wire format becomes a flat list of ids (`string[]`), the DOM gets shorter, and the `<use>` forwards the parent `<svg>`'s color/attributes so a theme change recolors every icon instantly.

## Goals / Non-Goals

**Goals:**
- Replace the per-icon `{path, viewBox}` shape with a flat `string[]` of symbol ids on `Theme.iconAssets`.
- Ship a single inline sprite at the document root populated from the bundled outline `ICON_ASSETS`.
- Render icons with `<svg><use href="#key" /></svg>`; no per-icon `<path>` in the DOM.
- Normalize legacy stored records on read (id list derived from the record's keys).
- Migrate existing stored documents on read without a forced re-seed.

**Non-Goals:**
- No changes to the visual style (still outline via `currentColor`).
- No new icon keys beyond the 20 currently in `iconAssetKeys`.
- No removal of `ICON_ASSETS` from imports — it's the sprite's data source.
- No change to the `applyTheme` flow.

## Decisions

**`iconAssetsSchema` becomes `z.array(iconAssetKeySchema).nonempty()`.**
The record's per-key `{path, viewBox}` is gone; the theme carries only the list of ids the theme exposes. `iconAssetDefinitionSchema` is removed from the contracts; `IconAssetDefinition`/`IconAssets` types are removed since the artwork is no longer typed in the contract.

**A `Sprite` component renders one `<svg>` at the root with one `<symbol>` per key.**
The component is mounted once in `App.tsx` (above the `ThemeIconsContext.Provider`). The sprite is `display:none` and `aria-hidden`. Each symbol carries the same `viewBox` and `path` that `ICON_ASSETS` already defines for the outline icons, so `ICON_ASSETS` remains the single source of the artwork.
- Alternative: an external `.svg` file fetched at runtime. Rejected — adds a network round-trip and complicates offline usage.

**`ThemeIcon` renders `<svg class="icon" viewBox={definition.viewBox}><use href="#{name}" /></svg>`.**
The `viewBox` is read from the active theme's id list (or the bundled fallback) so the icon scales correctly. `currentColor` adoption comes from the inherited fill/stroke on `<use>`, so no per-icon CSS tweaks are needed. The existing `.icon` CSS class continues to size the SVG.

**`useSiteTheme` exposes the theme's id list; `useThemeIcons` keeps the fallback merge (theme keys missing → bundled).**
The hook returns `availableIcons: IconAssetKey[]` (the active theme's id list, normalized from either the new array shape or the legacy keyed record). `useThemeIcons` no longer needs to merge `path`/`viewBox`; it just resolves a key to a `viewBox` for the rendered SVG (or `0 0 24 24` fallback). `ICON_ASSETS` is still consulted at render time only as the bundled fallback for missing keys.

**`normalizeStoredTheme` becomes "keyed record → id list" + "array of keys → kept as-is".**
The themes service already normalizes the legacy array on read; this change adds the legacy-record → id-list branch and skips the iconAssets-as-record path entirely.

**`ThemeForm` icon section becomes a checklist of keys.**
The form renders one checkbox per `IconAssetKey` and submits the array of selected keys. No per-key path/viewBox editors.

## Risks / Trade-offs

- **Symbol id collisions.** All `<symbol>` ids share a global namespace in the DOM. `ICON_ASSETS` keys are namespaced (`spell`, `web-link`, etc.) and never collide with anything else on the page; a future icon key must remain kebab-case-unique. No mitigation needed today.
- **`<use>` and `currentColor` interaction.** The `<use>` element forwards the parent `<svg>`'s `color`, so the existing `.icon` rule (`fill: none; stroke: currentColor;`) recolors every symbol via `currentColor`. We rely on this; no special styling required.
- **Migration.** Stored documents still carry a keyed record (or the legacy array). `normalizeStoredTheme` handles both: arrays pass through; keyed records contribute their keys. `backfillIconAssets` becomes "ensure every theme's id list is the canonical full set" and is idempotent (no write when already equal).
- **Theme form loses per-icon path editing.** Per-theme icon artwork is no longer a thing the theme carries — every theme pulls from the same sprite. Admins can still toggle which symbols are exposed per theme (the id list). This is the intended simplification.