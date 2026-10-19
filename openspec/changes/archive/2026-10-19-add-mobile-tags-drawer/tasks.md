## 1. Narrow-viewport drawer behavior

- [x] 1.1 Add a non-persisted `isMobileDrawerOpen` state to `CollectionPage` and a `closeMobileDrawer` helper
- [x] 1.2 Compute `showSidebar = !isNarrowViewport || isMobileDrawerOpen` and render the `.app-sidebar` wrapper (and its backdrop) only when it is true
- [x] 1.3 Short-circuit `handleToggleSidebar` to `closeMobileDrawer()` on narrow viewports so the backdrop, `Escape`, and close control all dismiss the drawer without touching `localStorage`
- [x] 1.4 Pass `closeMobileDrawer` as `Sidebar`'s `onClose` on narrow viewports while keeping the persisted collapse handler on wide viewports

## 2. Topbar Tags button

- [x] 2.1 Add the `.topbar-title-row` wrapper around the `Conjuros` heading in the topbar
- [x] 2.2 Render the `Tags` button (with `TagColumnIcon`, `aria-label="Open tags panel"`, `aria-expanded`, `aria-controls="tags-sidebar-panel"`) next to the title only when `isNarrowViewport`
- [x] 2.3 Wire the button to `setIsMobileDrawerOpen(true)`

## 3. Responsive styles

- [x] 3.1 Add `.topbar-title-row` (flex row with gap) and neutralize the `h1` margin inside it
- [x] 3.2 Scope the item inline content truncation to `.item-card .item-inline-content` and pin `overflow-wrap: normal` / `word-break: normal`
- [x] 3.3 Delete the two duplicated `@media (max-width: 650px)` blocks
- [x] 3.4 Extend the `@media (max-width: 768px)` block with the mobile topbar rules (hide `.eyebrow`, single-row topbar, smaller title, compact theme toggle, clipped `.user-widget-name`)

## 4. Tests and validation

- [x] 4.1 Replace the "keeps tags sidebar expanded on narrow viewports" test with one asserting the sidebar is hidden and the `Tags` button is shown
- [x] 4.2 Add a test that opens the drawer via the `Tags` button and closes it via the `Close sidebar` control
- [x] 4.3 Remove the `650px` CSS-text assertion for the old add-button sizing and drop the now-unused `node:fs`/`node:path` imports
- [x] 4.4 Add `.cloudfare_token` to `.gitignore`
- [x] 4.5 Run `npm run check` and confirm lint, tests, and build pass
