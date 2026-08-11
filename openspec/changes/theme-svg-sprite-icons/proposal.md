## Why

Icons are currently stored as inline `path` data per icon (`iconAssets: { spell: { path, viewBox }, ... }`) and rendered as standalone inline SVGs (`<svg><path d=... /></svg>`). This means every icon's geometry is duplicated in every theme document, every `<svg>` is parsed per use, and every theme carries 20 records of `{path, viewBox}`. An SVG sprite (`<symbol>` + `<use>`) inverts the model: the sprite is a single document of `<symbol>` definitions, and consumers reference symbols by id with `<svg><use href="#spell" /></svg>`. This makes the storage a flat list of symbol ids (or an inline sprite), the wire format small, the browser work less, and CSS-driven theming (stroke / fill via `currentColor`) straightforward because the `<use>` element forwards attributes.

## What Changes

- Replace the per-icon `{path, viewBox}` shape with a flat **string of symbol ids** (e.g. `"spell,web-link,markdown,..."`) — the same shape the API carried before `svg-icons-from-themes`, but with a clear semantic: "the theme uses these icons from the sprite".
- Ship a single `<svg style="display:none"><symbol id="…" viewBox="…">…</symbol>…</svg>` sprite document at the root of the app, populated from the bundled outline `ICON_ASSETS` (Lucide paths) plus the new `sun`/`moon`/`add` keys.
- Render icons with `<ThemeIcon name="spell" />` → `<svg class="icon" viewBox="…"><use href="#spell" /></svg>` — a single `<use>` per icon, no per-icon `<path>` in the DOM.
- The theme form's "Icon assets" section becomes a checklist of symbol ids; selecting a key includes the symbol in the sprite for that theme. Default: every known key is enabled.
- Backwards compatibility: themes whose stored `iconAssets` is still a per-key record (the current shape) are migrated at read time to the new id list, drawing the set from the keys present in the record.

## Capabilities

### New Capabilities
- `svg-sprite-rendering`: A single SVG `<symbol>` sprite is mounted at the document root and every interactive icon renders via `<svg><use href="#symbol-id" /></svg>`. The active theme declares which symbol ids are available by listing them on the theme document; icons rendered through the sprite use the theme's available symbol set with a fallback to the bundled outline sprite when a key is missing.

### Modified Capabilities
- `theme-storage-migration`: Theme `iconAssets` is now a string of symbol ids (`string[]` of `IconAssetKey`) instead of a keyed record of `{ path, viewBox }`. Stored documents whose `iconAssets` is still a keyed record are normalized on read to the id list by taking the keys present in the record.

## Impact

- `packages/contracts/src/theme.ts` — `iconAssetsSchema` becomes `z.array(iconAssetKeySchema).nonempty()`; remove `iconAssetDefinitionSchema` and `IconAssetDefinition`/`IconAssets` types (the artwork is no longer carried per-theme)
- `src/api/repositories/themeSeed.ts` — seed themes with the canonical id list (`iconAssetKeys` from contracts)
- `src/api/services/themes.service.ts` — `normalizeStoredTheme` becomes "keyed record → id list"; `backfillIconAssets` becomes "ensure every theme has the canonical id list"
- `src/web/components/ThemeIcon.tsx` — render via `<use href="#{name}" />` instead of an inline `<path>`
- `src/web/components/Sprite.tsx` (new) — mounts the inline `<svg><symbol>…</symbol></svg>` once at the root
- `src/web/components/ThemeIconsContext.ts` — exposes the active theme's id list (no per-icon `path`/`viewBox`)
- `src/web/hooks/useSiteTheme.ts` — return the theme's id list; no per-icon merge with `ICON_ASSETS` (icons come from the sprite)
- `src/web/lib/iconAssets.ts` — becomes the single source of the sprite's `<symbol>` data; no longer consumed at render time
- `src/web/components/ThemeForm.tsx` — icon section becomes a checklist of keys (no path/viewBox editors)
- `src/web/index.css` — `<svg><use>` adopts `currentColor` for stroke/fill; remove per-icon sizing rules if they were tied to `<path>` rendering
- `src/tests/api/themes.test.ts`, `src/tests/api/themes.service.test.ts`, `src/tests/shared/themeValidation.test.ts` — schema updates; new regression for the sprite-rendered DOM
- Theme documents in MongoDB: the per-key `{path, viewBox}` record is migrated to the id list on the next read (idempotent)