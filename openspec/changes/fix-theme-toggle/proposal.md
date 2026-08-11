## Why

The light/dark theme toggle does not work: clicking "Light mode" (or "Dark mode") has no visible effect and the interface stays on the previously active theme. The toggle updates only the `data-theme` attribute and persists the preference, but the actual colors come from CSS custom properties applied from a theme fetched once on load, which is never re-applied when the preference changes.

## What Changes

- The active theme is re-resolved and re-applied immediately whenever the user changes their light/dark preference, without a page reload.
- The applied theme (CSS custom properties at the root) always matches the user's persisted `light`/`dark` preference, including after a full reload.
- The single source of truth for which theme renders is the stored theme matching the user's preference (falling back to the default theme), not a disconnected `data-theme` attribute.
- The `ThemeToggle` and the theme-application hooks are reconciled so both reflect the same resolved theme and react to changes.

## Capabilities

### New Capabilities
- `theme-preference`: User-facing light/dark preference that immediately drives the applied theme on the client and the active theme resolved by the API, with default fallback when no theme matches the preference.

### Modified Capabilities
<!-- None: main specs have no theming capability yet; the preference behavior is being introduced here. -->

## Impact

- `src/web/App.tsx` — wiring between `useThemePreference`, `useSiteTheme`, and `CollectionPage`
- `src/web/hooks/useSiteTheme.ts`, `src/web/hooks/useThemePreference.ts` — theme resolution/application flow
- `src/web/components/ThemeToggle.tsx`, `src/web/pages/CollectionPage.tsx` — toggle interaction
- `src/api/routes/auth.route.ts`, `src/api/controllers/auth.controller.ts` — `PATCH /api/auth/me/theme` (existing, unchanged contract)
- `src/api/services/themes.service.ts` — `getActiveForUser` / `getActivePaletteForUser` already key off the user preference; no backend change expected
- Frontend unit tests for the hooks and toggle