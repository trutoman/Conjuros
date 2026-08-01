# Tasks: Tag Categories

**Input**: Design documents from `/specs/009-tag-categories/`

**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/tag-categories-api.md`, `quickstart.md`

**Tests**: Tests are required by the constitution and feature success criteria for validation failures, duplicate handling, ownership boundaries, legacy compatibility, and category visibility.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared fixtures and exported tag surfaces that every story depends on.

- [X] T001 Update category-aware tag test helpers in `src/tests/api/testApp.ts` and `src/web/components/__tests__/itemCard.fixtures.ts`
- [X] T002 [P] Expose category-aware tag contract surfaces through `packages/contracts/src/index.ts` and `src/web/services/tags.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared category primitives and compatibility behavior required before story work begins.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T003 Define required `tagCategory` validation, normalization helpers, and category sort support in `packages/contracts/src/tags.ts`
- [X] T004 Implement `tagCategoryNormalized` persistence and normalized pair lookup methods in `src/api/repositories/tags.repository.ts`
- [X] T005 Implement legacy `General` backfill compatibility for stored tags in `src/api/repositories/tags.repository.ts`
- [X] T006 [P] Update tag service parsing and public mapping for category-bearing tags in `src/api/services/tags.service.ts`
- [X] T007 [P] Update tag HTTP handlers for category-aware payloads in `src/api/controllers/tags.controller.ts` and `src/api/routes/tags.route.ts`
- [X] T008 Ensure category-bearing tag types flow through `src/web/services/tags.ts` and `src/web/hooks/useTags.ts`

**Checkpoint**: Category-aware contracts, persistence, and API wiring are ready for independent story work.

---

## Phase 3: User Story 1 - Assign Categories To Tags (Priority: P1) 🎯 MVP

**Goal**: Users can create, edit, and view tags with a required category across the API and tags UI.

**Independent Test**: Create a tag with a category, edit that category later, and verify the saved category is visible in tag management views.

### Tests for User Story 1

- [X] T009 [P] [US1] Add contract validation coverage for required and trimmed `tagCategory` values in `src/tests/shared/validation.test.ts`
- [X] T010 [P] [US1] Add API tests for category create, list, and update behavior in `src/tests/api/tags.test.ts`
- [X] T011 [P] [US1] Add frontend tests for required category input and category rendering in `src/web/components/__tests__/TagForm.test.tsx` and `src/web/components/__tests__/TagList.test.tsx`

### Implementation for User Story 1

- [X] T012 [US1] Implement category-required tag create, get, list, and update behavior in `src/api/services/tags.service.ts` and `src/api/repositories/tags.repository.ts`
- [X] T013 [US1] Add required category input handling and inline validation to `src/web/components/TagForm.tsx`
- [X] T014 [US1] Display tag categories beside tag names in `src/web/components/TagList.tsx` and `src/web/pages/TagsPage.tsx`
- [X] T015 [US1] Keep category-bearing tag data flowing through `src/web/services/tags.ts` and `src/web/hooks/useTags.ts`

**Checkpoint**: User Story 1 is independently functional and testable as the MVP slice.

---

## Phase 4: User Story 2 - Reuse Names Across Categories Safely (Priority: P2)

**Goal**: Users can reuse the same tag name across different categories while conflicts are enforced on the normalized name-category pair.

**Independent Test**: Save two tags with the same name under different categories, then confirm create and update calls reject a duplicated normalized name-category pair.

### Tests for User Story 2

- [X] T016 [P] [US2] Add API tests for same-name different-category success and duplicate normalized pair conflicts in `src/tests/api/tags.test.ts`
- [X] T017 [P] [US2] Add frontend tests for duplicate pair conflict feedback in `src/web/pages/__tests__/TagsPage.test.tsx`

### Implementation for User Story 2

- [X] T018 [US2] Enforce normalized `tagName` plus `tagCategory` uniqueness in `src/api/services/tags.service.ts` and `src/api/repositories/tags.repository.ts`
- [X] T019 [US2] Support category-aware sorting and conflict-safe tag mutations in `packages/contracts/src/tags.ts` and `src/web/services/tags.ts`
- [X] T020 [US2] Surface duplicate pair save failures in `src/web/pages/TagsPage.tsx` and `src/web/components/TagForm.tsx`

**Checkpoint**: User Story 2 works independently on top of the category-aware CRUD surface.

---

## Phase 5: User Story 3 - Keep Categories Accurate Automatically (Priority: P3)

**Goal**: Categories remain implicit, legacy tags receive `General`, and empty categories disappear automatically after the last tag leaves them.

**Independent Test**: Backfill an uncategorized legacy tag to `General`, then delete or reassign the last tag in a category and verify that category no longer appears anywhere in tag management.

### Tests for User Story 3

- [X] T021 [P] [US3] Add API tests for `General` backfill, category reassignment, and last-tag category cleanup in `src/tests/api/tags.test.ts`
- [X] T022 [P] [US3] Add frontend tests proving there is no standalone category management flow and that category display updates after reassignment or delete in `src/web/pages/__tests__/TagsPage.test.tsx`

### Implementation for User Story 3

- [X] T023 [US3] Implement `General` backfill on legacy tag reads and writes in `src/api/repositories/tags.repository.ts`
- [X] T024 [US3] Ensure category-only updates avoid item tag rewrites while name deletes and renames still cascade in `src/api/services/tags.service.ts` and `src/api/repositories/items.repository.ts`
- [X] T025 [US3] Refresh delete and reassignment UX without standalone category CRUD in `src/web/pages/TagsPage.tsx` and `src/web/hooks/useTags.ts`

**Checkpoint**: All user stories are independently functional, including legacy compatibility and implicit category cleanup.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation alignment and verification across all stories.

- [X] T026 [P] Update category API and data-model documentation in `specs/009-tag-categories/contracts/tag-categories-api.md` and `specs/009-tag-categories/data-model.md`
- [X] T027 [P] Reconcile manual validation guidance and checklist notes in `specs/009-tag-categories/quickstart.md` and `specs/009-tag-categories/checklists/requirements.md`
- [X] T028 Run focused category validations against `src/tests/api/tags.test.ts`, `src/web/components/__tests__/TagForm.test.tsx`, `src/web/pages/__tests__/TagsPage.test.tsx`, and `package.json`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Starts immediately.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Story phases (Phase 3-5)**: Depend on Foundational completion.
- **Polish (Phase 6)**: Depends on all target stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational and delivers the MVP.
- **User Story 2 (P2)**: Depends on User Story 1 create and update flows being category-aware.
- **User Story 3 (P3)**: Depends on User Story 1 category-aware CRUD and can proceed independently of User Story 2 once category persistence and delete flows are stable.

### Within Each User Story

- Write and run tests before implementation.
- Update backend enforcement before relying on UI behavior.
- Finish the story checkpoint before expanding to the next priority.

### Parallel Opportunities

- T002 can run in parallel with T001.
- T006 and T007 can run in parallel after T003-T005 begin stabilizing.
- T009-T011 can run in parallel.
- T016 and T017 can run in parallel.
- T021 and T022 can run in parallel.
- T026 and T027 can run in parallel.

---

## Parallel Execution Examples

### User Story 1

```text
Task: T009 [US1] Contract validation coverage in src/tests/shared/validation.test.ts
Task: T010 [US1] API category CRUD tests in src/tests/api/tags.test.ts
Task: T011 [US1] Frontend category form and list tests in src/web/components/__tests__/TagForm.test.tsx and src/web/components/__tests__/TagList.test.tsx
```

### User Story 2

```text
Task: T016 [US2] API duplicate-pair tests in src/tests/api/tags.test.ts
Task: T017 [US2] Frontend duplicate conflict tests in src/web/pages/__tests__/TagsPage.test.tsx
```

### User Story 3

```text
Task: T021 [US3] API legacy-backfill and cleanup tests in src/tests/api/tags.test.ts
Task: T022 [US3] Frontend implicit-category lifecycle tests in src/web/pages/__tests__/TagsPage.test.tsx
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate User Story 1 independently before expanding scope.

### Incremental Delivery

1. Deliver category-aware tag CRUD and display with User Story 1.
2. Add normalized pair duplicate rules with User Story 2.
3. Add legacy compatibility and implicit category cleanup with User Story 3.
4. Finish with documentation reconciliation and full verification.

### Parallel Team Strategy

1. One developer handles shared contracts and repository compatibility tasks in T003-T005.
2. One developer handles API/service and route work in T006-T008 and T012-T024.
3. One developer handles UI behavior and tests in T011, T013-T015, T017, T020, T022, and T025.

## Notes

- Tasks marked `[P]` touch independent files or can proceed concurrently once prerequisites are satisfied.
- Story labels `[US1]`, `[US2]`, and `[US3]` preserve traceability to the specification.
- Keep category rules in shared contracts and services, not in controllers.
- Preserve owner scoping and pagination defaults while extending tag behavior.