# Tasks: Collection Management

**Input**: Design documents from `/specs/001-collection-management/`

**Prerequisites**: plan.md, spec.md, data-model.md, contracts/collection-api.md

**Implementation Stack**: TypeScript monorepo, shared contracts in `packages/contracts`, Express backend in `src/api`, React/Vite frontend in `src/web`, and Vitest-based tests in `src/tests/`.

## Constitution Alignment Tasks

- [X] T000 Review the repository constitution and feature constraints for ownership boundaries, validation, shared contracts, and testing coverage.
- [X] T001 [P] Add or update shared Zod schemas and public contract types in `packages/contracts/src/` before API or UI implementation changes.
- [X] T002 [P] Add test coverage for success paths, validation failures, ownership boundaries, and critical user flows in `src/tests/`.
- [X] T003 Review security-sensitive behavior for authentication, clipboard actions, explicit open actions, and destructive deletes.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the TypeScript monorepo and shared tooling for the collection feature.

- [X] T004 Create the monorepo structure for `src/api/`, `src/web/`, `packages/contracts/`, and `src/tests/`.
- [X] T005 [P] Initialize package workspace configuration and shared TypeScript/Vitest/Vite tooling in `package.json`, `tsconfig.json`, `vitest.config.ts`, and `vite.config.ts`.
- [X] T006 [P] Scaffold the Express backend entrypoints and route registration in `src/api/app.ts` and `src/api/routes/`.
- [X] T007 [P] Scaffold the React/Vite frontend entrypoints and app shell in `src/web/main.tsx`, `src/web/App.tsx`, and `src/web/index.css`.
- [X] T008 Configure linting, formatting, and shared scripts in `eslint.config.*`, `prettier.config.*`, and package scripts.

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared infrastructure that all user stories depend on.

- [X] T009 Implement shared item contracts, enums, and Zod schemas in `packages/contracts/src/items.ts` and `packages/contracts/src/index.ts`.
- [X] T010 [P] Implement MongoDB connection handling and repository abstractions in `src/api/repositories/connection.ts` and `src/api/repositories/items.repository.ts`.
- [X] T011 [P] Implement authentication middleware and current-user context helpers in `src/api/middleware/auth.ts` and `src/api/context/currentUser.ts`.
- [X] T012 [P] Implement centralized error handling and HTTP response helpers in `src/api/errors.ts` and `src/api/utils/http.ts`.
- [X] T013 Implement item validation, normalization, and ownership guard logic in `src/api/services/items.service.ts`.

**Checkpoint**: The foundation is ready for independent user story implementation.

## Phase 3: User Story 1 - Browse and act on a personal collection (Priority: P1)

**Goal**: Let signed-in users view their own collection, search and filter it, and copy or open items quickly.

**Independent Test**: A signed-in user can load the collection, find an item, and copy or open it successfully.

### Tests for User Story 1

- [X] T014 [P] [US1] Add API integration tests for listing and reading owned items in `src/tests/api/items.test.ts`.
- [X] T015 [P] [US1] Add frontend component tests for collection rendering, search/filter behavior, and copy/open actions in `src/web/pages/__tests__/CollectionPage.test.tsx` and `src/web/components/__tests__/ItemCard.test.tsx`.

### Implementation for User Story 1

- [X] T016 [US1] Implement item list and detail repository queries with pagination and ownership filtering in `src/api/repositories/items.repository.ts`.
- [X] T017 [US1] Implement collection controllers and routes for `GET /items` and `GET /items/:id` in `src/api/controllers/items.controller.ts` and `src/api/routes/items.route.ts`.
- [X] T018 [US1] Implement the collection page, item list, and item card UI in `src/web/pages/CollectionPage.tsx` and `src/web/components/ItemCard.tsx`.
- [X] T019 [US1] Implement collection data fetching, search/filter state, and copy/open action handlers in `src/web/hooks/useCollection.ts` and `src/web/services/items.ts`.
- [X] T020 [US1] Implement empty, loading, no-results, and error states in `src/web/components/EmptyState.tsx`, `src/web/components/LoadingState.tsx`, and `src/web/components/ErrorState.tsx`.

**Checkpoint**: User Story 1 is fully functional and independently testable.

## Phase 4: User Story 2 - Create, edit, and remove collection items (Priority: P2)

**Goal**: Let signed-in users create, edit, and delete spells and web links without affecting other users' items.

**Independent Test**: A signed-in user can create a new item, edit it, and delete it while another user's items remain unchanged.

### Tests for User Story 2

- [X] T021 [P] [US2] Add API integration tests for create, update, and delete flows in `src/tests/api/items-crud.test.ts`.
- [X] T022 [P] [US2] Add frontend form and validation tests for spell and web-link creation and editing in `src/web/components/__tests__/ItemForm.test.tsx`.

### Implementation for User Story 2

- [X] T023 [US2] Implement create, update, and delete service logic with input validation and ownership checks in `src/api/services/items.service.ts`.
- [X] T024 [US2] Implement create, update, and delete controller actions and route wiring in `src/api/controllers/items.controller.ts` and `src/api/routes/items.route.ts`.
- [X] T025 [US2] Implement the item form experience for spell and web-link fields in `src/web/components/ItemForm.tsx` and `src/web/components/ItemTypeSelector.tsx`.
- [X] T026 [US2] Implement create/edit/delete flows and confirmation handling in `src/web/pages/CollectionPage.tsx` and `src/web/components/DeleteConfirmDialog.tsx`.
- [X] T027 [US2] Implement client-side validation messaging and success/error feedback in `src/web/components/FormField.tsx` and `src/web/hooks/useCollection.ts`.

**Checkpoint**: User Stories 1 and 2 both work independently.

## Phase 5: User Story 3 - Reorder and organize the collection (Priority: P2)

**Goal**: Let signed-in users reorder items, persist the new order, and keep filters and ordering state available across reloads.

**Independent Test**: A signed-in user can reorder an item, reload the page, and still see the saved order and selected filters.

### Tests for User Story 3

- [X] T028 [P] [US3] Add API integration tests for reorder persistence in `src/tests/api/reorder.test.ts`.
- [X] T029 [P] [US3] Add frontend tests for pointer and keyboard ordering behavior in `src/web/components/__tests__/CollectionList.test.tsx`.

### Implementation for User Story 3

- [X] T030 [US3] Implement reorder service logic and persistence of `order` values in `src/api/services/items.service.ts`.
- [X] T031 [US3] Implement the `PATCH /items/:id/reorder` endpoint and validation in `src/api/controllers/items.controller.ts` and `src/api/routes/items.route.ts`.
- [X] T032 [US3] Implement reorder UI with drag-and-drop and keyboard controls in `src/web/components/CollectionList.tsx` and `src/web/components/ReorderHandle.tsx`.
- [X] T033 [US3] Implement filter persistence and saved-order state handling in `src/web/hooks/useCollection.ts` and `src/web/hooks/useCollectionFilters.ts`.
- [X] T034 [US3] Implement persistent empty, no-results, and filtered-state presentation in `src/web/components/EmptyState.tsx` and `src/web/components/FilterBar.tsx`.

**Checkpoint**: All user stories are now independently functional.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Tighten quality, coverage, and docs across the feature.

- [X] T035 [P] Add or refine documentation and quickstart validation in `docs/` and `specs/001-collection-management/quickstart.md`.
- [X] T036 [P] Add shared unit tests for tag normalization, URL validation, and command preservation in `src/tests/shared/validation.test.ts`.
- [X] T037 Run the full Vitest suite and resolve regressions across backend, frontend, and shared contracts.
- [X] T038 Verify the implementation against the feature acceptance criteria and confirm the MVP path for User Story 1.

## Dependencies & Execution Order

### Phase Dependencies

- Setup must complete before Foundational work begins.
- Foundational work must complete before any user story implementation starts.
- User Story 1 should be implemented first for the MVP path.
- User Story 2 and User Story 3 can proceed after the shared foundation is in place, with Story 2 and Story 3 building on the same core collection experience.

### User Story Dependencies

- User Story 1 (P1): No dependency on other stories; this is the MVP.
- User Story 2 (P2): Depends on the shared item CRUD foundation introduced in User Story 1.
- User Story 3 (P2): Depends on the item ordering and collection state work from User Story 1 and the shared collection UI introduced in User Story 2.

## Parallel Opportunities

- Setup tasks can be worked on in parallel where they touch different parts of the monorepo.
- The repository, auth middleware, and error handling work can be parallelized after the shared contracts are in place.
- The API and frontend test tasks for a given user story can be written in parallel.
- User Story 1, Story 2, and Story 3 can be implemented by different contributors once the foundation is complete.

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Implement User Story 1 and validate it independently.
3. Add User Story 2 and User Story 3 incrementally.

### Incremental Delivery

1. Build the shared contracts and backend foundation.
2. Deliver the collection browsing experience.
3. Add CRUD flows for item management.
4. Finish with reorder persistence and polish.
