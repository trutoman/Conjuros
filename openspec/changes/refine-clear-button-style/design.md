## Context

See `proposal.md` (Why) and `specs/*` for requirements. Current state:

- `Sidebar.tsx` renders the clear button as `<ThemeIcon name="clear" />` followed by `<span>clear</span>`, with class `tags-clear-btn quiet` (own flex-row rule in `index.css`).
- `ICON_ASSETS.clear` is an outline redrawing (`viewBox="0 0 24 24"`) introduced by the unarchived `add-tags-clear-button` change; `iconAssetKeys` already contains `clear`, so seeds, service normalization/backfill, and `ThemeForm` need no structural change — only the artwork value changes.
- `tags-toggle-btn` (`index.css`) is `inline-flex`, column direction, centered, `gap: 0.15rem`, padding `0.35rem 0.65rem`, with the label `span` at `0.8rem`.
- The supplied artwork is a filled Material-style SVG (`viewBox="0 -960 960 960"`, `fill="#e3e3e3"`). The `icon-style` spec wants outline stroke icons; the user explicitly overrides that for this icon, so the verbatim path is stored and the fill is dropped (theme recoloring via the shared `.icon` styling applies as far as the geometry allows).

## Goals / Non-Goals

**Goals:**

- Capitalized "Clear" label stacked above the exact supplied artwork.
- Button visually identical to `tags-toggle-btn`.
- Stored themes converge on the new artwork without losing admin customizations.

**Non-Goals:**

- No behavior change (placement, disabled semantics, deselect, backfill mechanics).
- No new icon key, endpoint, or state shape.

## Decisions

### 1. Reuse the `tags-toggle-btn` class on the clear button

Render `<button className="tags-toggle-btn tags-clear-btn quiet">` with `<span>Clear</span>` first and `<ThemeIcon name="clear" />` second — the same element order as the Tags toggle (`<span>Tags</span>` + icon).

- Rationale: identical styling by construction rather than by duplicated CSS; the `tags-clear-btn` hook class remains only as a stable test/selector hook (and can keep zero rules if nothing clear-specific is needed).
- Alternative considered: extending the bespoke `.tags-clear-btn` rule to copy every `tags-toggle-btn` declaration — rejected, duplicates values that will drift.

### 2. Store the supplied path and viewBox verbatim, drop only the fill

`ICON_ASSETS.clear = { path: '<exact d from the request>', viewBox: '0 -960 960 960' }`. No color anywhere in the definition.

- Rationale: honors the explicit "exact SVG" requirement while keeping theme recoloring (no hardcoded `#e3e3e3`, which would break dark theme).
- Alternative considered: keeping the outline redrawing — rejected, directly contradicts the request.

### 3. Migrate the previous default artwork without touching customs

`buildIconAssetsRecord`/backfill currently preserve any existing `clear` entry. Add a narrow migration: when the stored `clear.path` equals the previous bundled outline-redraw path, replace it with the new verbatim artwork (and viewBox); any other stored value (admin customization) is preserved. Missing `clear` continues to be filled from defaults.

- Rationale: databases seeded while the outline version was current would otherwise keep the superseded artwork forever; value-equality against the known previous default cleanly separates "shipped default" from "admin custom".
- Alternative considered: always overwriting `clear` — rejected, would destroy admin customizations. Alternative: only filling missing keys — rejected, leaves the old default in place.

## Risks / Trade-offs

- [Risk] Verbatim filled geometry rendered through the shared stroke-based `.icon` styling may look heavier than other icons → Mitigation: user explicitly requested this artwork; per-theme editing remains available for later tuning. No extra CSS override (would fork the icon language).
- [Risk] An admin who customized `clear` to exactly the old default path keeps the old artwork (indistinguishable from the shipped default) → Mitigation: accepted; vanishingly unlikely and harmless.
- [Risk] `viewBox="0 -960 960 960"` differs from the `0 0 24 24` grid of other icons → Mitigation: `ThemeIcon` renders each icon with its own stored viewBox, so geometry scales correctly; no shared assumption is violated.

## Migration Plan

1. Deploy code (new `ICON_ASSETS.clear`, button markup/classes, targeted backfill rule) together.
2. New databases seed the verbatim artwork; existing databases converge via read normalization plus `backfillIconAssets` (previous-default values replaced, customs preserved).
3. Rollback: revert the change; themes already rewritten to the verbatim artwork keep it as a (valid but unknown-to-old-code) `clear` entry — old code renders it the same way since it reads the stored record.

## Open Questions

None.
