## Why

The current settings gear is visually lighter than the thicker settings artwork the user wants. Replacing it consistently will make the settings action easier to recognize while keeping it legible in every active theme.

## What Changes

- Replace the settings icon artwork everywhere it is used with the supplied, heavier gear silhouette, keeping its 24-by-24 dimensions.
- Apply the new default artwork consistently to bundled and built-in theme icon data, including existing stored built-in theme values, without overwriting custom theme artwork.
- Treat settings as the sole filled/heavy icon exception to the shared outline style; keep its visible color theme-driven rather than fixed to the sample SVG's gray.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `icon-style`: Allow the settings icon to use the supplied heavier filled silhouette while retaining theme-derived color and the outline style for other icons.
- `theme-icon-storage`: Keep the settings artwork consistent across bundled defaults and built-in themes, including normalization of superseded stored defaults while preserving custom artwork.

## Impact

- Frontend bundled icon artwork and settings icon rendering.
- API theme defaults and stored theme icon normalization/backfill for built-in themes.
- Shared theme/icon specs and related tests; no API shape or dependency changes.
