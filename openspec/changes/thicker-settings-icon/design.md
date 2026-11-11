## Context

See proposal.md for motivation. The frontend renders theme icon paths from theme data, with bundled icon assets serving as defaults. The icon-style contract currently requires outline icons, while settings artwork is stored per theme and may also have custom values.

## Goals / Non-Goals

**Goals:**
- Keep the new settings glyph consistent in bundled defaults and built-in stored themes.
- Preserve active-theme coloring and existing custom theme artwork.
- Isolate the filled-style exception to the settings icon.

**Non-Goals:**
- Change the theme API shape, icon key set, or settings action behavior.
- Change the style or artwork of any other icon.

## Decisions

- Use the supplied gear path and 24-by-24 viewBox as the settings glyph, applying theme color at render time instead of retaining the sample's fixed gray fill. This preserves contrast in light and dark themes; keeping the literal fixed fill would not.
- Update the bundled default and built-in theme defaults, and treat only a stored path matching the previous bundled settings default as superseded during read normalization and backfill. This follows the existing custom-art preservation approach and avoids replacing administrator-authored artwork.
- Keep the settings style exception scoped to settings rendering rather than exposing a reusable filled-icon mode. Redrawing the supplied glyph as an outline would not achieve the requested heavier appearance, while a global filled style would violate the shared icon language.

## Risks / Trade-offs

- [The filled settings silhouette may appear visually heavier than neighboring outline icons] → Limit the exception to the settings action and verify it at the existing rendered size in both theme palettes.
- [A stored built-in theme may not match the exact legacy default path] → Preserve unmatched artwork rather than guessing that it is safe to replace; ensure bundled defaults still use the new artwork.

## Migration Plan

Update the bundled artwork and guarded stored-default normalization/backfill together. No schema or API migration is required. Rollback by restoring the prior bundled default and reversing the guarded replacement for rows that still contain the new default; leave custom values untouched.
