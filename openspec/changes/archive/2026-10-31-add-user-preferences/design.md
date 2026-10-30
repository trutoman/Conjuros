## Context

Today the user's theme is a `theme_preference` enum column on `users` (`light` | `dark`), exposed as `theme` on the authenticated profile and changed through `PATCH /api/auth/me/theme`. The active theme is resolved by name from that value (`ThemesService.getActiveForUser`), falling back to the site default. The desktop tags sidebar state lives in `localStorage` under `conjuros_sidebar_open`, so it is per browser. See proposal.md for motivation and specs/ for the requirements.

## Goals / Non-Goals

**Goals:**
- A separate per-user preferences record holding `themeId` and `tagsPanelExpanded`.
- Any user can select any stored theme; administrators keep exclusive control over theme documents.
- The light/dark toggle, the theme selector modal, and the user menu share one preference write path.
- Startup applies the saved theme and tags panel state without a flash of the default.

**Non-Goals:**
- A Profile page (the menu entry is a disabled placeholder).
- Per-device preferences or local caching beyond what React Query already does.
- Changing how themes are authored, activated, or uploaded.

## Decisions

**Separate `user_preferences` table, one row per user.** Keyed by `user_id` (primary key, cascade on user delete), with `theme_id` referencing `themes.id` `ON DELETE SET NULL` and `tags_panel_expanded boolean NOT NULL DEFAULT true`. Deleting a theme therefore clears the selection in the database, and the fallback applies without any read-time rewrite. Alternative: columns on `users`. Rejected per the user's choice, to keep authentication data separate from preferences.

**Row creation.** The migration inserts one row per existing user, so every user has a preferences row. Users created later get a row on first write: reads return the defaults when the row is missing, and writes upsert.

**Migration `0010` in order:** create `user_preferences` with RLS enabled like the other tables; insert one row per existing user, setting `theme_id` to the seeded theme whose name equals the user's `theme` value (`null` when none matches, which resolves to the site theme); drop `users.theme`; drop the `theme_preference` enum type.

**`themeId` validated against the themes table.** The preferences service checks that the id exists (400 otherwise). The foreign key also protects the data, but the explicit check gives the client a clear error instead of a database constraint failure.

**Active theme resolution.** `getActiveForUser` reads the user's preferences: a non-null `themeId` that resolves to a stored theme wins (`source: 'preference'`); otherwise the site default is returned (`source: 'default'`), and the first theme is the last resort as today.

**Contract shape.** The authenticated profile becomes `{ id, email, role, preferences: { themeId, tagsPanelExpanded } }`. The update body is `{ themeId?: string | null, tagsPanelExpanded?: boolean }` with at least one field required. `PATCH /api/auth/me/theme` is removed (breaking, as stated in the proposal).

**Web preference state.** `useThemePreference` holds the saved `themeId` instead of `light | dark`, keeps the previous value when a save fails, and is the single writer for theme changes from the toggle and the selector. The light/dark toggle resolves the stored light and dark theme ids from the themes list and selects by id; its pressed state reads the active theme's name, so a custom theme leaves both options unpressed.

**Tags panel state.** Read from the authenticated profile at startup and written through the same preferences endpoint when the desktop sidebar is toggled. The `localStorage` key is no longer read or written. The narrow-viewport drawer keeps its existing non-persisted behavior.

**User menu.** `UserWidget` keeps its signature for sign out but opens a dropdown on the user's name. Its entries are a disabled "Profile", "Theme selector" (opens the selector modal), and "Sign out". Escape and outside clicks close it.

**Theme selector modal.** Uses the existing modal component and the themes list from the themes API. Selection is local until "Save theme preferences" is pressed; the save writes the preference, then closes the modal. Failures keep it open with the error.

## Risks / Trade-offs

- **Breaking API change for the profile shape** → Web and API ship together; tests in `packages/contracts` and the web fixtures are updated in the same change.
- **Migration removes `users.theme`** → Data is copied first, in the same migration, and the column is dropped only after the copy. Rollback means restoring the enum from the backup; the migration is not reversible by the app.
- **Theme deletion while selected** → The foreign key clears the selection, and the fallback path returns the site theme. A cached client copy may still show the deleted theme until the next load; acceptable.
- **Startup flash** → The profile already loads before the collection renders, so the saved tags state is available on first render; the theme still applies after the active theme request, as before.

## Migration Plan

1. Deploy migration `0010` with the API. Existing selections are copied before the column is dropped.
2. Deploy the web app in the same release, since the profile shape changed.
3. Verify with a user who had `dark`: after login, the dark theme is selected and the toggle shows it pressed.
4. Rollback: revert the release. The `users.theme` column is gone after `0010`, so a rollback needs a database restore or a follow-up migration that recreates it from `user_preferences`.
