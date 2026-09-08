## 1. Contracts

- [x] 1.1 Add `packages/contracts/src/tag-categories.ts` (name/input/update/query/list schemas, `normalizeTagCategoryName`, types) and export from index
- [x] 1.2 Make `tagCategory` optional-with-default in `tagInputSchema`/`tagUpdateSchema` (absent/blank resolves to `general`)

## 2. Persistence

- [x] 2.1 Add `TagCategoriesRepository` interface plus `InMemoryTagCategoriesRepository` (`src/api/repositories/tag-categories.repository.ts`)
- [x] 2.2 Add `MongoTagCategoriesRepository` with unique `(ownerId,nameNormalized)` handling
- [x] 2.3 Wire `tagCategories` collection and repository in `server.ts`/`app.ts` DI and `createTestApp()` helper

## 3. Services and API

- [x] 3.1 Implement `TagCategoriesService` (`ensureGeneral`, create/list/rename/delete/reorder, member-set resolution, `general` protection)
- [x] 3.2 Update `TagsService.create/update` to resolve-or-create category (`general` default) before uniqueness/palette checks
- [x] 3.3 Add `tag-categories` controller + routes (`GET/POST/GET :id/PATCH :id/DELETE :id/reorder`) with `requireAuth`, pagination max 50
- [x] 3.4 Implement category rename propagation to member tags and delete-only-when-empty guard

## 4. Migration and verification

- [x] 4.1 Add migration that creates one category per distinct normalized tag category plus guaranteed `general` per owner
- [x] 4.2 Cover specs with API tests: auto-create on tag create, `general` default, empty listing, non-empty delete rejection, rename moves members, cross-user 403/404, legacy migration
- [x] 4.3 Cover contracts with validation tests: name pattern, trim/lowercase, blank-to-`general`, `general` rename/delete rejection

## 5. Frontend

- [x] 5.1 Tag form defaults category to `general`, suggests existing categories, hints when a new category will be created
- [x] 5.2 Tag management view and sidebar render categories from `/api/tag-categories` including empty sets, with loading/empty/error states

## 6. Quality gates

- [x] 6.1 Run `npm run check` (lint, test, build) and fix failures
- [x] 6.2 Run `openspec validate --change tag-category-entity --strict` and fix findings
