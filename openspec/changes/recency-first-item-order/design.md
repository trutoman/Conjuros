# Design

## Context

See proposal.md and the capability delta. Items already carry an integer `position` column (exposed as `order`) and the list endpoint sorts by it; `renumberOwnedRows` moves a row to a target position, renumbers the owner's rows 1..n, and bumps `updated_at` on every row. `nextOrder` currently returns `count + 1`, so new items append at the bottom. Tags and tag categories share the same reorder helper and must keep their current behavior.

## Goals / Non-Goals

**Goals:**

- Express recency in the stored order so page one always shows recent work.
- Let a manual reorder fix one item's position across that item's later saves.
- Keep the public item shape, list endpoint, sorting parameter, and pagination unchanged.

**Non-Goals:**

- Adding a sort-mode selector, a "reset manual order" action, or drag across pages.
- Reordering tags or tag categories differently.
- Repositioning items when only their attachment changes.

## Decisions

**1. Order is a rank; recency is applied by assigning the top rank**

Sorting stays on `position` ascending. `nextOrder` returns the position above the current first row (`min(position) - 1`, or `0` for an empty collection), and creation uses it. That makes "newest first" a property of the stored order rather than a second sort key, so paging and filters need no changes. Negative positions are valid integers; a manual reorder renumbers 1..n and resets them.

Because ranks are no longer 1..n, `CollectionItem.order` becomes any integer, and the client must send a 1-based position when reordering instead of copying the target row's stored rank (`targetIndex + 1`). The reorder input stays a positive integer.

**2. Saving an item repositions it only when it has no manual position**

`ItemsService.update` passes `order = current.manuallyOrdered ? current.order : await repository.nextOrder(ownerId)` into `replace`. A saved item therefore floats to the top like a new one, while a manually placed item keeps its rank. Sorting by `updated_at` was rejected: the reorder helper already bumps every row's timestamp, and a manual arrangement cannot be represented by timestamps. Timestamp-midpoint ranks were rejected as fragile (ties, precision, clock changes).

**3. Manual placement is a per-item flag set by the reorder path**

A new `manually_ordered` boolean column (not null, default false) marks items the user placed. The items repository sets it to true for the moved row inside the reorder transaction, after the shared renumbering call; tags and tag categories keep using the helper untouched. Reordering the item again renumbers and keeps the flag true, which is how "reorder again replaces the fixed position" works.

**4. The flag stays internal**

`StoredCollectionItem` gains `manuallyOrdered`, and `toPublicItem` strips it together with `ownerId`, so `CollectionItem` and every API response keep their current shape. Existing rows start as not manually placed, which matches their current bottom-appended ranks until they are saved or dragged.

**5. Attachment-only mutations keep the position**

File upload, replacement, and removal go through the attachments repository, which replaces the item row directly. Those operations keep the item's position; only saving the item form (the service update path) repositions it. This keeps the rule easy to reason about: saving the item moves it, attaching a file to it does not.

## Risks / Trade-offs

- **Concurrent creates can compute the same top rank.** → The `id` tie-break keeps pages stable, and the next manual reorder renumbers the list; the risk is accepted without extra locking.
- **Existing tests and fixtures assume bottom insertion (`count + 1`).** → Update them with the new top-placement expectations in the same change.
- **A saved item can leave the currently filtered page.** → Expected: it becomes the newest match; the counter and paging already follow the API total.
- **Manual state cannot be cleared except by dragging again.** → Matches the request; no reset control is added.
- **Positions can grow negatively over many creates.** → Harmless for ordering; a manual reorder resets them to 1..n.

## Migration Plan

1. Generate the Drizzle migration adding `manually_ordered` with default false; the column is additive and safe before the new API behavior ships.
2. Ship the API changes; no client change is required because the collection already sorts by `order` and invalidates after create, update, and reorder.
3. Rollback the code if needed; the extra column stays harmlessly with its default.
