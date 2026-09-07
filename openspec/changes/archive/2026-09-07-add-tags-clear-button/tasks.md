## 1. Theme-owned `clear` icon

- [x] 1.1 Add `'clear'` to `iconAssetKeys` in `packages/contracts/src/theme.ts` (after `'close'`).
- [x] 1.2 Add the outline stroke-style `clear` entry (`path` + `viewBox="0 0 24 24"`, no color) to `ICON_ASSETS` in `src/web/lib/iconAssets.ts`.
- [x] 1.3 Verify theme seeds (`themeSeed.ts`), service read-normalization/backfill (`themes.service.ts`), and `ThemeForm` icon editing pick up `clear` with no special-casing.
- [x] 1.4 Update theme API/service tests and fixtures asserting the icon key set (20 → 21 keys, legacy-array normalization, missing-key backfill including `clear`).

## 2. Sidebar clear button

- [x] 2.1 Render the `clear` button as the first child of `.sidebar-header-right` in `src/web/components/Sidebar.tsx` (order: clear → `TagMatchToggle` → close), same header row, no other layout change.
- [x] 2.2 Wire state from `filters.tags`: `disabled` while empty, enabled when ≥1 tag selected; content is `<ThemeIcon name="clear" />` plus visible text "clear", `type="button"`, `aria-label="Clear tag selection"`.
- [x] 2.3 Implement activation as `onChange({ ...filters, tags: [] })` so the selection empties and the button returns to disabled.
- [x] 2.4 Style the button consistently with sidebar header controls, including a visibly disabled state, with no hardcoded icon color (theme `currentColor`) and no filled-s qualities.

## 3. Tests

- [x] 3.1 Add/extend sidebar tests: button visible + disabled with no selection, enabled after selecting one/multiple tags, click deselects all and disables again, keyboard operable, accessible label present.
- [x] 3.2 Add/extend collection filter tests: clearing tags via the button resets the filtered item list.
- [x] 3.3 Add/extend icon rendering tests: `clear` renders from the active theme record and follows theme changes.

## 4. Validation

- [x] 4.1 Run `npm run check` (lint → test → build) and fix failures.
- [x] 4.2 Run `openspec validate --change add-tags-clear-button` (and `--strict` if available) and fix findings.
