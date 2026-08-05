# Tasks: User Configurable Tags

**Input**: Design documents from [specs/003-configurable-tags](specs/003-configurable-tags)

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/configurable-tags-api.md](contracts/configurable-tags-api.md), [quickstart.md](quickstart.md)

**Tests**: Tests are required by the constitution and feature requirements for success paths, validation failures, ownership boundaries, filter modes, rename stability, and cascade deletion.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared contracts and route wiring points needed by all stories.

- [X] T001 Add tag domain exports to shared contracts index in packages/contracts/src/index.ts
- [X] T002 [P] Add tag route registration skeleton in src/api/app.ts
- [X] T003 [P] Add web tag service module scaffold in src/web/services/tags.ts
- [X] T004 [P] Add web tag hook scaffold in src/web/hooks/useTags.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement core domain contracts and backend primitives that every story depends on.

**⚠️ CRITICAL**: No user story implementation starts before this phase is complete.

- [X] T005 Define Zod schemas and types for tags, tag queries, and tag mutations in packages/contracts/src/tags.ts
- [X] T006 Extend item contracts with multi-tag filtering and filter mode support in packages/contracts/src/items.ts
- [X] T007 [P] Implement tag repository interface and in-memory repository in src/api/repositories/tags.repository.ts
- [X] T008 Implement Mongo tag repository with owner-scoped query/search/sort and case-insensitive uniqueness checks in src/api/repositories/tags.repository.ts
- [X] T009 [P] Add repository support to remove deleted tag values from owned items in src/api/repositories/items.repository.ts
- [X] T010 Implement tag service core operations (parse, list, get, create, update, reorder, delete) in src/api/services/tags.service.ts
- [X] T011 Add item-service validation to enforce owned-tag existence on create/update and rename compatibility in src/api/services/items.service.ts
- [X] T012 Implement tags controller handlers using boundary parsing and error propagation in src/api/controllers/tags.controller.ts
- [X] T013 Implement authenticated tags router with CRUD and reorder endpoints in src/api/routes/tags.route.ts

**Checkpoint**: Shared contracts and backend tag primitives are ready for independent story work.

---

## Phase 3: User Story 1 - Create and Manage Personal Tags (Priority: P1) 🎯 MVP

**Goal**: Users can create, list, read, update, reorder, and delete their own tags with strict validation and ownership boundaries.

**Independent Test**: As User A, create/update/delete tags successfully; as User B, verify read/update/delete access to User A tags is denied.

### Tests for User Story 1

- [X] T014 [P] [US1] Add API tests for tag CRUD success paths and owner-scoped listing in src/tests/api/tags.test.ts
- [X] T015 [P] [US1] Add API tests for tag-name character validation, case-insensitive duplicates, and #RRGGBB color validation in src/tests/api/tags.test.ts
- [X] T016 [P] [US1] Add API tests for cross-user tag access denial in src/tests/api/tags.test.ts

### Implementation for User Story 1

- [X] T017 [US1] Wire tag repository and service dependencies into API bootstrap in src/api/server.ts
- [X] T018 [US1] Add tag endpoints to API app composition in src/api/app.ts
- [X] T019 [US1] Implement tag CRUD and reorder client calls with contract parsing in src/web/services/tags.ts
- [X] T020 [US1] Implement tag state and mutations hook for list/create/update/delete/reorder in src/web/hooks/useTags.ts
- [X] T021 [US1] Create tag form component with name/description/color validation messaging in src/web/components/TagForm.tsx
- [X] T022 [US1] Create tag list component with edit/delete/reorder actions in src/web/components/TagList.tsx
- [X] T023 [US1] Integrate tag management panel into collection page workflows in src/web/pages/CollectionPage.tsx
- [X] T024 [US1] Add frontend tests for tag form validation and save flows in src/web/components/__tests__/TagForm.test.tsx

**Checkpoint**: Tag management is functional and independently testable for one authenticated user.

---

## Phase 4: User Story 2 - Use Tags in Collection Items (Priority: P2)

**Goal**: Users can assign only their existing tags to spells and web-links, and associations persist through tag rename.

**Independent Test**: Create tags and items, assign tags successfully, reject non-owned/unknown tags, then rename a tag and verify item associations remain linked.

### Tests for User Story 2

- [X] T025 [P] [US2] Add API tests that item create/update rejects unknown or non-owned tags in src/tests/api/items-crud.test.ts
- [X] T026 [P] [US2] Add API tests for tag rename preserving item associations in src/tests/api/items.test.ts
- [X] T027 [P] [US2] Add API tests for cascade deletion removing deleted tag from all owned items in src/tests/api/tags.test.ts

### Implementation for User Story 2

- [X] T028 [US2] Update item create/edit form to select from owned tags instead of free-form tag text in src/web/components/ItemForm.tsx
- [X] T029 [US2] Pass available owned tags into item form flows in src/web/pages/CollectionPage.tsx
- [X] T030 [US2] Add frontend tests for owned-tag assignment and invalid-tag prevention in src/web/pages/__tests__/CollectionPage.tags.test.tsx

**Checkpoint**: Item-tag association rules are enforced end-to-end with rename stability and cascade behavior.

---

## Phase 5: User Story 3 - Filter and Search by Tags (Priority: P3)

**Goal**: Users can search tags case-insensitively and filter items by selected tags using all/any modes (default all).

**Independent Test**: With multiple tags and items, verify tag search behavior plus AND default and OR optional filtering produce expected owner-scoped item lists.

### Tests for User Story 3

- [X] T031 [P] [US3] Add API tests for case-insensitive tag search and owner-scoped results in src/tests/api/tags.test.ts
- [X] T032 [P] [US3] Add API tests for item filter mode all/any behavior in src/tests/api/items.test.ts
- [X] T033 [P] [US3] Add frontend tests for tag filter mode switching and result updates in src/web/pages/__tests__/CollectionPage.tags.test.tsx

### Implementation for User Story 3

- [X] T034 [US3] Extend collection filter state to support multiple tags and tagFilterMode with default all in src/web/hooks/useCollectionFilters.ts
- [X] T035 [US3] Update filter bar UI for multi-tag selection and all/any mode controls in src/web/components/FilterBar.tsx
- [X] T036 [US3] Update collection page filtering logic to apply selected tags and all/any mode consistently in src/web/pages/CollectionPage.tsx
- [X] T037 [US3] Update item list API query serialization for tags and tagFilterMode parameters in src/web/services/items.ts

**Checkpoint**: Tag discovery and filtering workflows are independently functional and verifiable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, documentation, and full validation across stories.

- [X] T038 [P] Update shared and feature API documentation for final tag endpoint/query payloads in specs/003-configurable-tags/contracts/configurable-tags-api.md
- [X] T039 [P] Reconcile quickstart scenarios with implemented UI/API behavior in specs/003-configurable-tags/quickstart.md
- [X] T040 Run full quality suite and resolve feature-related failures using package.json scripts
- [X] T041 Execute manual quickstart validation scenarios and capture gaps in specs/003-configurable-tags/checklists/requirements.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): starts immediately.
- Foundational (Phase 2): depends on Setup and blocks all user stories.
- User Story phases (Phase 3-5): depend on Foundational completion.
- Polish (Phase 6): depends on all target stories being complete.

### User Story Dependencies

- User Story 1 (P1): no dependency on other stories after Foundational.
- User Story 2 (P2): depends on User Story 1 tag CRUD availability.
- User Story 3 (P3): depends on User Story 1 tag query availability and User Story 2 association semantics.

### Within Each User Story

- Tests first, then implementation.
- Contracts and parsing before controller/service wiring.
- Backend enforcement before UI consumption.
- Complete story checkpoint before moving to next priority.

### Parallel Opportunities

- T002, T003, T004 can run in parallel.
- T007 and T009 can run in parallel after T005-T006.
- T014-T016 can run in parallel.
- T025-T027 can run in parallel.
- T031-T033 can run in parallel.
- T038 and T039 can run in parallel.

---

## Parallel Execution Examples

### User Story 1

```text
Task: T014 [US1] API CRUD success-path tests in src/tests/api/tags.test.ts
Task: T015 [US1] API validation tests in src/tests/api/tags.test.ts
Task: T016 [US1] API ownership-boundary tests in src/tests/api/tags.test.ts
```

### User Story 2

```text
Task: T025 [US2] Item write validation tests in src/tests/api/items-crud.test.ts
Task: T026 [US2] Rename association stability tests in src/tests/api/items.test.ts
Task: T027 [US2] Cascade delete tests in src/tests/api/tags.test.ts
```

### User Story 3

```text
Task: T031 [US3] Tag search tests in src/tests/api/tags.test.ts
Task: T032 [US3] Filter mode tests in src/tests/api/items.test.ts
Task: T033 [US3] UI filter mode tests in src/web/pages/__tests__/CollectionPage.tags.test.tsx
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete User Story 1 tests and implementation.
3. Validate User Story 1 independently before expanding scope.

### Incremental Delivery

1. Deliver US1 tag management.
2. Deliver US2 item-tag association rules and cascade.
3. Deliver US3 search and advanced filtering.
4. Run polish tasks and full verification.

### Parallel Team Strategy

1. One developer on contracts and repositories (T005-T009).
2. One developer on tag API/controller/service wiring (T010-T018).
3. One developer on web UX/tests (T019-T037) after foundational interfaces stabilize.

## Notes

- Tasks marked [P] modify independent files or can be developed concurrently once prerequisites are met.
- Story labels [US1], [US2], and [US3] maintain traceability to spec priorities.
- Keep all ownership checks and validation in services/contracts, not controllers.
- Preserve pagination defaults and maximum limits on list endpoints.