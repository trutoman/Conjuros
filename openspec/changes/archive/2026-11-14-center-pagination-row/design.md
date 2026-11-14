# Design

## Context

See proposal.md and the `collection-pagination` delta. The row is a `<nav class="collection-pagination">` containing a `<p class="collection-range">` followed by `<div class="collection-pagination-actions">` with three icon buttons. Today the nav is a flex row with `justify-content: space-between`, which pushes the counter to the left edge and the buttons to the right edge. The narrow-viewport rule allows the row to wrap.

## Goals / Non-Goals

**Goals:**

- Center the counter-plus-controls group while keeping the counter before the controls.
- Change only presentation; preserve DOM order, accessible names, disabled logic, and placement below the list.

**Non-Goals:**

- Changing counter wording, page size, button artwork, or the row's position.
- Reintroducing edge alignment on any viewport.

## Decisions

**1. Center the existing flex row instead of restructuring it**

Set `justify-content: center` on `.collection-pagination` and keep the existing `gap`. The DOM already renders the counter first, so the requested left-to-right order needs no markup change. A grid with three columns was rejected: it adds an empty element per side and complicates the wrap. `text-align: center` was rejected because the controls are a flex child and would not move.

**2. Keep the wrapped rows centered**

The narrow-viewport rule keeps `flex-wrap: wrap`; with `justify-content: center` each wrapped line is centered. This satisfies the wrapped-group scenario without a separate media-query override. Add `row-gap` only if the existing `gap` does not cover the wrapped spacing (it does).

**3. Verify geometry in the browser, not in jsdom**

CSS geometry is not computed in jsdom, so the automated tests keep asserting structure and behavior (counter text, three named buttons, disabled states, DOM order) and a browser check measures the rendered group: its horizontal midpoint matches the content column's midpoint within a pixel or two, and the counter precedes the controls.

## Risks / Trade-offs

- **Centering can look off when the counter text length varies (for example `1–27 of 60` vs `1–1 of 1`).** → The group is centered as a whole, so only the group's width changes; the counter stays first and the swap is expected.
- **A media-query override elsewhere could re-apply `space-between`.** → The single `.collection-pagination` rule owns the alignment; search for other selectors touching the class when applying.
- **No automated visual regression coverage exists.** → The browser measurement plus the existing behavior tests are the verification for this change.

## Migration Plan

CSS-only change shipped with the web bundle. Rollback is a revert of the stylesheet edit.
