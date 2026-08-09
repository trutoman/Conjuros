## 1. Contracts

- [ ] 1.1 Add `themeSchema` to `packages/contracts/src/theme.ts` (surfaces, text, borders, accents, status, shadow, fonts, font sizes, icon asset keys, per-kind colors, tag color palette) with strict validation (hex format, finite sizes, known asset keys, palette size bounds); export from `packages/contracts/src/index.ts`
- [ ] 1.2 Add `themeInputSchema`, `themeUpdateSchema`, `themeListSchema` (paginated, limit max 50), `themeQuerySchema`, and `siteThemeContextSchema` (active theme) as needed
- [ ] 1.3 Extend `authenticatedUserProfileSchema` in `packages/contracts/src/auth.ts` with `role: 'user' | 'admin'` and add `roleSchema`; keep `authenticatedUserSchema` (session) as `{ id, email }`

## 2. Backend Theme Domain (repository + service)

- [ ] 2.1 Add `ThemesRepository` interface + `MongoThemesRepository` and `InMemoryThemesRepository` (`src/api/repositories/themes.repository.ts`) with list/findById/create/update/delete/setActive
- [ ] 2.2 Seed the `light` and `dark` themes on an empty `themes` collection (values reproducing the current `index.css` appearance, incl. existing four kind colors and a default tag palette)
- [ ] 2.3 Add `ThemesService` (`src/api/services/themes.service.ts`): active-theme resolution with a fallback default, CRUD validated against contracts, and palette membership helper

## 3. Backend Admin Role + Auth

- [ ] 3.1 Add `role` to `StoredUser` in `users.repository.ts` (hydrate default `'user'`) and to `create`
- [ ] 3.2 Add `requireAdmin` middleware (`src/api/middleware/auth.ts`) that loads the user by `currentUser.id` and raises 403 unless `role === 'admin'`
- [ ] 3.3 Add `ADMIN_EMAIL` to `src/api/config/environment.ts` Zod schema and `.env.example`; add a bootstrap step (idempotent) that marks the matching account `admin` at boot (`server.ts` or a small module)
- [ ] 3.4 Surface `role` on the authenticated profile (`readAuthenticatedUserProfile` + contract type) without exposing other persistence fields

## 4. Theme API

- [ ] 4.1 Add `theme.route.ts` + `theme.controller.ts`: GET, list, create/update/delete/activate under `requireAuth + requireAdmin` for mutations, read endpoints for any authenticated user; wire into `app.ts` via DI and `createApp(dependencies)` (add `themes` repository + service)

## 5. Frontend Theme Application

- [ ] 5.1 Remove hardcoded `:root` / `:root[data-theme='dark']` token blocks from `src/web/index.css`; keep a static fallback block with the previous defaults for pre-theme paint
- [ ] 5.2 Add a frontend service (`src/web/services/themes.ts`) and hook (`src/web/hooks/useSiteTheme.ts`) that fetch the active theme and apply its tokens to `document.documentElement.style` (per design D2), keeping `data-theme` = requested theme name
- [ ] 5.3 Wire the theme into `App.tsx` (fetch alongside `/me`, apply on load and when active theme changes); keep existing ThemeToggle and `PATCH /api/auth/me/theme` behavior

## 6. Tag Palette

- [ ] 6.1 Replace the free-form color field in `TagForm.tsx` with the active theme palette selectable swatches, keeping the hex text input; validate on submit that the chosen color is in the palette
- [ ] 6.2 Enforce palette membership in the tag service (case-insensitive hex compare) so out-of-palette saves are rejected with a friendly error

## 7. Admin UI

- [ ] 7.1 Add an admin entry point (sidebar footer or topbar) visible only when `user.role === 'admin'`
- [ ] 7.2 Add a theme management view (list, create/edit form, activate, delete) reachable from the admin entry point, following the existing state-based panel pattern in `CollectionPage`
- [ ] 7.3 Replace the hardcoded icon `path`s in `ItemCard.tsx` with assets from the frontend `ICON_ASSETS` map keyed by theme asset keys

## 8. Tests

- [ ] 8.1 Contract tests: theme schema validation (valid theme, invalid hex, bad size, unknown asset key, palette bounds), role schema, paginated list
- [ ] 8.2 Repository + service tests with in-memory repos: seed on empty, CRUD, active-theme fallback, palette membership, admin bootstrap idempotency
- [ ] 8.3 API tests: admin CRUD + activation succeed; non-admin mutations return 403; reads work for any authenticated user; activation switches applied tokens
- [ ] 8.4 Frontend tests: theme hook applies vars to root; tag form offers palette swatches and rejects out-of-palette save; admin entry gated by role; theme management view CRUD flows
- [ ] 8.5 Run `npm run check` and resolve any failures