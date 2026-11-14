# Design

## Context

See proposal.md for motivation and the `collection-pagination` delta for requirements.

Current state that shapes the approach:

- `collectionQuerySchema` (and the tag, tag-category, and theme query schemas) already accept `limit`/`skip`, and every repository already applies `limit`/`offset` while returning `total` from a filtered `count()`. The items repository already orders with an `id` tie-break so pages are stable.
- The web client always requests `limit: 50, skip: 0` in `useCollectionFilters`, keeps filters in `sessionStorage`, and re-filters the fetched page in `CollectionPage` before rendering.
- `useThemes` already aggregates 50-row pages until `total`; `useTags` and `useTagCategories` fetch a single 50-row page.
- The frontend is a single Vite bundle served alongside the API, so contract and client can ship together.

## Goals / Non-Goals

**Goals:**

- Reuse the existing `limit`/`skip`/`total` contract; no new endpoints or database changes.
- One shared page-size bound so API and client cannot drift.
- Paging that keeps filters, sidebar, and item actions working unchanged.

**Non-Goals:**

- Paginating the sidebar tag list, tag management, or theme selector (they keep showing complete lists).
- Persisting the current page across reloads or putting it in the URL.
- Changing the default page size (25) or the item sort modes.

## Decisions

**1. Export the page-size bound from `@conjuros/contracts`**

Add `MAX_PAGE_SIZE = 27` to the contracts package and use it as `.max(MAX_PAGE_SIZE)` in `collectionQuerySchema`, `tagQuerySchema`, `tagCategoryQuerySchema`, and `themeQuerySchema`, keeping `.default(25)`. The web app imports the same constant for its collection page size.

- Why: the bound is an API rule; duplicating `27` in the client invites drift and a silent 400.
- Alternatives considered: a plain literal in each schema (rejected: four copies), or changing the default to 27 (rejected: the request only changes the maximum, and 25 keeps default payloads smaller).

**2. Page state lives in `useCollectionFilters`**

The hook owns `page` (1-based, in-memory only) and derives `skip = (page - 1) * PAGE_SIZE`; `query` gains those values. `setFilters` is wrapped so every filter change resets `page` to 1. `CollectionPage` adds an effect that clamps `page` to `ceil(total / PAGE_SIZE)` when `total` shrinks.

- Why: `skip` and the filter resets are presentation concerns that must stay consistent; keeping them beside `query` avoids a second source of truth.
- Alternatives considered: page state inside `CollectionPage` (works, but then `query` is assembled in two places); URL state (rejected: the app has no router and filters already use `sessionStorage`).

**3. Render the server page directly and drop the client re-filter**

`CollectionPage` stops deriving `visibleItems` from `items` and renders `items` (the page already filtered and paged by the API). The empty state still keys off the API response and the `filtered` flag.

- Why: the client filter is not identical to the server filter (it ignores `filename`, and tag normalization differs), so double filtering can shorten a page and make the range counter disagree with what is shown.
- Consequence: existing tests that relied on client-side filtering after a search must mock the hook returning the filtered page instead.
- Alternatives considered: keeping both filters (rejected for the reason above); moving search/filtering fully client-side (rejected: it cannot see items outside the page).

**4. A dedicated `CollectionPagination` component above the list**

New `src/web/components/CollectionPagination.tsx` receives `page`, `pageSize`, `total`, `onPrevious`, `onNext`, renders the `Showing X–Y of N items` text and the two buttons with explicit accessible names ("Previous page", "Next page"), and disables each button at its boundary. It renders nothing while loading, on error, or when `total === 0`; the counter is plain text (no live region) to avoid announcing on every keystroke.

- Why: keeps `CollectionPage` readable and gives the counter/controls a single tested home, matching the existing small state components (`LoadingState`, `ErrorState`).
- Alternatives considered: inline markup (rejected: more branching in an already large page); an `aria-live` counter (rejected: noisy while typing a search).

**5. Aggregate complete lists with a shared helper**

Add `collectPages` to `src/web/lib` that takes a page fetcher and repeatedly requests `MAX_PAGE_SIZE` rows until `total` is reached. Use it in `useTags`, `useTagCategories`, and `useThemes` (replacing the inline loop), with the existing `total` kept for callers.

- Why: three hooks need the same loop, and each must keep its previous complete-list behavior once a page holds only 27 rows.
- Alternatives considered: raising the limit for those endpoints only (contradicts the requested uniform bound); paginating those views (not requested).

**6. Keep previous page visible while fetching**

`useCollection` uses React Query's `keepPreviousData` placeholder so paging does not flash the loading state and the list does not collapse between pages.

- Why: with 27-row pages, navigation is frequent; a full-page spinner would be disruptive.
- Alternatives considered: default loading behavior (rejected: causes layout jumps).

## Risks / Trade-offs

- **Deploy skew: an older bundle still sends `limit=50` and now gets `400`.** → Ship contracts, API, and web in one release (single image); the UI already surfaces request errors, and a reload fetches the new bundle.
- **Lowering the bound hides tags/themes if a caller is missed.** → Centralize the bound, update every caller, and add tests asserting the sidebar/theme selector still show more than 27 entries.
- **Deleting the last item of the last page leaves a transient empty page.** → Clamp `page` from the returned `total`; `keepPreviousData` keeps the list visible while the clamped page loads.
- **Dropping the client re-filter changes how the list is populated.** → Rely on API filtering (search, type, tags) that already exists, and cover the request parameters in tests.
- **Extra requests for complete lists (one per 27 entries).** → React Query caches by key and these lists are small; the loop reuses the existing pattern.
- **Reorder only works within the loaded page.** → Dragging and `Alt+Arrow` move an item among the items on the current page via their `order` values; cross-page moves remain possible by paging and dragging there. No cross-page batch reorder is introduced.

## Migration Plan

1. Add `MAX_PAGE_SIZE` and update the four query schemas; update API tests that currently pass `limit: 50`.
2. Update the web hooks and collection page in the same change so no shipped caller sends more than 27.
3. Update `AGENTS.md`'s pagination note to state the default (25) and max (27).
4. No database migration and no data backfill. Rollback is a revert of the change; all new state (page number) is client-only.

## Open Questions

None.
