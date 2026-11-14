# Proposal

## Why

The main collection is ordered by a stored position that appends new items at the bottom, so the newest work is the hardest to find: a freshly created item lands on the last page and an edited item stays wherever it was. Users expect the collection to surface recent activity, while still being able to place an item by hand.

## What Changes

- Creating an item places it above every other item of the owner, so a new item is always the first row of the collection.
- Saving an item without a manual position also moves it above every other item, so the list reflects the most recently updated items first.
- A manual reorder (drag or keyboard) gives that item a fixed position: later saves of that item keep its place even though its updated timestamp changes.
- Recency stays the primary criterion: creating or saving another item above pushes a manually placed item down, one position per item added above it.
- Persist the "manually placed" state per item as an internal column; the public item shape and the list query stay unchanged.

## Capabilities

### New Capabilities

<!-- None: collection ordering belongs to an existing capability. -->

### Modified Capabilities

- `collection-management`: item ordering gains recency-first placement and a per-item manual position that survives that item's later saves.

## Impact

- Database: new `manually_ordered` boolean column on `collection_items` with a generated migration.
- API: `ItemsRepository.nextOrder` returns the position above the current first item, the item update path repositions unplaced items, and the item reorder path marks the moved item as manually placed. The reorder helper shared with tags and tag categories must stay untouched for those tables.
- Public contract: no shape change; the new flag stays internal and is stripped from responses.
- Frontend: no component change expected; the collection already sorts by `order` and invalidates after create, update, and reorder.
- Tests: API/repository tests for creation and save placement, manual-position persistence, push-down on new items, and existing fixtures that assumed bottom insertion.
