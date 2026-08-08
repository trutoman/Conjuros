# Design: Markdown card content slug

## Context

See proposal.md — Why. `ItemCard.tsx:59` computes `contentValue = item.command ?? item.url ?? item.content ?? ''` and renders it directly in `.item-inline-content` (`ItemCard.tsx:242`). For markdown items, `content` is multi-line, so the inline content renders the whole note, breaking the single-row layout that spell and web-link cards keep. The `.item-inline-content` CSS already collapses overflow to one line with ellipsis, but the rendered text is still the full content.

## Goals / Non-Goals

- Goals: markdown cards show a single-line slug of the first non-empty line, stripped of markdown; cards stay one row; slug is computed in a pure, unit-tested helper; full content stays stored/editable.
- Non-Goals: changing the API or `packages/contracts`; changing the stored `content`; adding markdown card actions; altering spell/web-link inline content.

## Decisions

### 1. Compute the slug in a pure helper in `src/web/lib/`
Add `markdownSlug(content: string): string` (e.g. in `src/web/lib/itemCardSlug.ts` or alongside `markdownEditor.ts`). It splits on `\n`, picks the first non-empty line (`trim().length > 0`), strips leading markdown markers, and collapses internal whitespace. Rationale: keeps `ItemCard.tsx` declarative, makes the behavior unit-testable, and mirrors the existing `src/web/lib/markdownEditor.ts` helper pattern.

### 2. Strip markdown markers from the selected line
Remove a leading heading marker (`#{1,6} `), list/bullet markers (`- `, `* `, `+ `, `N. `, `> `), and inline emphasis/links/code/images (`**`, `__`, `*`, `` ` ``, `[text](url)`, `![alt](url)`). Keep it pragmatic: a small regex pass rather than a full markdown AST parse. Rationale: the slug is a short preview, not a renderer; full markdown parsing would add a dependency for little benefit.

### 3. Reuse `contentValue` only for non-markdown kinds
In `ItemCard.tsx`, keep `contentValue` for spell/web-link and branch so markdown uses `markdownSlug(item.content ?? '')`. Rationale: preserves current behavior for the other two kinds with a minimal diff.

### 4. Fall back to an empty slug when there is no non-empty line
When `content` is null, empty, or all-whitespace, the slug is `''`, matching how the other kinds render an empty value. Rationale: keeps the card row stable and avoids surprising fallback text.

## Risks / Trade-offs

- [Regex markdown stripping is imperfect for exotic input] → Mitigation: the slug is a preview only; it is never rendered as HTML, so imperfect stripping is cosmetically acceptable, and the spec only requires common markers (headings, emphasis, links, code, lists, images).
- [Changing inline content could surprise users expecting full text on the card] → Mitigation: cards were already single-row for other kinds; the full content remains one click away in Edit, and the slug preserves the first meaningful line.

## Migration Plan

- Frontend-only change. No data migration. Rollback is reverting `ItemCard.tsx` and the helper.

## Open Questions

None.
