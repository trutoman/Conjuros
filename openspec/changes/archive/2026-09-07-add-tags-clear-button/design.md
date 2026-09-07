## Context

See `proposal.md` (Why) and `specs/*` for requirements. Current state shaping the approach:

- `src/web/components/Sidebar.tsx` renders `.sidebar-header` with the `Tags` toggle button (`tags-toggle-btn`) followed by `.sidebar-header-right`, which today holds `<TagMatchToggle>` (Match any/all) and the optional sidebar close button. Filter state arrives via `filters: CollectionFilters` (`tags: string[]`, `tagFilterMode`) with `onChange` as the only mutation path.
- Icons are theme-owned: `IconAssetKey` in `packages/contracts/src/theme.ts` (currently 20 keys), defaults in `src/web/lib/iconAssets.ts` (`ICON_ASSETS`), seeds via `iconAssetsFromDefaults()` in `src/api/repositories/themeSeed.ts`, read normalization/backfill in `src/api/services/themes.service.ts`, rendering via `<ThemeIcon name="…"/>`, editing via `ThemeForm.tsx`.
- The `icon-style` spec requires all icons to be outline stroke marks (`fill: none`, `currentColor`), same rendered size, no hardcoded color. The requested artwork is a filled Material-style icon (`viewBox="0 -960 960 960"`, filled silhouette), so it cannot be reused verbatim.

## Goals / Non-Goals

**Goals:**

- One-click deselect of all filter tags from the sidebar header with disabled-until-selection semantics.
- Header placement Tags → clear → Match in the same row with no other layout movement.
- Theme-owned `clear` icon that behaves like every other icon (fetch on mount/theme change, per-theme editing, read backfill).

**Non-Goals:**

- No change to tag filtering semantics (any/all match, pill selection, persistence) beyond clearing the selection.
- No new backend endpoint or filter state shape; clearing reuses the existing `onChange({ ...filters, tags: [] })` path.
- No sidebar visual redesign, animation, or new dependency.

## Decisions

### 1. Button placement: first child of `.sidebar-header-right`

Render the clear `<button type="button">` as the first child of `.sidebar-header-right`, before `<TagMatchToggle>`, leaving the optional close button last.

- Rationale: satisfies "between the Tags button and the Match selector, same row" with the smallest DOM change; the `Tags` toggle and `Match` controls keep their positions and the column distribution is untouched (flex row only gains one item).
- Alternative considered: a second header row or a footer control — rejected, violates the explicit placement requirement and shifts the column layout.

### 2. Stateless derivation from `filters.tags`

`const hasSelection = filters.tags.length > 0`; button gets `disabled={!hasSelection}` and `onClick={() => onChange({ ...filters, tags: [] })}`. No local state, no effect, no API call.

- Rationale: selection is already the single source of truth in the parent; derivation keeps disabled/enabled transitions (select → enabled, clear → disabled) trivially correct, including keyboard toggling of pills.
- Alternative considered: local `useState` mirror — rejected, risks drift with externally changed filters.

### 3. New `clear` IconAssetKey instead of a hardcoded SVG

Append `'clear'` to `iconAssetKeys` (after `'close'`), add the entry to `ICON_ASSETS` defaults, and let seeds (`iconAssetsFromDefaults`), service read-normalization (missing-key backfill), and `ThemeForm` (iterates `IconAssetKey`) absorb it with no special-casing. Sidebar renders `<ThemeIcon name="clear" />` beside the visible text "clear".

- Rationale: keeps the "database owns icon shapes per theme" invariant; per-theme customization, validation, and theme-switch re-render work for free.
- Alternative considered: inline the user-supplied `<svg>` in `Sidebar.tsx` — rejected, breaks theme ownership/editing and bakes a fixed fill color into the UI.

### 4. Redraw the requested artwork as an outline stroke icon

Author a new `clear` path on `viewBox="0 0 24 24"` as stroke geometry (filter/clear motif with an x-mark, e.g. funnel outline crossed out) rather than converting the filled Material path. Keep `fill: none` rendering via the shared `.icon` styling and no color in the definition.

- Rationale: the supplied path is a filled silhouette on a `-960` grid; stroking it directly yields wrong weight/geometry. A same-size outline redrawing preserves meaning ("clear the tag filter") while meeting `icon-style`.
- Alternative considered: reuse the exact `d` verbatim with `fill` — rejected, violates the outline-style requirement and the `0 0 24 24` grid convention.

### 5. Accessible label with visible text

Visible content is the icon plus the text "clear"; the button carries `aria-label="Clear tag selection"` (or equivalent) and uses the native `disabled` attribute so it is focusable-announced but not activatable while disabled.

- Rationale: visible text satisfies the explicit "tendrá el texto clear" requirement; a dedicated accessible label disambiguates it from the search-box clear buttons elsewhere.

## Risks / Trade-offs

- [Risk] Stored themes in existing databases lack the `clear` key → read-normalization backfills it from bundled defaults, so old documents render correctly without a data migration.
- [Risk] Tests/fixtures enumerating exactly 20 icon keys (theme API/service/icon tests) fail after adding the 21st → Mitigation: update key-count assertions, seeds, and fixtures in the same change.
- [Risk] Outline redrawing may not match the user's pixel expectations for the supplied filled icon → Mitigation: keep the funnel + x-mark metaphor close to the original "filter with clear" idea and confirm visually in review; artwork remains per-theme editable afterwards.
- [Risk] Header row crowding on narrow widths → Mitigation: no layout change by design; button is compact (icon + short text) and inherits existing header flex behavior. If overflow appears, it is a pre-existing responsive concern, not introduced here.

## Migration Plan

1. Deploy code + contracts together (frontend defaults, seeds for new DBs, backfill for existing DBs are all code-driven).
2. No manual data migration: existing themes gain `clear` on read; new saves persist all 21 keys.
3. Rollback: revert the change; a stored `clear` key on themes saved in the interim is ignored by the previous 20-key code path.

## Open Questions

None. Icon final artwork review happens at implementation time against the outline-style constraint.
