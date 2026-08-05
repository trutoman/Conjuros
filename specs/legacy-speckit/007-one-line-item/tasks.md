# Tasks: Top-Row Item Text Placement

**Input**: Design documents from `/specs/007-one-line-item/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/item-card-row-ui.md

## Constitution Alignment Tasks

- [x] T001 Review constitution constraints for ownership, explicit open action, and keyboard accessibility in specs/007-one-line-item/plan.md
- [x] T002 Verify no shared contract shape changes are required and document contract reuse in specs/007-one-line-item/contracts/item-card-row-ui.md
- [x] T003 Define regression coverage targets for success, validation, and ownership boundaries in specs/007-one-line-item/quickstart.md
- [x] T004 Record security-sensitive expectations (copy exact spell text, explicit web-link open) in specs/007-one-line-item/research.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare test fixtures and implementation scaffolding for item-card row refactor.

- [x] T005 Create layout fixture helpers for long content and dense tags in src/web/components/**tests**/itemCard.fixtures.ts
- [x] T006 [P] Add top-row and overflow test utility queries in src/web/components/**tests**/itemCard.test-utils.ts
- [x] T007 [P] Add baseline collection-page fixture coverage for mixed spell/web-link rows in src/web/pages/**tests**/CollectionPage.test.tsx
- [x] T008 Add feature-specific validation checklist updates in specs/007-one-line-item/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared row-layout primitives used by all user stories.

**⚠️ CRITICAL**: No user story work starts before this phase is complete.

- [x] T009 Introduce item-card top-row layout container and semantic subregions in src/web/components/ItemCard.tsx
- [x] T010 [P] Define CSS layout tokens for vertical centering and constrained-width behavior in src/web/index.css
- [x] T011 [P] Implement tag overflow computation helper for +N indicator derivation in src/web/components/itemCardOverflow.ts
- [x] T012 Wire overflow helper into ItemCard rendering model without changing API contracts in src/web/components/ItemCard.tsx
- [x] T013 Add foundational unit tests for overflow helper edge cases in src/web/components/**tests**/itemCardOverflow.test.ts

**Checkpoint**: Foundation complete. User stories can proceed independently.

---

## Phase 3: User Story 1 - See item content in the top row (Priority: P1) 🎯 MVP

**Goal**: Render item content text in the top row between title and tags.

**Independent Test**: In collection view, each item shows title -> content text -> tags ordering on the top row.

### Tests for User Story 1

- [x] T014 [P] [US1] Add ItemCard DOM-order tests for top-row placement in src/web/components/**tests**/ItemCard.test.tsx
- [x] T015 [P] [US1] Add collection-page rendering tests for top-row content visibility in src/web/pages/**tests**/CollectionPage.test.tsx

### Implementation for User Story 1

- [x] T016 [US1] Move inline item content text from body code box to top-row content segment in src/web/components/ItemCard.tsx
- [x] T017 [US1] Update top-row styles so content text is between title and tags in src/web/index.css
- [x] T018 [US1] Keep content text readable with truncation-safe formatting in src/web/index.css
- [x] T019 [US1] Validate row rendering compatibility for both spell and web-link items in src/web/components/ItemCard.tsx

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Keep card alignment and actions stable (Priority: P1)

**Goal**: Preserve copy/open/edit/delete/reorder behavior and vertical alignment after layout refactor.

**Independent Test**: All item actions still work from updated cards, and row elements remain vertically centered.

### Tests for User Story 2

- [x] T020 [P] [US2] Add action-regression tests for copy/open/edit/delete in src/web/components/**tests**/ItemCard.test.tsx
- [x] T021 [P] [US2] Add reorder-control availability regression checks in src/web/components/**tests**/CollectionList.test.tsx
- [x] T022 [P] [US2] Add vertical-centering assertions for row elements in src/web/components/**tests**/ItemCard.test.tsx
- [x] T039 [P] [US2] Add loading-state regression test coverage in src/web/pages/**tests**/CollectionPage.test.tsx
- [x] T040 [P] [US2] Add empty/no-results state regression test coverage in src/web/pages/**tests**/CollectionPage.test.tsx
- [x] T041 [P] [US2] Add error-state regression test coverage in src/web/pages/**tests**/CollectionPage.test.tsx

### Implementation for User Story 2

- [x] T023 [US2] Preserve existing action handlers and aria labels while refactoring row markup in src/web/components/ItemCard.tsx
- [x] T024 [US2] Ensure action cluster remains fixed-width and vertically centered in constrained layouts in src/web/index.css
- [x] T025 [US2] Keep explicit web-link open action and spell copy behavior unchanged in src/web/components/ItemCard.tsx

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Handle constrained width predictably (Priority: P2)

**Goal**: Enforce deterministic compression: content shrinks first to ~2rem, then tags collapse to +N with hover/focus reveal.

**Independent Test**: Under narrow width, title/actions stay visible, tags collapse to +N, hidden tags reveal on hover/focus, and touch-only reveal is not required.

### Tests for User Story 3

- [x] T026 [P] [US3] Add constrained-width behavior tests for shrink-first content area in src/web/components/**tests**/ItemCard.test.tsx
- [x] T027 [P] [US3] Add +N collapse and hidden-tag count tests in src/web/components/**tests**/itemCardOverflow.test.ts
- [x] T028 [P] [US3] Add hover/focus hidden-tag reveal tests and touch-only non-reveal assertions in src/web/components/**tests**/ItemCard.test.tsx

### Implementation for User Story 3

- [x] T029 [US3] Set content text area minimum width near 2rem and shrink priority rules in src/web/index.css
- [x] T030 [US3] Render +N indicator when tags overflow after content minimum width is reached in src/web/components/ItemCard.tsx
- [x] T031 [US3] Implement tooltip/popover reveal behavior for +N on pointer hover and keyboard focus in src/web/components/ItemCard.tsx
- [x] T032 [US3] Ensure +N indicator is keyboard-focusable with visible focus treatment in src/web/index.css
- [x] T033 [US3] Preserve touch-only behavior by omitting collapsed-row reveal interaction on touch paths in src/web/components/ItemCard.tsx

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize documentation, regression coverage, and repository-wide validation.

- [x] T034 [P] Update feature contract notes to reflect final +N behavior in specs/007-one-line-item/contracts/item-card-row-ui.md
- [x] T035 [P] Update scenario walkthroughs for final behavior in specs/007-one-line-item/quickstart.md
- [x] T036 Add ownership and authorization regression confidence notes in specs/007-one-line-item/research.md
- [x] T042 [P] Add cross-user read/update/delete denial regression tests (403/404) in src/tests/api/items.test.ts
- [x] T043 [P] Add cross-user reorder denial regression tests (403/404) in src/tests/api/reorder.test.ts
- [x] T037 Run focused web test suite for item-card and collection-page behavior in src/web/components/**tests**/ItemCard.test.tsx and src/web/pages/**tests**/CollectionPage.test.tsx
- [x] T044 Run API ownership regression subset and capture outcomes in specs/007-one-line-item/plan.md
- [x] T038 Run full validation command and capture outcome in specs/007-one-line-item/plan.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Constitution Alignment Tasks: must complete before implementation edits.
- Setup (Phase 1): depends on Constitution Alignment completion.
- Foundational (Phase 2): depends on Setup completion and blocks all user stories.
- User Story phases (Phase 3-5): depend on Foundational completion.
- Polish (Phase 6): depends on selected user stories being complete.

### User Story Dependencies

- User Story 1 (P1): can start immediately after Foundational completion.
- User Story 2 (P1): can start after Foundational completion; it validates action parity and can run in parallel with US1.
- User Story 3 (P2): depends on foundational overflow helper and can run after US1 layout placement is in place.

### Within Each User Story

- Tests are written first and must fail before implementation.
- Markup changes before style refinements.
- Overflow logic before interaction reveal wiring.
- Story-level checkpoint must pass before moving to broad polish.

### Parallel Opportunities

- T006 and T007 can run in parallel during Setup.
- T010 and T011 can run in parallel during Foundational phase.
- Within US1: T014 and T015 parallel.
- Within US2: T020, T021, and T022 parallel.
- Within US3: T026, T027, and T028 parallel.
- Polish docs tasks T034 and T035 parallel.

---

## Parallel Example: User Story 3

```bash
# Execute US3 tests in parallel before implementation
Task: "T026 [US3] Add constrained-width behavior tests in src/web/components/__tests__/ItemCard.test.tsx"
Task: "T027 [US3] Add +N collapse/count tests in src/web/components/__tests__/itemCardOverflow.test.ts"
Task: "T028 [US3] Add hover/focus reveal tests in src/web/components/__tests__/ItemCard.test.tsx"

# Then implement independent parts in parallel
Task: "T029 [US3] Set content min-width and shrink priority rules in src/web/index.css"
Task: "T030 [US3] Render +N indicator from overflow model in src/web/components/ItemCard.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Constitution Alignment + Setup + Foundational phases.
2. Deliver User Story 1 (top-row content placement).
3. Validate US1 independently with T014-T019 before expanding scope.

### Incremental Delivery

1. Build shared row foundations (Phase 2).
2. Ship US1 for visible top-row placement value.
3. Add US2 to guarantee interaction parity.
4. Add US3 for constrained-width and +N behavior.
5. Finish with Phase 6 repository validation.

### Parallel Team Strategy

1. One developer handles overflow helper and CSS foundations (T010-T013).
2. One developer handles US1 markup/tests (T014-T019).
3. One developer handles US2 action-regression coverage (T020-T025).
4. After merge, one developer finalizes US3 behavior and cross-cutting checks (T026-T038).

## Notes

- [P] tasks touch different files or independent concerns and can be run in parallel.
- [US1]/[US2]/[US3] labels ensure end-to-end traceability from spec stories to implementation work.
- Keep all changes in English and preserve contract-first boundaries.
- Before closing the feature, run `npm run check` and report unresolved failures if any.
