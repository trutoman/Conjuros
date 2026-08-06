## Context

See proposal.md for motivation. Two surfaces need a borderless "X" close control:

- `TagForm` (`src/web/components/TagForm.tsx`) renders a `<form className="item-form">` whose only dismiss control is the `Cancel` button in `.form-actions`.
- The tag management view (`src/web/pages/CollectionPage.tsx`) renders `<div className="item-form tag-management-view">` with a text `← Collection` button in `.tag-management-actions`.

`.item-form` has no positioning context today (`padding`, `border`, `background`, `border-radius`, `height: 100%`, `overflow-y: auto`). The codebase already has a borderless circular "X" pattern in `.search-clear-button` (transparent background, no border, muted color, circular hover) that the close buttons should mirror for visual consistency.

## Goals / Non-Goals

**Goals:**
- Provide a single borderless floating "X" close button on both the Add tag form and the tag management view
- Wire both buttons to the existing dismiss handlers (`onCancel`, `closeManageTags`) with no behavior change
- Reuse one CSS class (`form-close`) with per-surface positioning overrides
- Keep both buttons accessible via explicit `aria-label`

**Non-Goals:**
- Removing the `Cancel` buttons (the "X" is an equivalent affordance, not a replacement)
- Changing save/validation/state logic or any API/contract
- Changing the `← Collection` button in `TagsPage.tsx` (a separate legacy page, out of scope)
- Adding animations beyond the existing hover transition pattern

## Decisions

### Decision 1: Shared `.form-close` style with position variants

**Approach:** Add one `.form-close` rule (borderless, transparent background, circular hover mirroring `.search-clear-button`) positioned absolute at `top: 0.5rem; right: 0.5rem` (top-right, for the Add tag form). The manage view uses the same default top-right position so both buttons float in the top-right corner of their surfaces.

**Rationale:** One class keeps both buttons visually identical and both sit in the top-right corner. Avoids duplicating button styles.

**Alternative considered:** A `float`/flex approach without absolute positioning. Rejected because the buttons must overlay the form corner without disturbing the document flow.

### Decision 2: `.item-form` becomes the positioning containing block

**Approach:** Add `position: relative` to `.item-form`, making both the Add tag form and the manage view the containing block for their absolutely positioned close buttons.

**Rationale:** Both surfaces already share the `.item-form` class, so a single rule gives both a positioning context with no new wrapper elements.

### Decision 3: Clear the top-right corner of the manage view heading

**Approach:** Give `.tag-management-view .tag-management-header` `padding-right` so the `Manage tags` heading and actions do not sit under the floating top-right "X".

**Rationale:** The header `h2` and actions occupy the top-right area where the manage-view close button floats; padding shifts the header left without affecting the Add tag form (whose heading stays clear of the top-right button).

### Decision 4: Keep `Cancel` and reuse existing dismiss handlers

**Approach:** The close buttons call the same handlers as today's dismiss controls — `onCancel` in `TagForm`, `closeManageTags` in the manage view — and the `Cancel` buttons remain.

**Rationale:** Zero behavior change; the "X" is purely a UI affordance. This satisfies the requirement that the close button behave identically to the existing dismiss paths.

### Decision 5: Accessible labels

**Approach:** `aria-label="Close tag form"` on the Add tag form button and `aria-label="Close tag management"` on the manage view button, both rendering an `✕` glyph.

**Rationale:** Matches the codebase pattern of icon buttons carrying explicit `aria-label` (e.g., the sidebar collapse and search-clear controls). The labels are also the query targets for tests.

## Risks / Trade-offs

- [Absolutely positioned buttons scroll with `.item-form`'s `overflow-y: auto`] → Acceptable: both buttons sit at the top of the form where they remain visible; the manage view header is the first element.
- [Top-right "X" overlaps the `Manage tags` heading] → Mitigated by header `padding-right`.
- [An `✕` text glyph may render differently across fonts] → Mitigated by reusing the existing `✕` glyph already used by `.search-clear-button`.
