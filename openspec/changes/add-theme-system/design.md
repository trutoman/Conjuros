## Context

See proposal.md - Why. Today the entire visual identity is hardcoded: 20 color variables plus one root font in `src/web/index.css`, with fonts, sizes, radii, per-kind colors, and the free-form tag color picker (`TagForm.tsx`) all as literals. The per-user theme (`light`/`dark`) is a single enum stored in the user document, surfaced via `GET /api/auth/me` and applied by `useThemePreference` setting `document.documentElement.dataset.theme`, which `:root[data-theme='dark']` selects on. There is no `role` field, no admin middleware, and no list/catalog data. Constraints from AGENTS.md: controllers → services → repositories → Mongo; shared Zod contracts; paginate list endpoints (max 50); status codes incl. 403; DI via `createApp(dependencies)`; no routing (state-based panel switching in `CollectionPage`).

## Goals / Non-Goals

**Goals:**
- A `themes` collection with a fully validated theme JSON (colors, fonts, sizes, icon asset keys, per-kind colors, allowed tag palette) and seeded `light`/`dark` defaults matching the current look.
- An admin-only theme management API and an admin bootstrap mechanism (`ADMIN_EMAIL`).
- The active theme rendered as CSS custom properties at the root, with the user's light/dark choice preserved.
- Tag colors constrained to the active theme's palette.

**Non-Goals:**
- User-management UI (listing users, disabling accounts) — a later change; only admin identity + gating lands here.
- Making every literal in `index.css` configurable in one pass — tokens become theme-driven where the theme model defines them (colors, fonts, sizes, kind colors, palette); spacing/radii are left hardcoded for now.
- Runtime hot-reload/preview of themes.

## Decisions

**D1: Themes stored in a `themes` collection; active set chosen by user preference.**
A theme document carries `id`, `name` (e.g. `light`, `dark`), `label`, and the full token payload. One theme is the site default. The user's existing `theme` preference (`light`/`dark`) now selects *which stored theme* is applied via the existing `data-theme` mechanism, so `PATCH /api/auth/me/theme` and the toggle keep working unchanged. Rationale: non-breaking, zero migration of user documents, and the admin still fully controls the catalog content. Alternative considered (single site-wide active theme, removing the toggle) rejected as it breaks a shipped interaction and the toggle semantics for app-level control are not the ask.

**D2: Theme → CSS variables applied in-memory on the root, not a generated stylesheet.**
`applyTheme(root, theme)` maps flat tokens to `--var` names (surfaces, text, borders, primary, danger/success/warning, shadow, kind colors as `--spell`/`--link`/`--markdown`/`--file`, fonts as `--font-display`/`--font-body`/`--font-mono`, sizes as `--font-size-*`) and sets them on `document.documentElement.style`. The `data-theme` attribute still names the active theme. `color-mix()` compositions and `var(--*)` consumers keep working with zero CSS churn. Rationale: no stylesheet-injection ordering, no CSP friction, trivially testable, and identical to how the hook already mutates the root. The hardcoded `:root`/`:root[data-theme='dark']` token blocks in `index.css` are removed in favor of `@property` fallbacks / safe defaults when no theme is loaded.

**D3: Admin identity from a DB lookup, not a JWT claim.**
`StoredUser` gains `role: 'user' | 'admin'` (hydrated default `'user'`). A `requireAdmin` middleware runs after `requireAuth`, loads the user by `currentUser.id`, and returns 403 unless `role === 'admin'`. The session profile (`authenticatedUserProfileSchema`) gains `role` so the frontend can gate the admin UI. Rationale: a per-request DB check is always fresh (won't stalely grant admin after a downgrade) and avoids re-signing sessions; it mirrors how `readAuthenticatedUserProfile` already reads the DB. The JWT payload stays `{ id, email }`.

**D4: Admin bootstrap via `ADMIN_EMAIL` env var at boot.**
`parseApiEnvironment` gains `ADMIN_EMAIL`; on startup the bootstrap step finds that user (by normalized email) and sets `role: 'admin'`, and new defaults are `'user'`. Rationale: deterministic, documented in `.env.example`, matches the existing scripts/one-off env patterns. Alternative considered (a `scripts/*.mjs` migration) kept as the fallback for teams without env, but env is the primary. Function also idempotent (safe on every boot).

**D5: Icon "assets" = a registry of asset keys, not embedded SVGs.**
Each theme lists which icon asset keys the UI is expected to use (e.g. `document`, `eye`, `download`). The frontend keeps a `ICON_ASSETS: Record<key, SVG path>` map (from `ItemCard.tsx`), and the theme validates against the known key set. Rationale: satisfies "assets like icons live in the theme" without embedding SVG blobs in Mongo; changing an icon = changing an asset key in the theme + path in the map. Unused keys fail validation.

**D6: Color picker becomes a swatch palette.**
`TagForm` renders the active theme's `tagColorPalette` as selectable swatches in a `color-field`, keeps the hex text input for precision, and validates on submit that the chosen color is in the palette (case-insensitive hex compare, e.g. `#123ABC` === `#123abc`). The contract's tag schema gains the palette-membership rule in the service, not the shared schema (palette is runtime data). Rationale: keeps tag color validation backend-enforced while leaving the shared Zod schema static; the form surfaces friendly errors.

## Risks / Trade-offs

- **CSS token churn** — Removing `:root` blocks could leave selectors depending on tokens until the first theme loads. → Apply a synchronous default (seeded theme fetched with `/me` bootstraps vars before first paint; a `<noscript>`-safe fallback block with old defaults is kept).
- **Seed drift** — Seed themes are code; if an admin edits light/dark the defaults diverge from a fresh install. → Seed only on empty collection; treat edits as data overrides, not code updates.
- **Palette rejection may annoy existing flows** — Tags created before the palette (any color) won't display if their color leaves the palette. → On theme activation, existing tag colors stay stored; only new saves are constrained, legacy colors render as-is.
- **Multiple boot appends role each start** — writing `role` on every boot is wasteful. → Bootstrap sets admin only when the stored role isn't already `admin`.
- **403 semantics** — AGENTS.md lists 403 but ownership today returns 404. → Admin uses 403 intentionally; ownership peers stay 404, keeping existing tests intact.

## Migration Plan

1. Add `role` to `StoredUser` (hydrate default `'user'`); no user-doc rewrite needed.
2. Add `themes` collection; seed `light`/`dark` on empty. No data migration.
3. Replace hardcoded `:root`/`dark` token blocks with themed application + a static fallback block.
4. Rollback: keep env `ADMIN_EMAIL` unset (no admins, theme APIs 403 for everyone except none) and keep the static fallback CSS, restoring the old look; dropping the `themes` collection falls back to seeded defaults.

## Open Questions

- Whether admins remain a single email or a list (e.g. multiple admin emails) — deferrable; single `ADMIN_EMAIL` is the initial shape and extensible to an array later without spec change while `ADMIN_EMAIL` stays accepted.