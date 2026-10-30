## Why

Theme administration is buried in the tags sidebar footer, which is unrelated to theme work and confuses the sidebar's filtering purpose. Administrators want theme editing next to the other personal actions in the user menu, and the theme list should read as a plain list of names instead of exposing raw color swatches and theme name codes.

## What Changes

- Remove the "Themes" button from the tags sidebar footer. The sidebar footer keeps only "Manage tags".
- Add a "Theme editor" entry to the user menu, available only to administrators, which opens the existing theme management modal.
- Keep the non-admin user menu unchanged: no "Theme editor" entry is rendered or reachable for regular users.
- Simplify the theme list inside the theme editor modal: each row shows the theme's label and, for the site default, its default marker. The color swatch preview and the theme name code are removed.
- Keep the existing row actions (Activate, Edit, Delete) and the "Add theme" control.
- No API, database, or contract changes.

## Capabilities

### New Capabilities
- `theme-editor`: the administrator entry point for theme management, its admin-only visibility, and the content of the theme list it opens.

### Modified Capabilities
- `user-menu`: the dropdown gains a "Theme editor" entry that only administrators can see and use.
- `collection-layout-and-navigation`: the tags sidebar footer no longer offers theme management.

## Impact

- **Web**: `UserWidget` gains an optional theme-editor action rendered only for administrators; `CollectionPage` drops the sidebar wiring for theme management and passes the admin flag to the menu; `Sidebar` loses the `onManageThemes` control; `ThemeListView` drops the color swatch and name code.
- **Tests**: user menu visibility per role, sidebar footer contents, and theme list rendering.
- **Unchanged**: theme CRUD endpoints, permissions on the server, the theme form, and the theme selector.
