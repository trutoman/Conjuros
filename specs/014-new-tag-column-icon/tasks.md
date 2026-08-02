# Tasks: New Tag Column Icon

**Input**: Design documents from `/specs/014-new-tag-column-icon/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)

## Constitution Alignment Tasks

- [x] T000 Review constitution alignment for UI components
- [x] T001 Verify accessibility & component contracts

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Component creation and project setup

- [x] T002 Create component stub for `TagColumnIcon` in `src/web/components/TagColumnIcon.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Test infrastructure for the new icon component

- [x] T003 [P] Create unit test file for `TagColumnIcon` in `src/web/components/__tests__/TagColumnIcon.test.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Custom Soft Bar Bookmark Icon (Priority: P1) 🎯 MVP

**Goal**: Display custom soft bar bookmark SVG icon below centered "Tags" text in topbar toggle button and sidebar header.

**Independent Test**: Open the collection view and sidebar, verifying that the soft bar bookmark SVG icon appears centered beneath "Tags" text in both topbar button and sidebar header.

### Implementation for User Story 1

- [x] T004 [P] [US1] Implement soft bar bookmark SVG path (`M 8 6 C 5 6, 5 11, 8 11 H 13 V 54 C 13 56, 14 57, 16 56 L 32 44 L 48 56 C 50 57, 51 56, 51 54 V 11 H 56 C 59 11, 59 6, 56 6 Z`) with `fill="currentColor"` in `src/web/components/TagColumnIcon.tsx`
- [x] T005 [P] [US1] Render `TagColumnIcon` in `src/web/components/Sidebar.tsx` header
- [x] T006 [P] [US1] Render `TagColumnIcon` in `src/web/pages/CollectionPage.tsx` topbar Tags button
- [x] T007 [US1] Add CSS styles in `src/web/index.css` for flex column layout (centered text top, icon below) on topbar Tags button and sidebar header

**Checkpoint**: User Story 1 fully functional and testable independently

---

## Phase 4: User Story 2 - Accessibility & Semantic Markup (Priority: P2)

**Goal**: Ensure proper `aria-hidden="true"` decoration handling and color inheritance across light/dark themes.

**Independent Test**: Inspect rendered SVG elements for correct ARIA attributes and verify theme switching.

### Implementation for User Story 2

- [x] T008 [P] [US2] Add ARIA attribute props (`aria-hidden="true"` by default when decorative) in `src/web/components/TagColumnIcon.tsx`
- [x] T009 [US2] Update unit tests in `src/web/components/__tests__/TagColumnIcon.test.tsx` and `src/web/components/__tests__/Sidebar.test.tsx` to verify SVG rendering and accessibility attributes

**Checkpoint**: User Stories 1 AND 2 complete and verified

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T010 Run `npm run check` (lint, test, build) and validate quickstart guide in `specs/014-new-tag-column-icon/quickstart.md`

---

## Dependencies & Execution Order

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 (Foundational)
- **User Story 2 (P2)**: Can start after US1 implementation

### Parallel Opportunities

- T004, T005, T006 can run in parallel (different component files)
- T008 can run once T004 is complete

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 & 2: Setup & Foundational
2. Complete Phase 3: User Story 1 (icon component + layout in header & sidebar button)
3. **VALIDATE**: Run dev server and test User Story 1 visually
