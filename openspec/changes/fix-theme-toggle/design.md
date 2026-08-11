## Context

Two independent mechanisms currently drive the interface colors (see proposal.md):

1. `useThemePreference` — owns the `light`/`dark` preference, persists it via `PATCH /api/auth/me/theme`, and writes a `data-theme` attribute on `<html>`.
2. `useSiteTheme` — fetches `GET /api/themes/active` (which resolves against the user preference server-side via `getActiveForUser`), applies the full theme via `applyTheme` (CSS custom properties at the root), and re-runs only when `enabled` or `preference` (`authenticated?.theme`, set once at mount) changes.

Because `App.tsx` passes `authenticated?.theme` (static) as the `useSiteTheme` dependency, the applied CSS variables never change when the user toggles. The `data-theme` attribute written by `useThemePreference` is not consumed by any stylesheet rule, so it has no visual effect either. The result: toggling does nothing and the previously applied theme persists.

## Goals / Non-Goals

**Goals:**
- Make the toggle re-apply the matching theme immediately and persist the choice.
- Single source of truth for the applied theme: the stored theme resolved from the user's preference (default fallback), exposed via `GET /api/themes/active`.
- Keep the `PATCH /api/auth/me/theme` contract unchanged.

**Non-Goals:**
- No backend/service changes unless tests reveal a gap in `getActiveForUser`.
- No new theme-related API endpoints.
- No styling/visual changes to the themes themselves.

## Decisions

**Drive `useSiteTheme` from the live preference and refetch on change.**
`useSiteTheme` should take the current preference from `useThemePreference.theme` (not the static `authenticated?.theme`) as its dependency. When the preference changes, the effect refetches `GET /api/themes/active` and re-applies via `applyTheme`, so server resolution and client rendering agree.
- Alternative: derive the theme entirely client-side from the local preference. Rejected — duplicates the server's fallback/default logic and risks palette/support drift.
- Alternative: mutate `authenticated` optimistically. Rejected — couples profile state to theme state; refetch-on-preference is simpler and still immediate after the PATCH succeeds.

**Remove the unused `data-theme` write in `useThemePreference`.**
`applyTheme` already sets `root.dataset.theme = theme.name` (line 40) and is the authority for the applied theme. The `useThemePreference` effect that sets `document.documentElement.dataset.theme = theme` races with it (light/dark literal vs. theme name) and is dead CSS-wise. Drop it; rely on `applyTheme` alone.
- Alternative: consume `data-theme` in CSS. Rejected — theme values are full palettes applied as variables; an attribute-based toggle cannot carry them.

**Keep the optimistic update in `changeTheme` for responsiveness, then reconcile.**
`changeTheme` already sets the preference locally, persists, and reverts on failure. Combined with the refetch-on-preference dependency, a successful toggle re-applies the theme from the server. This keeps the UI responsive and consistent.

## Risks / Trade-offs

- **Refetch after optimistic update could momentarily apply the old theme** if the PATCH hasn't landed when the refetch fires → Persist first, then trigger refetch: make `useSiteTheme` depend on the settled preference value (set only after a successful PATCH, or set optimistically and reconcile on the refetched context). Prefer reconciling on the fetched context, which always reflects the persisted state.
- **Theme look-up by `name` ties the seed name to the preference literal** (`light`/`dark`) → The server already validates preference against `ThemePreference`; keep seed names matching those literals and rely on the existing default fallback.
- **Race between `applyTheme(null)` cleanup and the toggle** → The effect already guards with a `cancelled` flag; keep it and re-verify ordering so a stale fetch cannot overwrite a newer preference.