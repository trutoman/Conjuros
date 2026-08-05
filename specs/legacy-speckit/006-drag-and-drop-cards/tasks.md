# Tasks: Drag-and-Drop Card Reordering

**Input**: Design documents from `/specs/006-drag-and-drop-cards/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Include tests for success, error handling, ownership-safe integration usage, and keyboard-accessible reorder behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- [P] = Can run in parallel (different files, no blocking dependency)
- [Story] = User story label for traceability (US1, US2, US3)
- Every task includes a concrete file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare feature-specific test scaffolding and working artifacts.

- [x] T001 Add drag-and-drop fixture helpers for collection rows in src/web/components/**tests**/CollectionList.test.tsx
- [x] T002 [P] Add keyboard shortcut test helpers (`Alt+ArrowUp`/`Alt+ArrowDown`) in src/web/components/**tests**/CollectionList.test.tsx
- [x] T003 [P] Add reorder failure mock helper for page-level tests in src/web/pages/**tests**/CollectionPage.test.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared reorder interaction foundations before story-specific work.

**CRITICAL**: No user story implementation starts before this phase is complete.

- [x] T004 Refactor list row identity/order utilities for drag target computation in src/web/components/CollectionList.tsx
- [x] T005 [P] Add reusable reorder-state types and guards for no-op/out-of-bounds moves in src/web/components/CollectionList.tsx
- [x] T006 [P] Define shared drag/drop and keyboard feedback classes in src/web/index.css
- [x] T007 Remove legacy reorder control integration point from list row composition in src/web/components/CollectionList.tsx

**Checkpoint**: Foundation ready for story-level implementation.

---

## Phase 3: User Story 1 - Reorder cards by drag and drop (Priority: P1) 🎯 MVP

**Goal**: Reorder item-cards by dragging and dropping rows, persisting through existing reorder API flow.

**Independent Test**: Drag a card to a different row position, verify visible order update and persistence after reload.

### Tests for User Story 1

- [x] T008 [P] [US1] Add component test for drag start/drag over/drop reorder success in src/web/components/**tests**/CollectionList.test.tsx
- [x] T009 [P] [US1] Add component test that dropping in original position triggers no reorder call in src/web/components/**tests**/CollectionList.test.tsx
- [x] T010 [US1] Add page test that successful drag-drop reorder routes through existing reorder mutation in src/web/pages/**tests**/CollectionPage.test.tsx

### Implementation for User Story 1

- [x] T011 [US1] Implement row drag start/drag end state handling in src/web/components/CollectionList.tsx
- [x] T012 [US1] Implement row drag over/drop target resolution and reorder dispatch in src/web/components/CollectionList.tsx
- [x] T013 [US1] Integrate reorder call mapping to target item order in src/web/pages/CollectionPage.tsx
- [x] T014 [US1] Add dragged/drag-over visual feedback styling in src/web/index.css

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Remove arrow-based reordering controls (Priority: P1)

**Goal**: Remove up/down arrow reorder controls completely so drag-and-drop is the only pointer reorder path.

**Independent Test**: Load the collection and verify no arrow controls appear or participate in reorder.

### Tests for User Story 2

- [x] T015 [P] [US2] Add component assertion that arrow-based reorder controls are not rendered in src/web/components/**tests**/CollectionList.test.tsx
- [x] T016 [US2] Add page-level regression assertion for absence of legacy move-up/move-down controls in src/web/pages/**tests**/CollectionPage.test.tsx

### Implementation for User Story 2

- [x] T017 [US2] Remove `ReorderHandle` usage and left control column from row rendering in src/web/components/CollectionList.tsx
- [x] T018 [US2] Remove legacy reorder control component implementation in src/web/components/ReorderHandle.tsx
- [x] T019 [US2] Remove reorder-control layout and icon-arrow styling rules in src/web/index.css

**Checkpoint**: User Story 2 is independently functional and testable.

---

## Phase 5: User Story 3 - Keep reorder accessible and understandable (Priority: P2)

**Goal**: Support keyboard reorder via `Alt+ArrowUp`/`Alt+ArrowDown` with clear interaction feedback and safe bounds.

**Independent Test**: Focus a row and reorder one step up/down using keyboard shortcuts; verify persistence and focus continuity.

### Tests for User Story 3

- [x] T020 [P] [US3] Add component test for keyboard reorder up/down behavior and bounds safety in src/web/components/**tests**/CollectionList.test.tsx
- [x] T021 [P] [US3] Add component test ensuring focus remains on moved row after keyboard reorder in src/web/components/**tests**/CollectionList.test.tsx
- [x] T022 [US3] Add page test for visible error feedback when keyboard reorder persistence fails in src/web/pages/**tests**/CollectionPage.test.tsx

### Implementation for User Story 3

- [x] T023 [US3] Implement `Alt+ArrowUp` and `Alt+ArrowDown` row handlers in src/web/components/CollectionList.tsx
- [x] T024 [US3] Add keyboard-safe move guards (first/last item no-op) in src/web/components/CollectionList.tsx
- [x] T025 [US3] Add focus management and aria feedback attributes for moved row in src/web/components/CollectionList.tsx
- [x] T026 [US3] Add keyboard-focus and active-drop feedback styles in src/web/index.css

**Checkpoint**: User Story 3 is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, cleanup, and documentation updates across all stories.

- [x] T027 [P] Update drag-and-drop and keyboard reorder behavior notes in specs/006-drag-and-drop-cards/quickstart.md
- [x] T028 [P] Align interaction contract examples with implemented behavior in specs/006-drag-and-drop-cards/contracts/reorder-interaction.md
- [x] T029 Run targeted tests and full validation commands (`npm run test -- src/web/components/__tests__/CollectionList.test.tsx src/web/pages/__tests__/CollectionPage.test.tsx` and `npm run check`) from package.json

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No dependencies.
- Foundational (Phase 2): Depends on Setup completion and blocks all user stories.
- User Story phases (Phase 3-5): Depend on Foundational completion.
- Polish (Phase 6): Depends on all selected user stories completion.

### User Story Dependencies

- US1 (P1): Can start once Foundational is complete.
- US2 (P1): Can start once Foundational is complete; should be completed before final UX sign-off.
- US3 (P2): Can start once Foundational is complete; depends on US1 reorder paths existing.

### Within Each User Story

- Write tests first and confirm they fail before implementation.
- Implement core interaction logic before styling polish.
- Complete and validate each story independently before moving on.

## Parallel Opportunities

- Phase 1: T002 and T003 can run in parallel after T001.
- Phase 2: T005 and T006 can run in parallel after T004.
- US1: T008 and T009 can run in parallel; T014 can proceed after T011/T012 are in place.
- US2: T015 and T016 can run in parallel before T017-T019.
- US3: T020 and T021 can run in parallel; T026 can run in parallel with T025 once keyboard handlers exist.
- Phase 6: T027 and T028 can run in parallel before T029.

---

## Parallel Example: User Story 1

```bash
# Run US1 test authoring in parallel:
Task T008 in src/web/components/__tests__/CollectionList.test.tsx
Task T009 in src/web/components/__tests__/CollectionList.test.tsx

# Then implement and style:
Task T011 in src/web/components/CollectionList.tsx
Task T012 in src/web/components/CollectionList.tsx
Task T014 in src/web/index.css
```

## Parallel Example: User Story 3

```bash
# Author keyboard behavior tests together:
Task T020 in src/web/components/__tests__/CollectionList.test.tsx
Task T021 in src/web/components/__tests__/CollectionList.test.tsx

# Implement logic + visuals:
Task T023 in src/web/components/CollectionList.tsx
Task T026 in src/web/index.css
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 and Phase 2.
2. Deliver US1 (drag-and-drop reorder + persistence).
3. Validate US1 independently using targeted tests.
4. Demo/release MVP.

### Incremental Delivery

1. Foundation ready (Phase 1-2).
2. Add US1 (core drag/drop reorder).
3. Add US2 (remove arrows entirely).
4. Add US3 (keyboard accessibility and feedback).
5. Final polish and full checks.

### Parallel Team Strategy

1. Team completes Setup + Foundational together.
2. After Foundational:
   - Developer A: US1 interaction logic and tests.
   - Developer B: US2 legacy-control removal and CSS cleanup.
   - Developer C: US3 keyboard behavior and accessibility feedback.
3. Merge at phase checkpoints, then run full validation.

---

## Notes

- [P] tasks indicate no direct blocking dependencies and different change areas.
- Keep all documentation, code, and tests in English.
- Preserve ownership-safe reorder behavior by continuing through existing authenticated mutation paths.
