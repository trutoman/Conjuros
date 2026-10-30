## 1. Contracts

- [x] 1.1 Replace the `theme` field of `authenticatedUserProfileSchema` with `preferences: { themeId: string | null, tagsPanelExpanded: boolean }` in `packages/contracts/src/auth.ts`
- [x] 1.2 Add `userPreferencesUpdateSchema` with optional `themeId` (`string | null`) and `tagsPanelExpanded`, requiring at least one field
- [x] 1.3 Remove `themePreferenceUpdateSchema` and the `ThemePreference` export once no code uses them

## 2. Database

- [x] 2.1 Add the `user_preferences` table to `src/api/db/schema.ts` with `user_id` primary key (cascade), `theme_id` referencing `themes.id` (set null), `tags_panel_expanded` (not null, default true), and `updated_at`; enable RLS
- [x] 2.2 Remove the `theme` column and the `theme_preference` enum from the `users` schema definitions
- [x] 2.3 Generate migration `0010` with `npm run db:generate`
- [x] 2.4 Edit the generated SQL so it copies each user's `theme` value into `user_preferences.theme_id` (matching the seeded theme by name) before dropping `users.theme` and the enum

## 3. API

- [x] 3.1 Add a `UserPreferencesRepository` interface with Postgres and in-memory implementations: `get(userId)` returns defaults when no row exists, `upsert(userId, patch)` creates or updates the row
- [x] 3.2 Remove the theme field and `updateTheme` from the users repository (Postgres and in-memory)
- [x] 3.3 Update the auth service so the profile carries `preferences`, and add `updatePreferences` that validates `themeId` against the themes repository and answers 400 for an unknown id
- [x] 3.4 Add `PATCH /api/auth/me/preferences` (session required) and remove `PATCH /api/auth/me/theme`, its controller method, and its service function
- [x] 3.5 Update `ThemesService.getActiveForUser` and `getActivePaletteForUser` to read the user's `themeId`, falling back to the site default when it is null or missing
- [x] 3.6 Wire the preferences repository through `createApp` dependencies and `src/api/server.ts`
- [x] 3.7 Ensure login and `GET /api/auth/me` return the new profile shape

## 4. Web data layer

- [x] 4.1 Add `updateUserPreferences(update)` in the web services, calling `PATCH /api/auth/me/preferences`
- [x] 4.2 Rewrite `useThemePreference` to hold a `themeId` (not `light | dark`), keep the previous value when a save fails, and expose a single `setTheme(themeId)` writer
- [x] 4.3 Update `App.tsx` to pass the profile's `themeId` into the preference hook and the tags state into the collection
- [x] 4.4 Update `ThemeToggle` to select the stored `light` and `dark` theme ids, save on press, and show both options unpressed when the active theme is neither

## 5. User menu and theme selector

- [x] 5.1 Turn `UserWidget` into a dropdown opened from the user's name, with a disabled "Profile", "Theme selector", and "Sign out"; close on `Escape` and outside click
- [x] 5.2 Add the theme selector modal: vertical list from the themes API, current theme marked, loading and error states, "Save theme preferences" applies and closes, closing without saving changes nothing
- [x] 5.3 Wire "Theme selector" from the menu to open the modal, and make a successful save update the applied theme without a reload

## 6. Tags panel state

- [x] 6.1 Read the desktop sidebar's initial state from the profile's `tagsPanelExpanded` in `CollectionPage`
- [x] 6.2 Save the state through `PATCH /api/auth/me/preferences` when the desktop sidebar is toggled, and remove the `conjuros_sidebar_open` localStorage reads and writes
- [x] 6.3 Keep the narrow-viewport drawer non-persisted and unchanged

## 7. Tests

- [x] 7.1 Contract tests: profile shape, preferences update validation (empty body, unknown fields ignored)
- [x] 7.2 PGlite migration test: existing `light` and `dark` values become the seeded theme ids; users with no value get null; the `users.theme` column is gone
- [x] 7.3 API tests: GET profile defaults, PATCH selects an existing theme, PATCH with unknown theme answers 400, PATCH needs a session (401), active theme follows the selection, deleted selection falls back, PATCH stores tags panel state
- [x] 7.4 Web tests: `useThemePreference` save and rollback on failure, `ThemeToggle` pressed states with a custom theme, `UserWidget` menu entries and Escape, theme selector modal save and cancel, `CollectionPage` tags state from the profile
- [x] 7.5 Update existing fixtures that use `theme: 'light'` or `theme: 'dark'` in the profile to the new shape

## 8. Verification

- [x] 8.1 Run `npm run check` and resolve all failures
- [ ] 8.2 Verify in the browser: a user with `dark` migrated keeps the dark theme; choosing a custom theme persists after reload and on another browser; the tags panel state is restored after login
