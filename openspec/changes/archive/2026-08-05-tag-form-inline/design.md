## Context

See `../tag-form-inline/proposal.md` for motivation. The collection page already renders the item form inline: `CollectionPage.tsx` holds `formItem` state (`undefined` | `null` | `CollectionItem`) and, when `formItem !== undefined`, swaps the entire `.main-content-frame` content (subheader + list) for `<ItemForm>` (CollectionPage.tsx:156-163). `TagForm` already exists and shares the same `.item-form` class styles as `ItemForm`, and `CollectionPage` already wires `useTags()` exposing `create`/`update`/`remove`/`reorder`. The standalone `TagsPage.tsx` remains the home of the full tag list, reorder, and delete.

## Goals / Non-Goals

**Goals:**
- Render `TagForm` as the sole content inside `.main-content-frame`, replacing subheader and collection list — same pattern as `ItemForm`
- Add an inline add–/edit-tag entry point in the collection so tags can be created/edited without navigating away
- Reuse the existing state/async patterns (`useTags`, `formItem`-style state)

**Non-Goals:**
- Removing the standalone `TagsPage` or its list/reorder/delete management
- Changing `TagForm` internals, validation, or its API wiring
- Adding animation/transitions
- Any backend or contract changes

## Decisions

### Decision 1: Mirror the item-form state pattern with `formTag`

**Approach:** Add a `formTag` state in `CollectionPage` parallel to `formItem` (`undefined` = hidden, `null` = create mode, `Tag` = edit mode). In `.main-content-frame`, render in priority order: `TagForm` when `formTag !== undefined`, then `ItemForm` when `formItem !== undefined`, otherwise the collection view (subheader + list). Opening either form sets the other to `undefined` so only one frame form can be active.

**Rationale:**
- Directly mirrors the already-implemented item pattern — minimal new concepts
- Reuses existing `useTags()` methods for save (`create`/`update`)
- Single source of truth for what occupies the main frame

**Alternative considered:** A generalized "active view" union. Rejected as premature abstraction; the two states behave identically and stay simpler as siblings.

### Decision 2: Inline trigger lives in the sidebar; "Manage tags" stays navigation

**Approach:** Keep the "Manage tags" button navigating to `TagsPage` (it remains the place for the full list/reorder/delete). Add an inline tag action — an "Add tag" entry and an edit affordance on each sidebar tag — that opens `TagForm` in the main frame via `formTag`. Editing inline is an explicit per-tag action separate from the tag's filter checkbox.

**Rationale:**
- Scoped to "inline tag form only": users can create/edit a tag in the collection, while full management still lives on `TagsPage`
- Preserves existing navigation; no removal/breaking change

**Alternative considered:** Make "Manage tags" itself open an inline panel. Rejected: that reverts to embedding the full management screen, which is out of scope.

### Decision 3: Collapse the frame into a small explicit condition

**Approach:** Rename/extend the frame condition into a readable nested check (`formTag !== undefined ? <TagForm/> : formItem !== undefined ? <ItemForm/> : <subheader + list>`), with Save/Cancel returning the corresponding state to `undefined` to restore the collection view (search position preserved, as filters live in `filters` state).

**Rationale:**
- Trivial change to the existing structure; no restructure of the page
- Guarantees the search box/subheader return in their original position because they are re-rendered from the same source (CollectionPage.tsx:155-243)

## Risks / Trade-offs

- **Opacity of "why this location":** entry-affordance placement is a UI detail → Mitigation: documented as an Open Question; no spec or approach depends on it
- **Two sibling states could drift** → Mitigation: both are one-line `useState` mirrors; the combined condition keeps them mutually exclusive
- **Search/filters unavailable while a tag form is open** → This follows the intended fullscreen pattern; user returns by Save/Cancel

## Open Questions

- Exact placement/visual of the inline "Add tag" entry and the per-tag edit affordance in the sidebar. This is a UI detail, resolvable during implementation without changing the spec or the approach.