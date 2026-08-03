# Tasks: Boxed Application Shell & Layout Reformat

**Input**: Design documents from `/specs/011-reformat-main/`

**Prerequisites**: [plan.md](file:///home/alosadad/Conjuros/specs/011-reformat-main/plan.md) (required), [spec.md](file:///home/alosadad/Conjuros/specs/011-reformat-main/spec.md) (required), [research.md](file:///home/alosadad/Conjuros/specs/011-reformat-main/research.md), [data-model.md](file:///home/alosadad/Conjuros/specs/011-reformat-main/data-model.md), [contracts/ui-layout-contract.md](file:///home/alosadad/Conjuros/specs/011-reformat-main/contracts/ui-layout-contract.md)

**Tests**: Manual verification scenarios and component unit test checks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Constitution Alignment Tasks

- [x] T000 Review constitution constraints and layout rules in [AGENTS.md](file:///home/alosadad/Conjuros/AGENTS.md)
- [x] T001 Ensure contract definitions in [ui-layout-contract.md](file:///home/alosadad/Conjuros/specs/011-reformat-main/contracts/ui-layout-contract.md) are strictly preserved
- [x] T002 Verify layout changes do not alter ownership verification or authorization boundaries
- [x] T003 Confirm accessible actions (copy command, open link) and keyboard accessibility remain functional

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Review and prepare layout stylesheets and page components for reformatting.

- [x] T004 Review current `.app-shell` structure and layout definitions in [index.css](file:///home/alosadad/Conjuros/src/web/index.css) and [CollectionPage.tsx](file:///home/alosadad/Conjuros/src/web/pages/CollectionPage.tsx)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish base container layout classes required by all user stories.

- [x] T005 Update base `.app-shell` layout properties in [index.css](file:///home/alosadad/Conjuros/src/web/index.css) to enforce centered alignment and max-width boundaries

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Centered Boxed Container Layout (Priority: P1) 🎯 MVP

**Goal**: Restore the centered boxed application shell container with a desktop max-width (1440px) and responsive mobile padding (`<= 650px`).

**Independent Test**: Open the application on desktop (>1600px) and verify `.app-shell` remains centered with 1440px max-width; resize viewport to <=650px and verify container width adapts to `min(100% - 1rem, 1120px)` with 1rem top padding.

### Implementation for User Story 1

- [x] T006 [P] [US1] Define centered container styling for `.app-shell` in [index.css](file:///home/alosadad/Conjuros/src/web/index.css) (`width: min(1440px, calc(100% - 2rem)); margin: 0 auto; padding: 2rem 0 4rem;`)
- [x] T007 [P] [US1] Add responsive media query rules for `.app-shell` at `@media (max-width: 650px)` in [index.css](file:///home/alosadad/Conjuros/src/web/index.css) (`width: min(100% - 1rem, 1120px); padding-top: 1rem;`)
- [x] T008 [US1] Verify `.app-shell` container element wrapping across page layouts in [CollectionPage.tsx](file:///home/alosadad/Conjuros/src/web/pages/CollectionPage.tsx) and [TagsPage.tsx](file:///home/alosadad/Conjuros/src/web/pages/TagsPage.tsx)

**Checkpoint**: At this point, User Story 1 (Centered Boxed Shell) is fully functional and independently testable (MVP ready).

---

## Phase 4: User Story 2 - Stable Grid Layout on Sidebar Toggle (Priority: P2)

**Goal**: Ensure the collapsible tag/search sidebar operates as an in-flow flex item with a smooth 200ms CSS transition without displacing items in the main collection card grid.

**Independent Test**: Toggle search/tags sidebar expand/collapse state and verify the sidebar transitions smoothly in 200ms while the main `.collection-grid` fills available space without visual distortion or element displacement.

### Implementation for User Story 2

- [x] T009 [P] [US2] Implement `.app-shell-body` flex container rules in [index.css](file:///home/alosadad/Conjuros/src/web/index.css) (`display: flex; gap: 1.5rem; align-items: flex-start;`)
- [x] T010 [P] [US2] Implement `.app-sidebar` in-flow collapsible styles and transitions in [index.css](file:///home/alosadad/Conjuros/src/web/index.css) (`transition: max-width 200ms ease, opacity 150ms ease;`)
- [x] T011 [US2] Update `.main-content-frame` and `.collection-grid` layout rules in [index.css](file:///home/alosadad/Conjuros/src/web/index.css) (`grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));`)
- [x] T012 [US2] Connect sidebar collapse state and conditional class names in [CollectionPage.tsx](file:///home/alosadad/Conjuros/src/web/pages/CollectionPage.tsx)

**Checkpoint**: User Stories 1 AND 2 are complete and work together seamlessly.

---

## Phase 5: User Story 3 - In-bounds Log Panel Rendering (Priority: P3)

**Goal**: Ensure auxiliary log panel renders inside the centered application shell frame without overflowing container bounds.

**Independent Test**: Open the log panel and verify it remains rendered inside `.app-shell-body` within the centered 1440px shell container.

### Implementation for User Story 3

- [x] T013 [P] [US3] Add `.log-panel-frame` layout rules bounded inside `.app-shell-body` in [index.css](file:///home/alosadad/Conjuros/src/web/index.css)
- [x] T014 [US3] Verify log panel container rendering within the boxed layout shell in [CollectionPage.tsx](file:///home/alosadad/Conjuros/src/web/pages/CollectionPage.tsx)

**Checkpoint**: All user stories are implemented and functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification, code quality checks, and final testing.

- [x] T015 [P] Run unit test suite (`npm test`) to ensure no regressions in web components
- [x] T016 [P] Execute manual validation scenarios documented in [quickstart.md](file:///home/alosadad/Conjuros/specs/011-reformat-main/quickstart.md)
- [x] T017 Run full project check (`npm run check`) and resolve any linter/type errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after User Story 1 (P1)
- **User Story 3 (P3)**: Can start after User Story 2 (P2)

### Parallel Opportunities

- T006 [US1] and T007 [US1] can be developed in parallel in CSS
- T009 [US2] and T010 [US2] can be developed in parallel
- T015 and T016 validation tasks can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Setup + Foundational (T004-T005)
2. Complete User Story 1 (T006-T008)
3. **STOP and VALIDATE**: Verify centered boxed shell layout on desktop & mobile

### Incremental Delivery
1. Deliver MVP (User Story 1) → Centered boxed container working
2. Deliver User Story 2 → Smooth 200ms sidebar toggle & stable grid
3. Deliver User Story 3 → In-bounds log panel rendering
4. Polish & Verification → Pass `npm test` & `npm run check`
