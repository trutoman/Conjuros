## 1. Rescaled clear artwork and two-variant migration

- [x] 1.1 Compute the rescaled `clear` path with a script (absolute positions: x / 40, (y + 960) / 40; relative deltas: / 40; round to 2 decimals) and set `ICON_ASSETS.clear` to it with `viewBox="0 0 24 24"`, verifying spot coordinates by inverse transform.
- [x] 1.2 Extend the superseded-artwork rule in `src/api/services/themes.service.ts` to migrate both previous `clear` variants (outline redrawing and 960-grid verbatim path) in read normalization and backfill, preserving any other stored value.
- [x] 1.3 Update theme tests: `clear` resolves to the rescaled path on the 24-grid with no hardcoded color, both old variants migrate on read and persist via backfill, and custom artwork survives.

## 2. Sidebar rendering verification

- [x] 2.1 Update sidebar tests to assert the rendered `clear` svg uses `viewBox="0 0 24 24"` and the rescaled path from the theme record (no markup or style change expected).
- [x] 2.2 Visually confirm the `Clear` button icon in the running app (dev server) at default and zoomed sizes.

## 3. Validation

- [x] 3.1 Run `npm run check` (lint → test → build) and fix failures.
- [x] 3.2 Run `openspec validate "fix-clear-icon-rendering"` and fix findings.
