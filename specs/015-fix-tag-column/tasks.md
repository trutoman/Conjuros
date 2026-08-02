# Tasks: Fix Tag Column Icon Layout

**Input**: Design documents from `/specs/015-fix-tag-column/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)

## Constitution Alignment Tasks

- [x] T000 Review constitution alignment for UI component layout
- [x] T001 Verify accessibility and component contracts

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Component setup and structure verification

- [x] T002 Verify `TagColumnIcon` component stub in `src/web/components/TagColumnIcon.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Test infrastructure for icon and button markup

- [x] T003 [P] Verify unit test suite in `src/web/components/__tests__/TagColumnIcon.test.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Vertical Layout for Tags Toggle Button and Sidebar Header (Priority: P1) 🎯 MVP

**Goal**: Enforce `<button class="quiet tags-toggle-btn"><span>Tags</span><TagColumnIcon /></button>` and vertical column CSS alignment.

**Independent Test**: Render the collection page and sidebar, verifying text on top centered with the soft bar bookmark icon directly below.

### Implementation for User Story 1

- [x] T004 [P] [US1] Enforce soft bar bookmark SVG path (`M 8 6...`) with `fill="currentColor"` in `src/web/components/TagColumnIcon.tsx`
- [x] T005 [P] [US1] Render `TagColumnIcon` below centered title in `src/web/components/Sidebar.tsx` header
- [x] T006 [P] [US1] Render `<button className="quiet tags-toggle-btn"><span>Tags</span><TagColumnIcon /></button>` in `src/web/pages/CollectionPage.tsx`
- [x] T007 [US1] Apply CSS rules (`display: inline-flex`, `flex-direction: column`, `align-items: center`) in `src/web/index.css` for `.tags-toggle-btn` and `.sidebar-header-title`

**Checkpoint**: User Story 1 fully functional and verified

---

## Phase 4: User Story 2 - Accessible Toggle Button & Decoration Markup (Priority: P2)

**Goal**: Ensure decorative SVG has `aria-hidden="true"` and button maintains full accessibility.

**Independent Test**: Inspect rendered SVG for `aria-hidden="true"` and test keyboard interaction.

### Implementation for User Story 2

- [x] T008 [P] [US2] Ensure `aria-hidden="true"` by default when visual text label is present in `src/web/components/TagColumnIcon.tsx`
- [x] T009 [US2] Update unit tests in `src/web/components/__tests__/TagColumnIcon.test.tsx` and `src/web/components/__tests__/Sidebar.test.tsx` to verify SVG attributes

**Checkpoint**: User Stories 1 AND 2 complete and verified

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T010 Run `npm run check` (lint, test, build) and validate quickstart guide in `specs/015-fix-tag-column/quickstart.md`

---

## Dependencies & Execution Order

### Parallel Opportunities

- T004, T005, T006 can run in parallel (different files)
