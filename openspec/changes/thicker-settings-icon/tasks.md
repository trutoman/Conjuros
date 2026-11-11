## 1. Update Settings Icon Defaults and Rendering

- [x] 1.1 Replace the bundled settings artwork with the supplied 24-by-24 gear path and ensure it renders with the active theme color.
- [x] 1.2 Update each built-in theme's settings artwork to match the bundled default.
- [x] 1.3 Scope the heavier filled rendering exception to settings and verify other icons remain outlined.

## 2. Migrate Stored Built-In Theme Artwork

- [x] 2.1 Update stored-default normalization and backfill to replace only the previous bundled settings artwork with the new default.
- [x] 2.2 Add coverage proving custom settings artwork is preserved and superseded defaults are replaced.

## 3. Verify Settings Icon Behavior

- [x] 3.1 Add frontend coverage for the supplied artwork, theme-derived color, and consistent appearance across built-in themes.
- [x] 3.2 Run `npm run check` and resolve any failures caused by this change.
