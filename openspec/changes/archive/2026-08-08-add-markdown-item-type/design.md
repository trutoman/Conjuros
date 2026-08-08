## Context

See proposal.md - Why. The collection currently models exactly two kinds in `packages/contracts/src/items.ts`: `spell` (field `command`) and `web-link` (field `url`). Every layer encodes that binary choice: the discriminated input union, the update schema's `superRefine`, the read model with two nullable fields, the service's kind mapping, both repositories' create/search logic, and the frontend type selector, form, card, and filter.

## Goals / Non-Goals

**Goals:**
- Introduce a third kind `markdown` end-to-end with a single nullable `content` field for the raw text, mirroring how `command`/`url` already work.
- Keep `content` unbounded by contract (no `max`) so extensive documents are accepted; the only required validation is a non-empty trimmed value, consistent with `command`.
- Make frontend menus (type selector and "Type" filter) aware of the new kind and render markdown cards without kind-specific actions.

**Non-Goals:**
- No Markdown viewer, renderer, or editor.
- No change to how `command`/`url` items behave.
- No MongoDB index: no new indexes are required; the new field relies on the existing document shape.

## Decisions

- **`content` as a nullable top-level field on the read model.** Mirror the existing `command`/`url` pattern: `collectionItemSchema` gains `content: z.string().nullable()` and both repositories null it out for non-markdown kinds. This keeps the read shape uniform and the API/client code simple, at the cost of one more nullable field.
  - *Alternative rejected*: a nested `payload`/union object. Cleaner typing but a large departure from the established flat shape and would ripple through every consumer for little gain.
- **Extend the discriminated union rather than generalizing.** `collectionItemInputSchema` becomes a 3-way `discriminatedUnion('kind', [spell, webLink, markdown])`, and `itemKinds` grows `'markdown'`. The `superRefine` in `collectionItemUpdateSchema` gains a markdown cross-check (no `command`/`url` when kind is `markdown`, no `content` when kind is `spell`/`web-link`).
  - *Alternative rejected*: a fully generic content/url/command union. More flexible but undermines the explicit per-kind schemas the codebase already relies on for validation.
- **`content` input rule: non-empty trimmed, no max.** `markdownInputSchema` uses `z.string().trim().min(1)` with no upper bound, matching the product ask ("extensive text, no limit"). No pagination or preview of content is done this change; the card renders the text inline like a spell command.
- **Search includes `content`.** Both repositories append `content` to the searchable text; the client-side collection filter and the Mongo `$or` do the same. Low cost, obvious expected behavior for markdown notes.
- **Card renders markdown via the shared inline content path.** `ItemCard` currently computes `contentValue = item.command ?? item.url ?? ''` and uses `isSpell` for badge/actions. The design generalizes these to a `contentValue = item.command ?? item.url ?? item.content ?? ''` chain plus a `kind`-driven icon/badge/action switch so markdown items show a Markdown badge, the content text, and no copy/open actions.
- **Normalize nullable fields on read, not just on write.** `collectionItemSchema.content` is `z.string().nullable()`, which Zod rejects for `undefined`. Documents written before this change carry no `content` field at all, so raw Mongo reads surface `undefined` and fail validation regardless of any migration. `MongoItemsRepository` therefore maps every returned document through `content: doc.content ?? null` (and the same for `command`/`url`) so reads always satisfy the nullable read model without depending on the DB's stored shape.
  - *Alternative rejected*: relying solely on a backfill migration. Fixes the rows at migration time but leaves reads broken until the script is run (and again on any database that predates the script), which is exactly the startup failure observed.
- **Keep a backfill migration as optional data hygiene.** A one-off, idempotent script (`updateMany({ content: { $exists: false } }, { $set: { content: null } })`) normalizes existing documents to `null` so the stored shape matches the read model, modeled on `scripts/normalize-tag-categories.mjs`. It is not required for correctness once reads normalize the field.

## Risks / Trade-offs

- [Read model grows a third nullable field] → Acceptable; matches the established `command`/`url` convention and keeps API consumers backward compatible.
- [Unbounded `content` could grow MongoDB documents toward the 16 MB limit] → Out of scope for this change (viewer/editor and any storage strategy come later); the contract deliberately does not cap length.
- [Switching an existing item's kind to `markdown` mid-edit is possible] → The `superRefine` guard rejects invalid field combinations, and the service resolves kind before parsing, so a clean switch is safe.
- [Existing documents lack `content`, breaking reads on a nullable field] → Mitigated by read normalization in `MongoItemsRepository` (`content: doc.content ?? null`), which never depends on the stored document shape; the backfill migration is optional data hygiene and is idempotent.

## Migration Plan

No migration is required for reads to succeed: `MongoItemsRepository` read normalization guarantees nullable fields never surface `undefined`. The optional backfill script (`scripts/backfill-content-null.mjs`) may be run once to align stored documents with the read model; the `updateMany` is idempotent (matches only documents missing the field), so re-running is safe, and no rollback step is required since the operation only adds a `null` value.
