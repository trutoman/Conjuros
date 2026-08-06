## Context

See proposal.md - Why. In `ItemForm.tsx`, the Tags field is currently wrapped in `FormField label="Tags"`, which renders a `<label class="form-field"><span>Tags</span>...</label>` row. Inside, a `<fieldset>` uses a `sr-only` legend ("Owned tags") and renders each tag as a plain `<label><input type="checkbox">text</label>` row. The sidebar (`Sidebar.tsx`) already renders tags as `tag-filter-pill` elements inside `ul.category-tags-list` with per-tag inline colors (`color`, `borderColor`, `background: color-mix(...)`). The form should reuse that same look.

## Goals / Non-Goals

**Goals:**
- Remove the duplicate "Tags" span; the fieldset legend becomes the visible "Tags" label.
- Render available tags as `tag-filter-pill`-styled checkboxes with per-tag colors, matching the sidebar.
- Preserve form submission and tag toggle behavior.

**Non-Goals:**
- Changing the sidebar, filter bar, or other pill usages.
- Changing the item schema or tag data model.
- Introducing a shared component abstraction for pills (reuse the existing class directly).

## Decisions

### Decision 1: Use the fieldset legend as the visible "Tags" label

**Approach:** Replace `<FormField label="Tags"><fieldset>...</fieldset></FormField>` with a `<fieldset className="item-form-tags"><legend>Tags</legend>...</fieldset>` (no `FormField` wrapper). Style the legend to match the form's label look (mono, muted, same size as other field labels).

**Rationale:** Eliminates the duplicate label by construction; `FormField` always renders its `<span>` label, so the tags field cannot keep using it. The `legend` is the semantically correct container for a fieldset group label and is read by assistive tech.

**Alternative considered:** Keep `FormField` but pass an empty label — rejected, it still renders an empty `<span>` and adds a grid row.

### Decision 2: Render tags as pills using the existing `.tag-filter-pill` + inline color style

**Approach:** For each available tag render `<label className="tag-filter-pill" style={{ color, borderColor, background: checked ? 20% : 8% mix }}><input type="checkbox" aria-label={tag.tagName} ... />{tag.tagName}</label>`, mirroring `Sidebar.tsx`. Use a `ul.category-tags-list`/`li` wrapper or reuse the flex wrap layout so pills wrap like the sidebar.

**Rationale:** Reuses battle-tested pill styling (CSS at `index.css:260`) and the exact sidebar color recipe (`color-mix(in srgb, ${color} 8%/20%, var(--surface))`), so the visual matches with no new CSS machinery.

**Alternative considered:** New dedicated `.item-form-tag-pill` CSS class — rejected; duplicates styling that already exists and would risk drift from the sidebar.

### Decision 3: Adjust `.item-form fieldset` layout for wrapping pills

**Approach:** Scope the tags fieldset with `className="item-form-tags"` and give it `display: flex; flex-wrap: wrap; gap` (or reuse `category-tags-list`), overriding the generic `.item-form fieldset` rule which currently uses `gap: 1rem` for a single-line flex.

**Rationale:** The generic rule was written for the two-option layout; pills need wrap behavior for many tags.

## Risks / Trade-offs

- **Risk:** The generic `.item-form fieldset label` font-size rule (0.9rem) could clash with the pill's 0.75rem size → **Mitigation:** scope/override for the tags fieldset so pill typography wins.
- **Risk:** Removing the `FormField` wrapper changes label→control association for the fieldset → **Mitigation:** the visible `legend` preserves the accessible name; checkbox inputs keep `aria-label={tag.tagName}`.
- **Trade-off:** Pills in the form will look identical to the sidebar rather than the plain checkbox list → **Acceptable:** this is the requested visual consistency.
