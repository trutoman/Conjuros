## Why

The visual identity is currently hardcoded: `index.css` defines 20 color variables plus one root font, while fonts, font sizes, spacing, radii, layout, per-kind colors, and the tag color picker's free-form palette are literal values baked into the stylesheet. This makes the "dark" and "light" themes impossible to evolve as data, prevents shaping the whole look from a single source, and forces code edits to change any visual token. A database-backed theme system turns visual configuration into data, so fonts, assets, sizes, and palettes can live outside the code.

## What Changes

- Introduce a **theme** data model stored in MongoDB representing a full visual identity (not just colors): surface/text/border/status colors, the fonts used, font sizes (heading/body/monospace), icon assets, per-item-kind colors (`spell`, `web-link`, `markdown`, `file`), and a curated **tag color palette** available in the color picker (replacing today's free-form color choice).
- Ship a stored default `light` theme and a stored `dark` theme that reproduce today's appearance.
- Add the pipeline: `MongoDB → Theme JSON → CSS Custom Properties → :root → Application`. The active theme's tokens are emitted as CSS custom properties on `:root` (or `:root[data-theme=...]`) so all existing `var(--*)` usage and `color-mix()` compositions keep working.
- Make the color picker for tags choose from the active theme's tag palette instead of any arbitrary hex color.
- Theme management (create/edit/delete, activate) is **admin-only**: a user whose account is tagged as admin can edit themes; all other users can only consume the active theme. Admin identity is established via an `ADMIN_EMAIL` environment variable at bootstrap.
- **BREAKING (internal):** the current per-user `theme` preference (`light`/`dark` via `PATCH /api/auth/me/theme` and the light/dark toggle) is superseded by the site-wide active theme where theme formatting is concerned. Users keep selecting how the theme is *applied* only if the new model keeps a user-level selector; otherwise the site-wide theme is the single source. The exact evolution is decided in design.md.

## Capabilities

### New Capabilities
- `theme-system`: A database-backed theme model (colors, fonts, font sizes, icon assets, per-kind colors, and an allowed tag-color palette), a theme service/API to manage themes (admin-only edit, any authenticated user reads), and the renderer that turns the active theme into CSS custom properties applied at the root.

### Modified Capabilities
- `tag-management`: The tag color picker's behavior changes so the colors offered are the active theme's allowed tag palette rather than arbitrary colors.

## Impact

- `packages/contracts/src/theme.ts` (new): theme schema with validation rules (token names, hex colors, font stacks, sizes, palette bounds); re-export from `packages/contracts/src/index.ts`.
- `src/api/repositories/themes.repository.ts` (new, Mongo + in-memory) and a `themes` MongoDB collection; theme references in users become a stored "active theme id".
- `src/api/services/themes.service.ts` (new): CRUD gated by admin, active-theme resolution with a fallback default.
- `src/api/routes/theme.route.ts`, `src/api/controllers/theme.controller.ts` (new); middleware `requireAdmin` (new) alongside `requireAuth`.
- `src/api/config/environment.ts` (+ `.env.example`): add `ADMIN_EMAIL`; `user` records gain an admin flag derived at bootstrap.
- `src/api/services/auth.service.ts` / `src/api/middleware/auth.ts` / `src/api/context/currentUser.ts` / `packages/contracts/src/auth.ts`: surface admin status on the session/profile so the frontend can gate the admin UI.
- `src/web`: a theme editor/admin panel, a hook that fetches the active theme and injects its CSS variables, the tag color picker switched to the theme palette, and removal/deprecation of the hardcoded `:root`/`:root[data-theme='dark']` token blocks in `src/web/index.css` (moved into the stored themes).
- Tests: contract schema tests, repository/service tests, API admin-permission tests (403 for non-admin edits), frontend theme-render and palette-picker tests, color-picker restriction tests.

## Pipeline

```
MongoDB
   ↓  (themes collection)
Theme JSON
   ↓  (validate + expose via API)
CSS Custom Properties
   ↓  (map theme tokens to --vars)
:root
   ↓  (data-theme / inline)
Aplicación
```