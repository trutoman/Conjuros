# Tasks: Search & Filter Sub-Header in Main Content Frame

**Input**: Design documents from `/specs/012-searchbox-as-header/`

**Prerequisites**: [plan.md](file:///home/alosadad/Conjuros/specs/012-searchbox-as-header/plan.md) (required), [spec.md](file:///home/alosadad/Conjuros/specs/012-searchbox-as-header/spec.md) (required), [research.md](file:///home/alosadad/Conjuros/specs/012-searchbox-as-header/research.md), [data-model.md](file:///home/alosadad/Conjuros/specs/012-searchbox-as-header/data-model.md), [contracts/ui-components-contract.md](file:///home/alosadad/Conjuros/specs/012-searchbox-as-header/contracts/ui-components-contract.md)

**Tests**: Manual verification scenarios and component unit test updates.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Constitution Alignment Tasks

- [x] T000 Review constitution constraints and UI guidelines in [AGENTS.md](file:///home/alosadad/Conjuros/AGENTS.md)
- [x] T001 Ensure contract definitions in [ui-components-contract.md](file:///home/alosadad/Conjuros/specs/012-searchbox-as-header/contracts/ui-components-contract.md) are strictly preserved
- [x] T002 Verify layout changes do not alter ownership verification or authorization boundaries
- [x] T003 Confirm accessible search labels and keyboard accessibility remain functional

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Review existing search and filter components.

- [x] T004 Review current search input and type selector elements in [Sidebar.tsx](file:///home/alosadad/Conjuros/src/web/components/Sidebar.tsx) and [CollectionPage.tsx](file:///home/alosadad/Conjuros/src/web/pages/CollectionPage.tsx)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish `.collection-subheader` CSS container rules.

- [x] T005 Define `.collection-subheader` flex container styles in [index.css](file:///home/alosadad/Conjuros/src/web/index.css)

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Relocate Search & Type Filter to Main Content Sub-Header (Priority: P1) 🎯 MVP

**Goal**: Move the search input box and item type selector out of `Sidebar.tsx` and place them inside `.main-content-frame` as a sub-header directly above the collection list in `CollectionPage.tsx`.

**Independent Test**: Render the collection page and verify search box and type selector appear inside `.main-content-frame` directly above the item grid.

### Implementation for User Story 1

- [x] T006 [P] [US1] Render `.collection-subheader` container inside `.main-content-frame` in [CollectionPage.tsx](file:///home/alosadad/Conjuros/src/web/pages/CollectionPage.tsx)
- [x] T007 [P] [US1] Move search input box (`.search-field`) and type selector (`ItemKind` dropdown) into `.collection-subheader` in [CollectionPage.tsx](file:///home/alosadad/Conjuros/src/web/pages/CollectionPage.tsx)
- [x] T008 [US1] Remove search input box and item type selector dropdown from [Sidebar.tsx](file:///home/alosadad/Conjuros/src/web/components/Sidebar.tsx)

**Checkpoint**: User Story 1 (Sub-Header Relocation) is fully functional and independently testable (MVP ready).

---

## Phase 4: User Story 2 - Full-Width Search Input & Flexible Sub-Header Layout (Priority: P2)

**Goal**: Ensure search input box expands horizontally (`flex: 1`) on desktop and sub-header stacks into 2 full-width rows on mobile viewports (<= 650px).

**Independent Test**: Resize browser to <= 650px and verify sub-header stacks into 2 full-width rows.

### Implementation for User Story 2

- [x] T009 [P] [US2] Add desktop flex layout rules for `.collection-subheader` and `.search-field` (`flex: 1 1 auto`) in [index.css](file:///home/alosadad/Conjuros/src/web/index.css)
- [x] T010 [P] [US2] Add mobile media query stacking rules at `@media (max-width: 650px)` (`flex-direction: column; align-items: stretch;`) in [index.css](file:///home/alosadad/Conjuros/src/web/index.css)

**Checkpoint**: User Stories 1 AND 2 complete and responsive across desktop & mobile.

---

## Phase 5: User Story 3 - Tags Sidebar Cleanup & Header Renaming (Priority: P3)

**Goal**: Update sidebar heading from `"Search"` to `"Tags"` in `Sidebar.tsx` and update unit tests.

**Independent Test**: Open tags sidebar and verify heading title displays `"Tags"`.

### Implementation for User Story 3

- [x] T011 [P] [US3] Update sidebar heading text from `"Search"` to `"Tags"` in [Sidebar.tsx](file:///home/alosadad/Conjuros/src/web/components/Sidebar.tsx)
- [x] T012 [P] [US3] Update sidebar component unit tests in [Sidebar.test.tsx](file:///home/alosadad/Conjuros/src/web/components/__tests__/Sidebar.test.tsx) to match `"Tags"` heading

**Checkpoint**: All user stories implemented and functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification, code quality checks, and final testing.

- [x] T013 [P] Run unit test suite (`npm test`) to ensure no regressions
- [x] T014 [P] Execute manual validation scenarios documented in [quickstart.md](file:///home/alosadad/Conjuros/specs/012-searchbox-as-header/quickstart.md)
- [x] T015 Run full project check (`npm run check`) to verify linter, types, tests, and build

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### Parallel Opportunities

- T006 [US1] and T007 [US1] can be developed together in `CollectionPage.tsx`
- T009 [US2] and T010 [US2] can be developed together in `index.css`
- T011 [US3] and T012 [US3] can be developed in parallel with CSS layout tasks
