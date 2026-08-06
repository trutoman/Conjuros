## Context

The tag management view is rendered in `CollectionPage.tsx` (inline "Manage tags" mode) and `TagsPage.tsx`. `TagList` (`src/web/components/TagList.tsx`) renders each tag as a `tag-row` containing a `tag-filter-pill` label plus category/color metadata and a three-dot menu. The `Tag` contract already includes a `description` field. The collection list has a reusable `.search-field` CSS pattern (`src/web/index.css`) with a magnifier icon, input, and clear button. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Surface each tag's `description` in its row without changing the existing interactions.
- Add a header search box to the tag management view that filters tags by name and category.
- Reuse the existing `.search-field` visual pattern and its CSS.

**Non-Goals:**
- No server-side search; filtering is client-side over the already-loaded tag list.
- No changes to the `Tag` contract or API.
- No changes to the collection list search or its filtering behavior.

## Decisions

- **Client-side filtering.** The tag list is already fully loaded (paginated max 50 via `useTags`), so filtering happens in the page before passing tags to `TagList`. This avoids new API endpoints and keeps behavior consistent with the existing inline filtering in `CollectionPage` for items.
- **Filter location: page, not component.** Add local `tagQuery` state in `CollectionPage`'s manage-tags branch and filter `tagsState.tags` before rendering `TagList`. `TagList` stays a pure presentational list. For `TagsPage`, apply the same local-state approach so the standalone tags page also gains search.
- **Case-insensitive `tagName`/`tagCategory` substring match.** Mirror the collection search's `.toLowerCase().includes()` style; "category" is the `tagCategory` field (the user's "tag group").
- **Reuse `.search-field` markup and CSS.** Duplicate the small search field JSX (icon + input + clear button) from the collection subheader into the `tag-management-header`, adjusting the `aria-label` and placeholder for tags.
- **Description as a muted line.** Add a `<span className="tag-description">` under the label block inside `tag-row-label`, rendered only when `tag.description` is non-empty, matching the muted metadata style already used for category/color.

## Risks / Trade-offs

- Duplicated search-field markup across collection and tag views → Acceptable; it is ~10 lines and the two views differ in labels/behavior, so extracting a shared component is not warranted yet.
- `TagsPage` and `CollectionPage` each hold their own `tagQuery` state → Acceptable; the two pages are separate routes with independent lifecycles.
- Empty-result UX (blank list) is minimal → The spec only requires that no tags show; a dedicated empty message is out of scope.
