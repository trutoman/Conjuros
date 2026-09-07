## Context

See `proposal.md` (Why) and `specs/theme-icon-storage/spec.md` for requirements. Current state:

- `ICON_ASSETS.clear` holds the supplied path verbatim on `viewBox="0 -960 960 960"`; `ThemeIcon` renders `<svg class="icon" viewBox={stored.viewBox}><path d={stored.path} /></svg>`, and `.icon` sets `fill: none; stroke: currentColor; stroke-width: 1.8`.
- `themes.service.ts` migrates one superseded variant (the outline redrawing, matched by exact previous-default path) in both `normalizeStoredTheme` (read-time copy) and `buildIconAssetsRecord` (persisted backfill); `backfillIconAssets` compares against the raw stored value so migrations persist.
- The supplied geometry spans x 80–880 and y −880–−80, which maps exactly onto a 24-grid with 2-unit margins: x / 40 → 2–22, (y + 960) / 40 → 2–22.

## Goals / Non-Goals

**Goals:**

- Visibly correct `Clear` icon at the same weight as other icons, with geometry faithful to the supplied SVG.
- Both superseded stored variants converge without touching customs.

**Non-Goals:**

- No markup, style, label, behavior, key-set, or schema change.
- No per-icon rendering fork (no fill flag, no `vector-effect` overrides).

## Decisions

### 1. Rescale coordinates with a script, not by hand

Compute the new path with a one-off script: parse the `d` string into commands and apply x' = x / 40, y' = (y + 960) / 40 to absolute positions (first `m` pair, `M`, `T` pairs) and x' = x / 40, y' = y / 40 to relative deltas (`q`, `v`, `h`, implicit linetos after `m`). Round to 2 decimals, verify by inverse-transforming spot coordinates (e.g. `M320-240` → `M8 18`, trailing `160-720v480-480Z` segment lands inside 2–22).

- Rationale: the path mixes absolute (`M`, `T`) and relative (`m`, `q`, `v`, `h`) commands plus implicit pairs, so hand-editing every number risks shifting subpaths; a script plus inverse check is exact.
- Alternative considered: per-icon filled rendering (`fill: currentColor`, no stroke) — rejected, forks the icon language and needs contract/service/ThemeIcon changes for one icon. Alternative: `vector-effect="non-scaling-stroke"` — rejected, `ThemeIcon` has no per-icon attribute hook and fill-less filled geometry would still look wrong.

### 2. Match migration against the set of known shipped defaults

Replace the single `SUPERSEDED_CLEAR_PATH` constant with a set containing both previous paths (outline redrawing and 960-grid verbatim). Both `normalizeStoredTheme` and `buildIconAssetsRecord` migrate on set membership; anything else is preserved as a customization.

- Rationale: exact-value matching already cleanly separates shipped defaults from customs; extending it to two values handles databases seeded at either stage with no new machinery.
- Alternative considered: matching on `viewBox !== "0 0 24 24"` — rejected, would clobber an admin custom that legitimately uses another grid.

## Risks / Trade-offs

- [Risk] Rounding to 2 decimals introduces up to ~0.005-unit error per coordinate → Mitigation: negligible at 1.1 rem rendering (sub-pixel by two orders of magnitude); inverse-transform check bounds the error explicitly.
- [Risk] An admin customization exactly equal to a shipped default keeps getting migrated → Mitigation: accepted as before (indistinguishable, vanishingly unlikely, harmless).
- [Risk] Stroked rendering of filled-geometry outlines looks heavier than pure outline icons → Mitigation: pre-existing accepted trade-off from the verbatim-artwork decision; rescaling only fixes visibility, not style.

## Migration Plan

1. Deploy code (rescaled `ICON_ASSETS.clear`, two-variant migration rule) together.
2. New databases seed the rescaled artwork; existing ones converge via read normalization plus `backfillIconAssets`.
3. Rollback: revert; already-rewritten themes keep a valid `clear` entry the old code renders from the stored record.

## Open Questions

None.
