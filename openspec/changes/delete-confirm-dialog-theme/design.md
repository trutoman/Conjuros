## Context

See `proposal.md` Why. Current state (`src/web/index.css:1417`):

- `.confirm-dialog` sets `background: #fffefa` and `border: 2px solid #174f43` — hardcoded light colors.
- `.modal-panel` (the `Modal` wrapper) sets no background of its own, so the hardcoded confirm-dialog surface is what the user sees.
- Sibling dialogs (Manage tags, item/theme forms) render their surface from `.item-form` with `var(--surface)`, which `applyTheme` (`src/web/lib/applyTheme.ts`) overrides per theme on `document.documentElement`. The confirm dialog is the outlier.

Constraints: reuse existing theme variables only (no new variables); no markup or behavior change; scope stays on `.confirm-dialog` (the similarly hardcoded `.auth-panel` is explicitly out of scope).

## Goals / Non-Goals

**Goals:**

- Delete confirmation matches the active theme's surface, border, and text colors.
- Default light theme keeps its current appearance.

**Non-Goals:**

- Restyling the dialog (spacing, buttons, shadows) or touching `.auth-panel` and other surfaces.
- New theme variables or changes to `applyTheme`.

## Decisions

### 1. Theme variables over hardcoded colors in `.confirm-dialog`

- `background: var(--surface)` (same token as `.item-form`), `border: 2px solid var(--border-strong)` (keeps the 2px outline weight, now theme-driven), and `color: var(--text)` so the heading/body inherit the theme text color instead of `body`'s — the dialog inherits from `body` today, but stating it guards against regressions if the rule ever gains its own color.
- Alternative considered: `var(--surface-elevated)` for extra pop — rejected; consistency with the other dialog panels (`.item-form` → `--surface`) matters more than elevation here.
- The `box-shadow` on `.modal-panel > .confirm-dialog`... (there is none today; the dialog gets `--shadow` only via other panels) — leave shadows untouched.

### 2. Verify by computed style, not screenshots

- Add a frontend test asserting the `.confirm-dialog` rule (or computed style) resolves background/border to the theme variables and contains no hardcoded hex. `applyTheme` already has unit coverage; this change only needs to prove the dialog consumes the tokens.
- Alternative considered: manual visual check only — rejected; a cheap assertion locks the regression.

## Risks / Trade-offs

- [Risk] Media-query or later rule overrides the new declarations → Mitigation: keep selector specificity identical (`.confirm-dialog`), only swap values.
- [Risk] Snapshot-style tests asserting exact colors break → Mitigation: update them to the variable-based expectation; run `npm run check`.

## Migration Plan

No migration. CSS-only change; rollback by reverting the rule. Verify with `npm run check` (lint → test → build).

## Open Questions

None.
