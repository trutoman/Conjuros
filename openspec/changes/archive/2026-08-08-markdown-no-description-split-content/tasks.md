## 1. Contracts

- [x] 1.1 In `packages/contracts/src/items.ts`, change `commonItemFields.description` from `z.string().trim().max(2_000)` to `z.string().trim().max(2_000).optional()` (keep it in `commonItemFields` shared by all three kinds)
- [x] 1.2 Change `collectionItemSchema.description` from `z.string()` to `z.string().nullable()`
- [x] 1.3 Do NOT add any `superRefine` guard rejecting `description` for `markdown` updates

## 2. API Service

- [x] 2.1 In `items.service.ts`, keep mapping `description` through the update candidate and set `description: candidate.description ?? null` in the replace payload (no kind branching needed)

## 3. Repositories

- [x] 3.1 In `InMemoryItemsRepository.create`, store `description: input.description ?? null`
- [x] 3.2 In `MongoItemsRepository.create`, store `description: input.description ?? null`
- [x] 3.3 Extend `MongoItemsRepository.normalizeRead` to add `description: doc.description ?? null`
- [x] 3.4 In `InMemoryItemsRepository.matchesQuery`, use `item.description ?? ''` in the joined search text

## 4. Frontend

- [x] 4.1 In `ItemForm.tsx`, skip the Description `FormField` when `kind === 'markdown'`
- [x] 4.2 In `ItemForm.tsx`, render the markdown content field as a `.content-panes` grid with two labeled textareas ("Content - Edit" and "Content - View") and **no standalone "Content" label row**, both controlled by the same `content` state; add an `item-form--markdown` modifier class to the form
- [x] 4.3 In `ItemForm.tsx` `submit()`, omit `description` from the markdown payload
- [x] 4.4 Add `src/web/index.css` rules: `.item-form--markdown` as a flex column so the content panes grow, `.content-panes` as a two-column grid (`1fr 1fr`) with a gap, and `.content-pane textarea` starting at twice the default field height with `resize: none`
- [x] 4.5 In `CollectionPage.tsx` client-side filter, use `item.description ?? ''` in the searchable text
- [x] 4.6 In `ItemForm.tsx`, add an auto-resize handler to both markdown content textareas that sets their height to their scroll height on mount and on input, so they grow as lines are added

## 5. Tests

- [x] 5.1 Update `src/tests/shared/validation.test.ts`: assert markdown create input without `description` parses, markdown read model accepts `description: null`, and markdown updates may still carry a `description` (no rejection)
- [x] 5.2 Update `src/tests/api/items.test.ts` markdown scenarios: created markdown items without a description return `description: null`, and markdown items created with a description keep it
- [x] 5.3 Update `src/web/components/__tests__/ItemForm.test.tsx`: markdown form shows no Description field and no standalone "Content" label, shows "Content - Edit" and "Content - View" panes, typing in one pane updates the other, and the markdown submit payload has no `description`
- [x] 5.4 Update `src/web/pages/__tests__/CollectionPage.test.tsx` (if it asserts markdown search) so a `description: null` markdown item still matches by content without introducing a `"null"` search token
- [x] 5.5 Update `src/web/components/__tests__/ItemForm.test.tsx`: markdown content textareas start at twice the default field height and grow taller as lines are added

## 6. Docs and Validation

- [x] 6.1 Run `npm run check` (lint, test, build) and fix any failures
