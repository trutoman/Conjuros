## 1. Contracts

- [x] 1.1 Apply `tagNamePattern` and trim rules to `tagCategorySchema` in `packages/contracts/src/tags.ts` so categories accept only alphanumeric characters and dots
- [x] 1.2 Keep `normalizeTagCategory` as the lowercase+trim canonicalization helper shared by services and repositories

## 2. Backend

- [x] 2.1 Normalize the category on create in `src/api/services/tags.service.ts` so the stored `tagCategory` equals `normalizeTagCategory(input.tagCategory)`
- [x] 2.2 Normalize the category on update in `src/api/services/tags.service.ts` so the stored `tagCategory` equals the normalized next category
- [x] 2.3 Change the legacy default from `General` to `general` in `src/api/repositories/tags.repository.ts` and surface the normalized lowercase category from `hydrateTag` for both `tagCategory` and `tagCategoryNormalized`

## 3. API tests

- [x] 3.1 Add tests in `src/tests/api/tags.test.ts` that creating a tag lowercases, trims, and validates the category (uppercase, mixed-case, surrounding whitespace, invalid characters)
- [x] 3.2 Add tests that updating a tag normalizes its category to lowercase
- [x] 3.3 Update the legacy backfill test so tags without a category surface as `general` and capitalized legacy categories surface as `general`
- [x] 3.4 Add a shared validation test in `src/tests/shared/validation.test.ts` covering the category character pattern and trimming

## 4. Frontend display

- [x] 4.1 In `src/web/components/Sidebar.tsx` group tags by the lowercased category and render the group heading in lowercase
- [x] 4.2 In `src/web/components/Sidebar.tsx` render tag names in lowercase
- [x] 4.3 In `src/web/components/TagList.tsx` render tag name and category in lowercase
- [x] 4.4 In `src/web/components/ItemCard.tsx` render item tag names in lowercase
- [x] 4.5 In `src/web/components/TagForm.tsx` render existing tag name and category in lowercase and normalize/lowercase new input as it is entered
- [x] 4.6 In `src/web/components/ItemForm.tsx` render available tag names in lowercase

## 5. Frontend tests

- [x] 5.1 Add a Sidebar test that categories differing only by case render as a single lowercase group
- [x] 5.2 Update component tests (`TagList`, `Sidebar`, `TagForm`, `ItemForm`, `ItemCard`) to assert lowercase rendering
- [x] 5.3 Update `TagsPage`/`CollectionPage` tests for lowercase category rendering where categories are asserted

## 6. Data migration

- [x] 6.1 Add a script under `scripts/` that normalizes all existing `tags.tagCategory` and `tags.tagCategoryNormalized` values to their lowercase trimmed form and removes any mixed-case variants for the same owner
- [x] 6.2 Run the script against the local database and verify no duplicate category groups remain in the sidebar

## 7. Verification

- [x] 7.1 Run `npm run check` and report any unresolved failures
