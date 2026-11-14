# Design

## Context

See proposal.md and the capability delta. The sidebar header is a flex row (`.sidebar-header`: `display: flex; align-items: center; gap: 0.25rem`) rendering, in order, the tags toggle, the clear button, `TagMatchToggle`, the settings button, and — only at or below the mobile breakpoint — the close button. All icon controls share `.tags-toggle-btn` (`flex: 0 0 2rem`), so without an auto margin the settings button hugs the match selector and the row's remaining space sits after the last control.

## Goals / Non-Goals

**Goals:**

- Push `Manage tags` to the end of the header row with a minimal, semantic hook.
- Leave the existing control order, sizes, and accessible names untouched.

**Non-Goals:**

- Changing the header's other controls, the match selector, or the collapsed state.
- Introducing a right-hand action group for future controls.

## Decisions

**1. Dedicated class plus `margin-left: auto`**

Add `tags-manage-btn` to the settings button and declare `.sidebar-header .tags-manage-btn { margin-left: auto; }`. An auto margin absorbs the row's free space, which is the flexible way to end-align a single flex child without changing the markup structure. The class gives the rule a stable, semantic hook independent of the accessible name.

**2. Rejected alternatives**

- Styling via `[aria-label='Manage tags']`: works with no markup change, but couples presentation to a user-facing string that may be translated or reworded.
- Wrapping the trailing controls in a `.sidebar-header-end` flex group: useful when several actions must share the right edge, but today it adds a wrapper and a second flex context for one button.
- `justify-content: space-between`: would spread every child instead of pushing only the last group.

**3. Mobile ordering is already correct**

The close button is rendered after the settings button and is display-gated to narrow viewports, so the auto margin moves both to the end while keeping close last. No `order` rule is needed.

## Risks / Trade-offs

- **A future control added after the settings button joins the right edge.** → Expected with `margin-left: auto`; if the new control must stay left, it belongs before the settings button.
- **The class is purely presentational.** → No test asserts CSS classes; existing tests keep querying by role and accessible name, and the browser check measures the rendered geometry.
- **Width transitions could show a momentary gap shift.** → The sidebar already animates width; the auto margin recalculates continuously and ends flush.

## Migration Plan

One class plus one CSS rule shipped with the web bundle. Rollback is a revert of those two edits.
