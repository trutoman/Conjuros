## Context

The theme's `iconAssets` in the database is currently only `string[]` of keys, while the actual icon definitions live hardcoded in `src/web/lib/iconAssets.ts`. `applyTheme`/`useSiteTheme` expose colors, fonts, and the tag palette to the UI but not icons. The `outline-icons-only` change (archived) has just unified every icon onto a single outline/Lucide-style line vocabulary with viewBox `0 0 24 24`; this change is the storage half — it moves the artwork into the theme documents so the theme owns the icons it declares.

## Goals / Non-Goals

**Goals:**
- Make every theme document carry the icon definitions (SVG `path` + `viewBox`) for the keys it uses.
- Render every interactive icon from the active theme, with per-key fallback to the bundled `ICON_ASSETS` for keys the theme omits.
- Keep the contract invariants (valid keys, non-empty path/viewBox) at the boundary; let the rendering layer deal with size/centering.
- Stay compatible with the outline artwork from the archived `outline-icons-only` change.

**Non-Goals:**
- No new icon *rendering* library, sprite, or `<symbol>` system — single-path inline SVGs, consistent with `ICON_ASSETS`.
- No new icon keys beyond the three the user requested (`sun`, `moon`, `add`).
- No backend auth/role changes.

## Decisions

**Represent icon definitions as a keyed map in the theme, keeping it in contracts.**
Change `iconAssets` in `themeSchema` from `z.array(iconAssetKeySchema)` to `z.record(iconAssetKeySchema, iconAssetDefinitionSchema)`, where `iconAssetDefinitionSchema = z.object({ path: z.string(), viewBox: z.string() })`. The record shape is the natural extension of the existing object-valued theme fields (colors, fonts, kindColors) and keeps validation uniform.
- Alternative: separate `icons` collection/table. Rejected — icons belong to the theme identity and change atomically with it; the theme already owns kind colors, fonts, and sizes.

**Make `ICON_ASSETS` the canonical seed and fallback; reuse it to seed themes.**
`ICON_ASSETS` in `src/web/lib/iconAssets.ts` already holds `path`+`viewBox` per key. Keep it as: (1) the fallback the renderer uses when a theme omits a key, and (2) the source for seeding `themeSeed.ts` icon definitions (light/dark). This avoids duplicating path data in two files and means the existing outline artwork (from `outline-icons-only`) automatically becomes the per-key fallback.
- Alternative: move paths into a shared JSON consumed by both server seed and client. Rejected — introduces a new module boundary for little gain; one TS module imported by both is sufficient, and `iconAssets.ts` is already isomorphic (pure data).

**Expose the active theme's icons through `useSiteTheme` and a small `ThemeIcon` component.**
`useSiteTheme` already resolves the active `Theme`; add `icons` to its return: a `Record<IconAssetKey, IconDefinition>` merged with the fallback `ICON_ASSETS` so the UI never sees a missing key. Introduce `ThemeIcon({ name, label?, size? })` that reads the resolved icon and renders an `<svg class="icon">` with `<title>` and `aria-label`. Components replace literal glyphs with `<ThemeIcon>`.
- Alternative: thread icons via React context. Rejected — `useSiteTheme` already provides the resolved theme at the top level; a single hook + component keeps the change small.

**Single-viewBox icon system via the `.icon` class.**
All icons share viewBox `0 0 24 24` and the existing `.icon` CSS (stroke-based, `fill: none`, `stroke: currentColor`, `stroke-width: 1.8`), so `width`/`height` of the rendered SVG defines the visual size. The `add-item-button` keeps its 1:1 aspect ratio via `aspect-ratio: 1 / 1` plus an explicit `width`/`height`; the `font-family: var(--font-display, 'Cinzel', serif)` pin added in the `outline-icons-only` stopgap can be removed once the `+` is an SVG.
- Alternative: CSS `mask-image`. Rejected — breaks the "inline SVG" accessibility requirement (aria-label/title) and the existing `<path>` model.

## Risks / Trade-offs

- **Existing stored themes lack icon definitions (still a `string[]` of keys)** → Normalize at load/resolve time: `useSiteTheme` merges the active theme's `iconAssets` over the bundled `ICON_ASSETS` fallback, so older themes render correctly without a forced migration. Newly seeded themes carry the full record.
- **Contract change breaks API tests / theme form** → Update `themeValidation.test.ts`, `themes.test.ts`, and the `ThemeForm` icon section in the same change; `npm run check` is the gate.
- **Edit form for per-key `path` textareas** is verbose (the user pastes SVG path data) — acceptable for now, since theme management is admin-only and the current form is already detail-oriented.