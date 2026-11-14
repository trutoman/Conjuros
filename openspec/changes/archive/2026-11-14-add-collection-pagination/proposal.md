# Proposal

## Why

The main collection list always requests the first page with `limit: 50, skip: 0` and renders no pagination controls, so items ranked 51 and beyond are unreachable from the collection view. The user never sees a total, and the API silently caps every list at 50 rows per request.

## What Changes

- Add explicit page navigation (Previous/Next) to the main collection list, driven by the existing `limit`/`skip` query parameters.
- Show a result counter above the list in the form `Showing X–Y of N items`, where `N` is the API `total` for the current filters.
- Lower the maximum page size for every paginated list endpoint (items, tags, tag categories, themes) from 50 to 27. **BREAKING** for any client that requests `limit` above 27: the request is rejected with a 400 validation error.
- Set the collection page size to 27 and reset to the first page whenever the search, type, or tag filters change.
- Keep the tags sidebar, tag management, and theme selector showing their complete lists by aggregating 27-row pages client-side, so the smaller page bound does not hide entries.

## Capabilities

### New Capabilities

- `collection-pagination`: paged reading of the item collection, including the page controls, the total counter, page reset on filter change, and the shared page-size bound for paginated list endpoints.

### Modified Capabilities

<!-- None: pagination and page-size bounds are not described by any existing capability. -->

## Impact

- API contract: `collectionQuerySchema`, `tagQuerySchema`, `tagCategoryQuerySchema` and `themeQuerySchema` in `packages/contracts` change `limit` from `max(50)` to `max(27)` (default stays 25).
- API: `PostgresItemsRepository`/in-memory repositories already honor `limit`/`skip` and return `total`; no new endpoint is required.
- Frontend: `useCollectionFilters` (page state and page size), `CollectionPage` (counter, Previous/Next controls, reset/clamp behavior), `useTags`, `useTagCategories`, and `useThemes` (page aggregation at 27 instead of 50).
- Tests: API contract validation tests for the new bound, repository pagination tests, and collection page tests for counter, disabled controls, page changes, and filter resets.
- Documentation: `AGENTS.md` pagination note if it states a page-size value (currently only "default max 50") must reflect 27.
