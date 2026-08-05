## Context

See `../manage-tags-inline/proposal.md` for motivation. "Manage tags" in the sidebar currently calls `onNavigateToTags`, which sets `page === 'tags'` in `App.tsx:116` and renders the standalone `TagsPage` in place of the whole shell, hiding the sidebar. By contrast, item and tag forms already render inline inside `.main-content-frame` in `CollectionPage.tsx:181-277` via `formItem`/`formTag` state. The tag management view (`TagList` list + reorder + delete, plus the inline add/edit `TagForm`) needs to move inside that frame so the sidebar stays visible.

## Goals / Non-Goals

**Goals:**
- Open the full tag management view inside `.main-content-frame`, keeping the sidebar visible
- Offer an explicit exit that restores the item collection (subheader + list)
- Present the management view with the same frame styling as `TagForm`/`.item-form` (surface panel, border, rounded corners, full height, scrollable)
- Keep add/edit/reorder/delete functional inline
- Reuse existing hooks (`useTags`) and components (`TagList`, `TagForm`, `DeleteConfirmDialog`)

**Non-Goals:**
- Backend or contract changes
- Changing `TagForm`/`TagList` internal behavior
- New state-management libraries or animations

## Decisions

### Decision 1: Add `manageTags` boolean state in `CollectionPage`

**Approach:** Add `const [manageTags, setManageTags] = useState(false)`. In `.main-content-frame`, render in priority order: `manageTags ? <TagManagementView .../> : formTag !== undefined ? <TagForm/> : formItem !== undefined ? <ItemForm/> : <collection view>`. Opening any frame view sets the others off so only one occupies the frame. `onNavigateToTags` from the sidebar is replaced by `setManageTags(true)`.

**Rationale:** Mirrors the existing inline-form pattern (`formItem`/`formTag`) with minimal new concepts; a single boolean is sufficient since the management view subsumes the tag form (edit/create opens inline within it).

**Alternative considered:** Keeping a separate page route via `App` state. Rejected because it reintroduces the full-screen navigation the change removes.

### Decision 2: Introduce a `TagManagementView` composite inside CollectionPage

**Approach:** Add internal state in `CollectionPage` for the management view: `formTag` (reuse), `deleteTag`, `actionError`, `saveTag`, and the reorder handler. Render `<TagList>` (list/reorder/delete) plus a header with "Add tag" and an "Exit" back action inside a container using the `.item-form` class so it adopts the shared frame styling automatically.

**Rationale:** `TagList` and `TagForm` already exist and need no behavior changes; the frame styling comes for free by applying the `.item-form` class. Reuse avoids duplicating the tags-page logic that already lives in `TagsPage`; that logic is moved/imported rather than rewritten.

**Alternative considered:** Instructing the browser to render the full `TagsPage` in an overlay. Rejected: it would keep the topbar/full-shell layout and not match the `.item-form` frame.

### Decision 3: Remove the `tags` page navigation from `App`

**Approach:** Keep rendering `TagsPage` only if it remains warranted; otherwise route "Manage tags" purely inside `CollectionPage`. Concretely, drop `onNavigateToTags` → `setPage('tags')` wiring and remove the now-unused `tags` branch / component to avoid dead code, unless a test or feature depends on it.

**Rationale:** Avoids two competing tag-management surfaces. The backend `tag-manage` capability stays fully functional through `useTags`.

**Alternative considered:** Leaving `TagsPage` in place but unreachable. Avoided to prevent dead/confusing code.

## Risks / Trade-offs

- **Exit affordance discoverability:** The user must be able to find the back action → Mitigation: a clear, labeled "Exit"/"← Collection" action at the top of the management view, plus Save/Cancel of the tag form returns to the list.
- **Duplicating TagsPage logic in CollectionPage** → Mitigation: reuse the exact `useTags` calls and handlers already proven in `TagsPage`; only relocate, not rewrite.
- **`TagList` styling differs from `.item-form`**: `TagList` keeps its own `.tag-panel`/`.tag-list` cards, which will be wrapped by the `.item-form` surface → Mitigation: verify the wrapper is the frame and the inner list renders acceptably; adjust CSS only if the combination looks wrong.

## Open Questions

- Exact placement/label of the exit action in the management view (top-bar button vs. within the frame header). UI detail, resolvable during implementation without changing the spec or approach.