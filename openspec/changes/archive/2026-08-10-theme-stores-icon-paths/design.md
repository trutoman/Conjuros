## Context

After `svg-icons-from-themes` + `backfill-theme-icon-assets` (which used the keyed-record shape) and `theme-svg-sprite-icons` (which replaced it with an id list and an SVG sprite), the artwork no longer lives in the database. The user wants the icon paths and viewBoxes stored per theme in `Theme.iconAssets` again, with the frontend rendering each icon directly from the active theme's stored record — both on initial mount and on every theme preference change.

This change:
1. Reverts the contract from `string[]` back to `Record<IconAssetKey, { path, viewBox }>` (the shape `svg-icons-from-themes` introduced and `backfill-theme-icon-assets` filled).
2. Drops the `<symbol>`/`<use>` sprite mechanism; `<ThemeIcon>` renders an inline `<svg><path/></svg>` from the stored artwork.
3. Re-runs the boot-time backfill to write the keyed record into every stored document.
4. Restores the `ThemeForm`'s per-key `path`/`viewBox` editors so admins can edit the artwork per theme.

## Goals / Non-Goals

**Goals:**
- `Theme.iconAssets` is a `Record<IconAssetKey, { path, viewBox }>` covering all 20 keys (including `sun`, `moon`, `add`).
- The frontend reads the active theme's icon record on initial mount and on every preference change, and renders each icon from the stored `path`/`viewBox`.
- The boot-time backfill upserts every stored theme to the canonical 20-key record.
- Per-theme customizations are preserved (admin edits a key's `path`, the backfill doesn't clobber it).
- Idempotent: re-running the backfill is a no-op.

**Non-Goals:**
- No backend auth/role changes.
- No changes to other theme fields (colors, fonts, palette).
- No frontend library additions.
- The SVG sprite is gone; `<ThemeIcon>` always renders inline `<svg><path/></svg>`.

## Decisions

**Contract: restore `iconAssetDefinitionSchema` and the keyed record.**
The `Record<IconAssetKey, IconAssetDefinition>` shape is the natural extension of the existing object-valued theme fields. It validates invariants (non-empty `path`/`viewBox`, valid `IconAssetKey`) at the boundary. The previous `string[]` shape and its related types are removed.

**The bundled `ICON_ASSETS` is the seed and the runtime fallback.**
`ICON_ASSETS` in `src/web/lib/iconAssets.ts` carries the canonical outline artwork for every key. The seed and the boot-time backfill draw from it. The frontend's `useThemeIcons` still merges `ICON_ASSETS` over the active theme's record, so a key the theme doesn't list (or a stale read) falls back to the bundled artwork instead of rendering nothing. This is a defensive safety net, not the normal path: every active theme is expected to carry the full 20-key record after the first backfill.
- Alternative: remove the runtime `ICON_ASSETS` fallback entirely. Rejected — the fallback makes the system tolerant of mid-flight races (a theme inserts while a render is in progress).

**No sprite; inline `<svg><path/>` per icon.**
`<ThemeIcon>` renders `<svg class="icon" viewBox={theme.viewBox}><path d={theme.path} /></svg>`. The current size rules (`width: 1.1rem`, `aspect-ratio: 1 / 1` on buttons) still apply. The CSS `.icon` class continues to provide stroke-based outline rendering via `fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap/linejoin: round`.
- Alternative: keep the sprite and have the frontend mount it from the active theme's `iconAssets`. Rejected — the user explicitly asked for the database to own the artwork and for icons to render from the active theme; the sprite optimization is no longer needed.

**The boot-time backfill runs in `ThemesService.backfillIconAssets`, invoked from `server.ts` after `ensureThemesSeeded()`.**
The backfill walks every stored theme via `findAll`, builds the canonical 20-key record by merging the bundled `ICON_ASSETS` with any existing stored values (existing keys win), and upserts via `themes.replace`. The merged record is compared to the stored record for equality; equal records are skipped, so the backfill is idempotent.
- Alternative: rebuild the document on every read. Rejected — reads should be fast and side-effect-free.

**`normalizeStoredTheme` in the themes service accepts both shapes during the transition.**
Stored documents from `theme-svg-sprite-icons` carry `iconAssets: string[]`. The themes service converts that array to a keyed record on read by merging each entry's `{path, viewBox}` from `ICON_ASSETS`. After the first boot, the backfill writes the keyed record and the conversion branch becomes unused.

**`ThemeForm` restores per-key `path`/`viewBox` editors.**
The form state is `Record<IconAssetKey, { path, viewBox }>`. Each key gets a row with a path textarea and a viewBox input. The submit payload sends the keyed record. The checklist added by `theme-svg-sprite-icons` is removed.

## Risks / Trade-offs

- **`ICON_ASSETS` is a frontend module imported by the server.** The design already accepted this for `themeSeed.ts` and the previous `backfill-theme-icon-assets`; one more server import is consistent. The module is pure data with no runtime dependencies, safe in a Node context.
- **Wire size.** Each theme document carries 20 `{path, viewBox}` records instead of 20 id strings. The seed `path`s are typically 100–500 characters; the additional payload per theme is ~5–10 KB. Acceptable for this app size.
- **Custom `viewBox` could break `themeSchema.parse` if invalid.** The schema validates `viewBox: z.string().trim().min(1).max(64)`. The form goes through `themeInputSchema` so customizations are validated on save. Out-of-band writes that bypass validation could leave an invalid record, but `useThemeIcons` falls back to `0 0 24 24` when a stored `viewBox` is missing or empty.
- **No automatic re-backfill when new icon keys are added.** When a 21st `IconAssetKey` is introduced, stored themes won't carry it until this backfill runs again at next boot. Acceptable — the runtime `ICON_ASSETS` fallback covers the visual case.