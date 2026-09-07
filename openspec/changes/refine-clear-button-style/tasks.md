## 1. Clear icon artwork and migration

- [x] 1.1 Replace `ICON_ASSETS.clear` in `src/web/lib/iconAssets.ts` with the verbatim supplied `path` and `viewBox="0 -960 960 960"`, carrying no color value.
- [x] 1.2 Extend the theme icon backfill (`src/api/services/themes.service.ts`) so a stored `clear` entry equal to the previous bundled outline-redraw artwork is replaced with the new verbatim artwork, while missing keys are still filled and any other stored value is preserved.
- [x] 1.3 Update theme API/service tests: `clear` resolves to the verbatim path/viewBox, previous-default artwork is migrated, custom `clear` artwork is preserved, and missing `clear` is backfilled.

## 2. Clear button label and style

- [x] 2.1 Rework the clear button in `src/web/components/Sidebar.tsx` to `<span>Clear</span>` above `<ThemeIcon name="clear" />` with classes `tags-toggle-btn tags-clear-btn quiet`, keeping position, `disabled` logic, `onClick`, and `aria-label` unchanged.
- [x] 2.2 Trim `index.css` so no duplicated `tags-toggle-btn` declarations remain on `.tags-clear-btn` (keep the hook only if needed) and verify enabled/disabled rendering.

## 3. Tests

- [x] 3.1 Update sidebar tests: visible text "Clear" with capital C, label-above-icon DOM order, `tags-toggle-btn` styling hook, icon rendered from the theme record, and unchanged enable/disable/click/collapse behavior.
- [x] 3.2 Update the collection filter test if it references the old label or order; the accessible name stays "Clear tag selection".
- [x] 3.3 Add a service-level test proving a stored previous-default `clear` is replaced while a custom `clear` survives backfill.

## 4. Validation

- [x] 4.1 Run `npm run check` (lint → test → build) and fix failures.
- [x] 4.2 Run `openspec validate "refine-clear-button-style"` and fix findings.
