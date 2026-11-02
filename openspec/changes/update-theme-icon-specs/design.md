## Context

The icon work in PRs #64, #65, #66, and #67 is already merged. The main specs still describe the previous twenty-two-key artwork, and they do not require the tags controls or the description accordion to use theme-owned artwork. This change is a retroactive specification sync, not a new implementation.

## Goals / Non-Goals

**Goals:**

- Make the main specs match the shipped icon behavior.
- Record the `tags` key and the controls that consume it.
- Record the collapse/expand chevrons used by the item description accordion.
- Record the superseded-artwork migration behavior that the API already applies.

**Non-Goals:**

- Changing application code, the theme contract, or the database schema.
- Adding new migrations; the existing read normalization and `backfillIconAssets` already implement the migration behavior.
- Changing icon artwork or visual design.

## Decisions

- Use MODIFIED for the existing `theme-icon-storage` key-set requirement because the key list changes from twenty-two to twenty-three.
- Use ADDED requirements for the new observable behaviors (tags controls, description accordion, attachment 24-unit style, and superseded-artwork migration) because they add requirements without changing the existing key-set behavior.
- Keep the existing `clear` requirement unchanged; it already requires a 24-unit outline icon sourced from the active theme.
- Update `collection-layout-and-navigation` for the tags controls and `item-card-experience` for the accordion, so each behavior lives in the capability that owns it.
- Do not pin exact SVG path strings in the specs; paths are data, while the specs describe sourcing, style, and migration behavior.

## Risks / Trade-offs

- [Spec drift if future artwork changes skip OpenSpec] → Keep the migration and sourcing requirements behavior-level so they remain valid when the path values change.
- [Duplicating icon sourcing rules across capabilities] → `theme-icon-storage` owns the icon model and migration; the layout and item-card capabilities only state which key their controls consume.
