# Tasks: Sidebar Tag Filter Layout

**Input**: Design documents from `/specs/010-sidebar-layout/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Tests are included in accordance with the project constitution to verify the visual toggle, responsive sidebar drawer, tag grouping logic, and collection filtering.

**Organization**: Tasks are grouped by user story phases to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `src/web/` for frontend components, pages, and web tests.
- **Backend API**: `src/api/` and `src/tests/api/` for endpoints and integration tests.

---

## Constitution Alignment Tasks

- [x] T000 Review the constitution and extract feature-specific constraints
- [x] T001 Verify that Zod contracts are preserved as the single source of truth for tag types
- [x] T002 Update or add frontend/integration tests covering success paths, mobile overlay, layout toggle, and tag grouping
- [x] T003 Ensure all code remains written in English and complies with strict TypeScript rules

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Set up files and remove obsolete components.

- [x] T004 Delete the obsolete top horizontal filter bar file `src/web/components/FilterBar.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

*No database migrations or API endpoints changes are required for this feature, as it is a pure UI/layout refactoring. The foundation is ready.*

---

## Phase 3: User Story 1 - Toggleable left sidebar for tag filtering (Priority: P1) 🎯 MVP

**Goal**: Implement the sidebar layout on the main page, grouping tags by category, rendering the match mode selector, handling sidebar drawer overlay for mobile, and integrating the tag filtering triggers.

**Independent Test**: The user toggles the sidebar, sees tags grouped vertically under their category headers, toggles checks to filter the items collection on the right, and clicks "Manage Tags" to open the tag management page.

### Tests for User Story 1 (TDD Approach)

- [x] T005 [P] [US1] Create unit tests for `<Sidebar />` in `src/web/components/__tests__/Sidebar.test.tsx` verifying:
  - Sidebar toggling based on visibility props.
  - Tags grouping by `tagCategory` (alphabetical order) and tag names sorting.
  - Correct execution of the filter change callback on tag checkbox clicks.
  - Render of the match mode selector dropdown and callback triggers.
  - Correct callback trigger for the "Manage Tags" CRUD navigation link.

- [x] T006 [P] [US1] Update `src/web/pages/__tests__/CollectionPage.test.tsx` to test the new sidebar grid layout and handle the removal of `<FilterBar />` assertions.

### Implementation for User Story 1

- [x] T007 [P] [US1] Create the `<Sidebar />` component in `src/web/components/Sidebar.tsx` to render:
  - Header: title "Tags" and aligned Match Mode selector.
  - List: categories list sorted alphabetically with tags sorted inside.
  - Tag row: checkbox inputs with color styling indicators.
  - Footer: "Manage Tags" navigation link.

- [x] T008 [US1] Modify `src/web/pages/CollectionPage.tsx` to:
  - Implement CSS Grid layout structure to hold the sidebar on the left and collection list on the right.
  - Create state `isSidebarOpen` initialized to open on desktop (`window.innerWidth > 768`) and closed on mobile.
  - Mount `<Sidebar />` passing all available tags, filters, toggle state callbacks, and navigations.
  - Bind mobile overlay backdrop behaviors to dismiss the sidebar on clicking outside.

- [x] T009 [US1] Add responsive and animation styles for the sidebar panel in `src/web/index.css` covering:
  - Smooth visual transitions (transitioning max-width/width and opacity).
  - Fixed mobile drawer styles with dark semi-transparent backdrops (`@media (max-width: 768px)`).
  - Layout Grid adjustments for desktop viewports.

**Checkpoint**: At this point, the Sidebar Tag Filter Layout is fully functional, styled, and passing all tests.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Verify the quality, run standard checks, and update documentation.

- [x] T010 Run local test suite to verify all 72+ tests pass cleanly using `npm run test`
- [x] T011 Run production check and validation script using `npm run check`
- [x] T012 Run quickstart validation scenarios defined in `quickstart.md` manually

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Skipped as no foundation changes are required.
- **User Story 1 (Phase 3)**: Depends on Setup completion.
- **Polish (Phase 4)**: Depends on User Story 1 being fully complete and verified.

### Within User Story 1
- Write tests first and verify they fail before implementing.
- Create `<Sidebar />` component first.
- Integrate it within `CollectionPage.tsx` layout.
- Apply CSS transition/responsive styles in `index.css`.
- Run validations.

### Parallel Opportunities
- T005 and T006 (Test files) can be created/updated in parallel.
- CSS styling (T009) can be designed in parallel with component rendering (T007).

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Delete `FilterBar.tsx` (T004).
2. Write tests for the new components (T005, T006).
3. Create `Sidebar.tsx` and integrate it into `CollectionPage.tsx` layout (T007, T008).
4. Apply CSS styles and transitions (T009).
5. Verify tests and complete polish tasks (T010, T011, T012).
