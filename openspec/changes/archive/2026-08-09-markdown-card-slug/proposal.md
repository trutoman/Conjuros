## Why

Markdown item cards currently render the full multi-line `content` as the inline content, which can grow a markdown card beyond a single row while spell and web-link cards stay compact on one row. The collection view is intended to be scannable; markdown cards should occupy the same single-row footprint as every other item.

## What Changes

- The `item-inline-content` element on a `markdown` item card SHALL show a single-line slug derived from the first non-empty line of the item's `content` instead of the full content text.
- A markdown card SHALL remain a single row like spell and web-link cards.
- The slug SHALL be computed from the first non-empty line of `content`, stripping markdown formatting (headings, emphasis, links, inline code, list markers, images) and collapsing whitespace so only a readable plain-text fragment remains.
- The full `content` SHALL remain stored and editable unchanged; only the card preview changes.
- No new kind-specific action is added to markdown cards.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `item-card-experience`: the "Markdown item cards render the content" requirement changes so markdown cards show a first-non-empty-line slug instead of the full content, keeping the card to a single row.

## Impact

- `src/web/components/ItemCard.tsx` — the inline content value for markdown items (`contentValue` at `ItemCard.tsx:59` and its usage at `ItemCard.tsx:242`).
- `src/web/lib/` — a small pure helper to compute the slug (unit-testable).
- `src/web/components/__tests__/ItemCard.test.tsx` and `src/web/lib/__tests__/` — update the markdown inline-content test and add slug helper tests.
- No API or contract changes; `content` stays full in storage.
