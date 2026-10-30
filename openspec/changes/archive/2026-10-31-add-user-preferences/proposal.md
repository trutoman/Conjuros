## Why

Every user sees the same theme choice (`light` or `dark`), and the desktop tags panel state is kept per browser in `localStorage`. Users want to pick any stored theme for themselves, and want their tags panel state to follow them across sessions and devices. Only administrators should create or edit themes.

## What Changes

- Add per-user preferences in a separate `user_preferences` table: the selected theme (`theme_id`, nullable) and the desktop tags panel state (`tags_panel_expanded`).
- A null `theme_id` means the user follows the site's active theme (the theme marked as active by an administrator). The active theme remains the fallback for users without a selection and for users whose selected theme was deleted.
- Users can select any existing theme. The light/dark toggle stays, and applies immediately when pressed.
- Add a user menu opened from the user's name in the top-right corner, with a disabled "Profile" entry, a "Theme selector" entry, and "Sign out".
- The theme selector opens a modal listing every theme as a vertical list, with a "Save theme preferences" button that applies the choice and closes the modal.
- Preferences are applied at startup: the saved theme and the tags panel state are restored.
- The desktop tags panel state moves from `localStorage` to the user's preferences. The narrow-viewport drawer still does not persist its state.
- **BREAKING**: `PATCH /api/auth/me/theme` is replaced by `PATCH /api/auth/me/preferences`, and the `theme` field of the authenticated profile becomes `preferences.themeId`. The `light`/`dark` values are migrated to the ids of the seeded themes.
- Theme creation, editing, deletion, activation, and image upload remain restricted to administrators; reading themes stays available to every user.

## Capabilities

### New Capabilities
- `user-preferences`: per-user storage and API for the selected theme and the tags panel state, with fallback to the site's active theme.
- `theme-selector`: the theme selection modal, the light/dark toggle behavior, and startup application of the saved theme.
- `user-menu`: the dropdown opened from the user's name, with its entries.

### Modified Capabilities
- `collection-layout-and-navigation`: the persisted desktop tags sidebar state is stored in the user's preferences instead of the browser.

## Impact

- **Database** (`src/api/db/schema.ts`, new migration `0010`): new `user_preferences` table; existing `users.theme` data migrated, then the column removed.
- **Contracts** (`packages/contracts/src/auth.ts`): replace `themePreferenceSchema` with a preferences schema that carries `themeId` and `tagsPanelExpanded`.
- **API**: new `PATCH /api/auth/me/preferences`; the `me` and login responses return `preferences`; `GET /api/themes/active` resolves the user's selected theme.
- **Web**: `UserWidget` becomes a dropdown; new theme selector modal; `ThemeToggle` works with any theme id; `CollectionPage` reads and writes the tags panel state through the API.
- **Tests**: API, repository, migration, contracts, selector modal, menu, and startup behavior.
