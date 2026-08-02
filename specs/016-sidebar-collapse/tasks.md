# Tasks: Sidebar Collapse & Expand Mechanics

**Input**: Design documents from `/specs/016-sidebar-collapse/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md, contracts/sidebar-contract.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)

## Constitution Alignment Tasks

- [x] T000 Review constitution alignment for UI component layout and client state persistence in `specs/016-sidebar-collapse/plan.md`
- [x] T001 Verify accessibility and component contracts in `specs/016-sidebar-collapse/contracts/sidebar-contract.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Component structure & layout verification

- [x] T002 Verify existing `Sidebar` and `CollectionPage` layout state structure in `src/web/components/Sidebar.tsx` and `src/web/pages/CollectionPage.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Test infrastructure for sidebar interactions

- [x] T003 [P] Create unit test structure for sidebar collapse/expand in `src/web/components/__tests__/Sidebar.test.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Responsive Sidebar Collapse & Expand Toggle (Priority: P1) 🎯 MVP

**Goal**: Single `tags-toggle-btn` inside sidebar header that collapses sidebar width and hides inner controls (`display: none`).

**Independent Test**: Render the collection page, click the sidebar "Tags" toggle button, and verify the sidebar shrinks to the toggle button width with inner tag controls hidden.

### Implementation for User Story 1

- [x] T004 [P] [US1] Update `Sidebar.tsx` header to render a single `tags-toggle-btn` and conditionally hide inner filter elements when reduced in `src/web/components/Sidebar.tsx`
- [x] T005 [P] [US1] Remove topbar `tags-toggle-btn` from `CollectionPage.tsx` header in `src/web/pages/CollectionPage.tsx`
- [x] T006 [US1] Update CSS rules for `.app-sidebar.collapsed` vs `.expanded` to shrink sidebar width down to the toggle button width in `src/web/index.css`

**Checkpoint**: User Story 1 fully functional and verified

---

## Phase 4: User Story 2 - Persistent Sidebar State Across Sessions (Priority: P2)

**Goal**: Save user layout preference in `localStorage` under key `conjuros_sidebar_open`.

**Independent Test**: Collapse sidebar, reload page, and verify state remains reduced.

### Implementation for User Story 2

- [x] T007 [P] [US2] Initialize and persist `isSidebarOpen` state in `localStorage` under key `conjuros_sidebar_open` in `src/web/pages/CollectionPage.tsx`
- [x] T008 [US2] Add state persistence unit tests in `src/web/components/__tests__/Sidebar.test.tsx` and `src/web/pages/__tests__/CollectionPage.test.tsx`

**Checkpoint**: User Stories 1 AND 2 complete and verified

---

## Phase 5: User Story 3 - Accessible Toggle State & Keyboard Controls (Priority: P3)

**Goal**: Full accessibility (`aria-expanded`) and `Escape` key shortcut to reduce sidebar width.

**Independent Test**: Inspect toggle button for `aria-expanded` attributes and press `Escape` inside expanded sidebar to confirm collapse.

### Implementation for User Story 3

- [x] T009 [P] [US3] Add `aria-expanded` and `aria-controls` attributes to `tags-toggle-btn` in `src/web/components/Sidebar.tsx`
- [x] T010 [US3] Implement `Escape` key listener in `Sidebar.tsx` to reduce sidebar width when focused in `src/web/components/Sidebar.tsx`

**Checkpoint**: All User Stories complete and verified

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T011 Run `npm run check` (lint, test, build) and validate quickstart guide in `specs/016-sidebar-collapse/quickstart.md`

---

## Dependencies & Execution Order

### Parallel Opportunities

- T004, T005 can run in parallel (different files: `Sidebar.tsx` vs `CollectionPage.tsx`)
- T007, T009 can run in parallel (different focus areas)
