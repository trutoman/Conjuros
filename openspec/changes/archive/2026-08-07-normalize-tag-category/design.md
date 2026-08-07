## Context

See proposal.md - Why. Tag names and tag categories are validated and normalized differently today:

- Tag names use `tagNamePattern` (`/^[A-Za-z0-9.]+$/`), are trimmed, and lowercased in `normalizeTagName`.
- Tag categories (`tagCategorySchema`) accept any non-empty text and are stored verbatim; only their `tagCategoryNormalized` field is lowercased for comparison.

This lets the same category persist with different casing (e.g., `General` from legacy backfill in `tags.repository.ts` and `general` typed by the user), which the sidebar then renders as two separate groups because it keys on the raw `tagCategory` string (`Sidebar.tsx`). The normalized category is already the identity used for uniqueness (`findOwnedByNormalizedPair`), so the fix is to make the stored/displayed category equal its normalized form and apply the same input rules as tag names.

## Goals / Non-Goals

**Goals:**
- Tag categories accept only alphanumeric characters and dots, are trimmed, and are stored lowercased.
- Stored categories are canonical (always equal their normalized form), so no two casing variants of one category can coexist.
- All components render tag names and categories in lowercase.
- Existing mixed-case and legacy category data converges to the normalized lowercase form.

**Non-Goals:**
- No standalone category-management surface (categories stay implicit on tags).
- No change to tag-name validation or item-tag assignment semantics.
- No change to tag-name/category uniqueness key (`ownerId`, `tagNameNormalized`, `tagCategoryNormalized`).

## Decisions

**1. Reuse the tag-name rules for category input.**
`tagCategorySchema` will use the same `tagNamePattern` regex and trim rules as `tagNameSchema`, with lowercase normalization on write.
Rationale: the user asked for identical rules; a separate pattern would reintroduce divergence.
Alternative: a dedicated category pattern — rejected, identical rules are the requirement.

**2. Normalize the category on write in the service.**
`TagsService.create` and `update` will store `normalizedCategory` (`normalizeTagCategory(input.tagCategory)`) as the `tagCategory` display value, so the stored and displayed category always equal its normalized lowercase form.
Rationale: the root cause of the duplicate group is a stored display value differing from the normalized identity. Writing the canonical value removes it at the source.
Alternative: keep raw display and only group by normalized value — rejected, it would leave inconsistent stored data and mixed casing in every future read.

**3. Backfill legacy data through the hydration path.**
`legacyTagCategory` changes from `General` to `general`, and `hydrateTag` surfaces the normalized lowercase category (`normalizeTagCategory(record.tagCategory ?? legacyTagCategory)`) for both `tagCategory` and `tagCategoryNormalized`. `persistHydratedTag` already rewrites records whose display differs, so existing `General`/`general` rows converge lazily on read/write.
Rationale: no separate migration step or downtime; `hydrateTag`/`persistHydratedTag` are the existing single normalization point in both repository implementations.
Alternative: a one-time migration script — rejected as unnecessary given the lazy backfill, though an optional script can be added for eager cleanup.

**4. Frontend renders lowercase defensively.**
Every component that displays a tag name or category (Sidebar grouping + headings, TagList, ItemCard, TagForm, search filters) lowercases the value before rendering: `tag.tagName.toLowerCase()` / `tag.tagCategory.toLowerCase()`, with the sidebar grouping keyed on the lowercased category.
Rationale: the backend guarantees lowercase going forward, but defensive display normalization keeps the UI correct against any legacy rows not yet backfilled and avoids relying on a single source. The search filters already compare lowercased values.
Alternative: rely solely on backend normalization — rejected because un-read legacy rows could still render mixed case.

## Risks / Trade-offs

- [Legacy `General` tags visibly change to `general`] → Intended per spec; display is normalized consistently across all components, so no variant remains.
- [Un-read legacy rows retain mixed case until hydrated] → Acceptable transient state; every read path goes through `persistHydratedTag`, which converges them, and the frontend lowercases defensively regardless.
- [A stored category could already contain characters outside the new pattern] → Validation only gates new writes; existing rows pass through normalized lowercase and remain readable (the backfill lowercases but does not reject legacy data).

## Migration Plan

1. Deploy backend first: contracts schema, service normalization, legacy backfill change.
2. Deploy frontend lowercase rendering afterwards.
3. Optional: run a one-time script to normalize all existing `tags.tagCategory`/`tagCategoryNormalized` values and drop any mixed-case variants, so the lazy backfill is completed eagerly.
4. Rollback: revert the contract/schema change and legacy backfill; mixed-case data remains valid because comparison uses the normalized pair.
