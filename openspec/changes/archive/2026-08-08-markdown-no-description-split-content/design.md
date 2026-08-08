## Context

See proposal.md - Why.

Current state that shapes this design:

- `packages/contracts/src/items.ts` shares `commonItemFields` (title, description, tags, relatedItemIds) across `spell`, `web-link`, and `markdown` input schemas. `collectionItemSchema.description` is required (`z.string()`); `command`/`url`/`content` are already nullable and nulled per-kind.
- `items.service.ts` always maps `description` through update candidates and into the replace payload.
- `items.repository.ts` stores `input.description` on create in both repositories; `MongoItemsRepository.normalizeRead` null-coalesces `command`/`url`/`content` but not `description`.
- Search joins `item.description` into the searchable text in three places: `InMemoryItemsRepository.matchesQuery`, `MongoItemsRepository.list` (`$or`), and the client-side filter in `CollectionPage.tsx`.
- `ItemForm.tsx` always renders a Description field and a single content textarea; the form is `height: 100%` with `overflow-y: auto`.

## Goals / Non-Goals

**Goals:**
- Keep `description` in the data model for all item kinds; a `markdown` item may have `description: null`.
- The markdown item form (Add and Edit) hides the Description field, renders Content as two side-by-side textareas labeled "Content - Edit" and "Content - View" (with no standalone "Content" label row) bound to the same value, starts both at twice the default field height, and grows them as lines are added.
- No data migration: documents without a `description` read back with `description: null`.

**Non-Goals:**
- No Markdown rendering in the viewer pane yet; both panes are editable textareas.
- No change to the visibility or behavior of `description` for `spell`/`web-link` items.
- No backfill script; reads are normalized instead.

## Decisions

### D1: Keep `description` in the model; make the read model nullable

`description` stays in `commonItemFields` (shared by all three kinds) — it is not removed from `markdownInputSchema`. `collectionItemSchema.description` changes from `z.string()` to `z.string().nullable()`. `markdown` items created without a description are returned with `description: null`; spell/web-link items keep their string.

### D2: Make the input description optional

In `commonItemFields`, `description` becomes `z.string().trim().max(2_000).optional()`. The markdown form omits the field from its payload, so no `description` key is sent and the item is stored with `null`. Spell/web-link forms still send a description, so their behavior is unchanged. No `superRefine` guard is added — a description is simply never required for markdown.

### D3: Service needs no branching for description

`items.service.ts` keeps mapping `description: update.description ?? current.description` through the candidate and `description: candidate.description ?? null` into the replace payload. `create()` forwards the already-validated input unchanged.

### D4: Repositories store null and normalize reads

Both `InMemoryItemsRepository.create` and `MongoItemsRepository.create` store `description: input.description ?? null`. `MongoItemsRepository.normalizeRead` adds `description: doc.description ?? null` so pre-existing documents without the field read back as `null` without a migration.

### D5: Guard against `null` leaking into search text

`item.description` is currently joined raw into search text; once nullable, a `null` description would inject the literal string `"null"` into the search corpus. Update the search joins to `item.description ?? ''`:
- `InMemoryItemsRepository.matchesQuery`
- `CollectionPage.tsx` client-side filter

(`MongoItemsRepository.list` uses a regex `$or` on the field itself; a `null` value never matches, so no change is needed there.)

### D6: Form renders split content panes and hides description for markdown

In `ItemForm.tsx`:
- When `kind === 'markdown'`, do not render the Description `FormField`.
- When `kind === 'markdown'`, render the content field as a `.content-panes` grid of two labeled textareas with **no standalone "Content" label row**: "Content - Edit" on the left and "Content - View" on the right, each 50% width — both controlled by the same `content` state so editing either updates the other. Both are editable; no rendering is performed in the viewer yet.
- Attach an auto-resize handler to each markdown textarea that sets its height to its scroll height on mount and on input, so the panes grow taller as lines are added. (`field-sizing: content` was considered and rejected for lack of Firefox support.)
- Build the submit payload without `description` for markdown.
- Tag the form with a modifier class (e.g., `item-form--markdown`) and give the content panes container `flex: 1` so the content field grows from Title toward the tag selector.

New CSS in `src/web/index.css`:
- `.item-form--markdown` as a flex column so the content panes can grow.
- `.content-panes` as a two-column grid (`1fr 1fr`) with a gap.
- `.content-pane textarea` with `resize: none`, starting at twice the default form field height (e.g., `min-height: 8rem` vs the default `4rem`); the auto-resize handler grows it with the content.

### D7: ItemCard needs no change

`ItemCard.tsx` already gates the description accordion on `item.description` (truthy check) and joins `item.command ?? item.url ?? item.content ?? ''`. A `null` description means the toggle simply does not render for markdown, which matches the intended behavior.

## Risks / Trade-offs

- [Nullable `description` in the read model is a contract shape change] → It is additive-compatible for spell/web-link (always a string) and only allows markdown responses to be `null`; the frontend already handles `item.description` as optional/truthy in both card and form.
- [`null` becoming the literal `"null"` in search text if a join is missed] → Mitigated by D5, which updates both in-memory and client-side joins; Mongo regex `$or` is unaffected.
- [Making the input description optional relaxes validation for spell/web-link at the contract level] → Acceptable: the UI still always sends a description for those kinds, so no observable behavior change; the relaxation only matters for markdown, where it is intended.
