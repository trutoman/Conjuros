## Context

Theme management today opens from a "Themes" button in the tags sidebar footer. `Sidebar` receives `onManageThemes`, and `CollectionPage` passes it only when `role === 'admin'`. The user menu (`UserWidget`) already hosts "Profile", "Theme selector", and "Sign out", and `CollectionPage` already owns the `manageThemes` modal state through `openManageThemes`. The theme list lives in `ThemeListView`, which renders a color swatch from `kindColors.command`, the label, and a second line with the internal theme name plus `· default` when applicable. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- One admin-only entry point for theme management, in the user menu.
- A theme list that reads as names only, keeping the default marker and every existing action.

**Non-Goals:**
- Changing theme CRUD, permissions, the theme form, or the theme selector.
- Renaming the existing "Manage themes" modal heading or its content beyond the list rows.
- Moving "Manage tags", which stays in the sidebar footer.

## Decisions

**Reuse the existing modal and state.** `openManageThemes` and the `manageThemes` state stay in `CollectionPage`. Only the trigger moves, so the modal markup, the actions, and the admin-only API guarantees are untouched. Alternative considered: a separate route or page. Rejected because the specs keep secondary windows as floating modals (`floating-modal-dialogs`).

**Gate the entry with the `role` prop, not a new permission field.** `CollectionPage` already receives `role`, and the server already refuses non-admin mutations with 403. The menu receives an optional `onThemeEditor` callback that is passed only when `role === 'admin'`, mirroring how `onManageThemes` was gated before. The server check remains the real authority; the client gate is presentation only.

**Menu order places "Theme editor" after "Theme selector".** The menu keeps Profile first and Sign out last, grouping the admin action with the theme selection it relates to.

**Default marker as its own element.** The current marker is text appended to the internal name line. Removing that line would drop the marker, so the badge moves next to the label. This keeps the "default" information without reintroducing the internal name.

**Remove the now-unused presentation.** The color swatch markup and its `.theme-list-preview` styles go away with the name code (`.theme-list-name`), so no dead CSS or dead markup remains.

## Risks / Trade-offs

- **Sidebar loses a button some admins got used to** → accepted by the user's request; the menu entry is one click deeper but grouped with other admin/personal actions.
- **Tests that opened the modal via the sidebar button must change** → updated in the same change to open it through the user menu as an administrator.
- **A non-admin could still reach the modal if a future caller passes the callback unconditionally** → the callback stays optional and the collection passes it only for admins; the API remains the enforcement point.
