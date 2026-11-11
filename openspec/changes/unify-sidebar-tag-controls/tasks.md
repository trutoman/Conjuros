## 1. Theme settings icon

- [x] 1.1 Add `settings` to the shared icon contract and register the exact supplied path and viewBox in bundled defaults.
- [x] 1.2 Ensure seeded themes, theme editor, existing keyed and legacy themes, and the persisted backfill include the settings icon without replacing custom artwork.
- [x] 1.3 Render settings as a theme-colored filled shape, scoped so existing icon styles are unchanged.
- [x] 1.4 Test contract validation, theme creation and editing, read normalization, legacy conversion, backfill, custom artwork preservation, and active-theme rendering.

## 2. Sidebar toolbar

- [x] 2.1 Place the tags toggle, clear action, match selector, settings action, and conditional drawer close control in order in one flex container; remove the footer action and visible Tags, Clear, and Match text.
- [x] 2.2 Apply identical square icon-only styling to non-match controls while preserving match-toggle styling, responsive layout, focus treatment, and disabled states.
- [x] 2.3 Preserve accessible names, keyboard controls, expand/collapse, tag filtering, match state, drawer dismissal, and the existing manage-tags view.
- [x] 2.4 Update sidebar, match-toggle, and collection tests to verify control order, labels, actions, collapsed behavior, theme artwork, and narrow-drawer behavior.

## 3. Verification

- [x] 3.1 Verify the toolbar visually at desktop and narrow widths, including matching button dimensions, icon appearance, and absence of clipping.
- [x] 3.2 Run focused tests and `npm run check`; resolve or report failures.
