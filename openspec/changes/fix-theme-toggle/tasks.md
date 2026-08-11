## 1. Reconcile theme hooks

- [x] 1.1 Change `useSiteTheme` to accept the live preference (from `useThemePreference.theme`) as its dependency instead of the static `authenticated?.theme`, so changing the preference refetches `GET /api/themes/active` and re-applies the theme
- [x] 1.2 Ensure the refetch runs only after the preference is settled (successful PATCH or optimistic value reconciled with the fetched context), and that a stale fetch cannot overwrite a newer preference (keep the `cancelled` guard)
- [x] 1.3 Remove the `document.documentElement.dataset.theme = theme` effect from `useThemePreference`; let `applyTheme` own the `data-theme` attribute and CSS custom properties
- [x] 1.4 Update `App.tsx` to pass `themePreference.theme` (not `authenticated?.theme`) into `useSiteTheme`, and verify `CollectionPage` still receives `theme`/`onThemeChange`/`tagPalette` correctly

## 2. Update tests

- [x] 2.1 Add/extend hook tests asserting that changing the preference refetches the active theme and reapplies CSS custom properties, and that a failed PATCH reverts the preference without changing the applied theme
- [x] 2.2 Update `ThemeToggle` tests that asserted the removed `dataset.theme` behavior to assert the applied theme CSS variables and the pressed state instead
- [x] 2.3 Add a component-level test that toggling Light/Dark results in the matching theme's CSS custom properties being applied at the root

## 3. Validate

- [x] 3.1 Run `npm run check` and confirm lint, tests, and build pass
- [x] 3.2 Manually verify in the running app: toggling light/dark updates the UI immediately, persists across reload, and non-admin users can still toggle while only admins see theme management
