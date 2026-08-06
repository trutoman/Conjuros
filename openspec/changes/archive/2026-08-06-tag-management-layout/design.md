## Context

See `proposal.md` — Why. The tag management view renders each tag as a row (`src/web/components/TagList.tsx`) whose `.tag-row-label` is an inline flex container holding the tag name pill, swatch, category, and color. The description is currently rendered with `.tag-description { flex-basis: 100% }` (see `src/web/index.css`), which forces it onto its own line.

The tag management header (`CollectionPage.tsx`) has a `.search-field` next to the Add tag control. Its current CSS is `.tag-management-actions .search-field { flex: 1 1 14rem; min-width: 10rem }`, which caps its growth and prevents it from filling the available header space.

The collection search box, by contrast, sits in a full-width flex row (`.collection-subheader`) and uses `.collection-subheader .search-field { flex: 1 1 auto; min-width: 0 }`.

## Goals / Non-Goals

**Goals:**
- Keep the description on the same line as the tag name, category, and color in every tag row.
- Truncate the description with an ellipsis when it overflows the row width.
- Make the tag search box stretch to fill the available header width, matching the collection search box.

**Non-Goals:**
- Changing the tag data model, API, or contract (`description` already exists on `Tag`).
- Changing the collection search box itself.
- Altering the standalone `TagsPage` layout beyond the shared `TagList` change.

## Decisions

**D1: Inline truncation via CSS `text-overflow: ellipsis` on `.tag-description`.**
The description element stays in the flex row; set `flex: 0 1 auto`, `min-width: 0`, `white-space: nowrap`, `overflow: hidden`, and `text-overflow: ellipsis`. The row label container already uses `flex-wrap: wrap`, so it must switch to `flex-wrap: nowrap` so the description cannot wrap onto a new line; the ellipsis then applies when the description outgrows the remaining width.
- Alternative considered: letting the description wrap and keeping `flex-basis: 100%`. Rejected — the requirement is to keep the description on the same line at all times.
- The row uses `justify-content: space-between` with the menu on the right; `min-width: 0` on the label is already present and is retained so flex items can shrink.

**D2: Full-width search box via flex growth in `.tag-management-actions`.**
Change the search field rule to `flex: 1 1 auto; min-width: 0` (mirroring the collection search field) so it consumes all leftover header width. The `.tag-management-header` already uses `justify-content: space-between` with `flex-wrap: wrap`, so on narrow viewports the actions wrap below the heading while the search field still fills the full row.
- Alternative considered: leaving the current `flex: 1 1 14rem` cap. Rejected — it prevents the box from reaching the full available width as required.

**D3: Keep markup and component props unchanged.**
Only CSS changes are required for the layout; `TagList.tsx` markup (description as a child of `.tag-row-label`) is already correct. Tests are updated/extended to assert the rendered layout behavior (inline presence, truncation applied by style, absent when empty, search box width).

## Risks / Trade-offs

- [Description ellipsis relies on `nowrap`] → `white-space: nowrap` + `overflow: hidden` ensures the row never grows vertically; long descriptions are visually cut off, which is the intended trade-off per the requirement.
- [Very narrow viewports may compress the description to near-zero] → the tag name, category, and color are `flex: 0 0 auto`/natural width, so the description shrinks first; the row still wraps its actions below on narrow widths thanks to existing `flex-wrap` on `.tag-row`.
