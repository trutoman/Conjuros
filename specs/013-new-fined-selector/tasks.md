# Tasks: Tag Match Mode Segmented Toggle

**Input**: Design documents from `specs/013-new-fined-selector/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Constitution Alignment Tasks

- [x] T000 Verify no shared contracts changes needed — `tagFilterMode` type (`'all' | 'any'`) in `CollectionFilters` and `CollectionQuery` remains unchanged
- [x] T001 Confirm no ownership or authorization boundaries are affected — purely presentational client-side refactor

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No project initialization needed — existing codebase, existing dependencies. Phase is empty.

**Checkpoint**: Project already set up — proceed to foundational work.

---

## Phase 2: Foundational (CSS Styles)

**Purpose**: Add the `.tag-match-toggle` CSS rules and remove the obsolete `.match-mode-selector` rules. This MUST be complete before any component work since the new component depends on these styles.

**⚠️ CRITICAL**: Component rendering depends on these styles being available.

- [x] T002 Add `.tag-match-toggle` CSS rules (container, button, active state, hover) mirroring `.theme-toggle` styles in `src/web/index.css`
- [x] T003 Remove obsolete `.match-mode-selector` and `.match-mode-selector select` CSS rules from `src/web/index.css`

**Checkpoint**: CSS foundation ready — component implementation can begin.

---

## Phase 3: User Story 1 — Quick Visual Toggle for Tag Matching Mode (Priority: P1) 🎯 MVP

**Goal**: Replace the legacy `<span>Match</span>` label and `<select>` dropdown in the sidebar header with a segmented toggle containing 'OR' and 'AND' buttons that update `tagFilterMode` on click.

**Independent Test**: Open the tags sidebar, verify 'OR'/'AND' toggle replaces the dropdown. Click each button and confirm the active state changes and the collection list re-filters.

### Tests for User Story 1

- [x] T004 [P] [US1] Create unit test for `TagMatchToggle` component verifying rendering, active state for `mode='any'` and `mode='all'`, and click handler callbacks in `src/web/components/__tests__/TagMatchToggle.test.tsx`
- [x] T005 [P] [US1] Update `Sidebar` test to replace `fireEvent.change(screen.getByLabelText('Match'), ...)` with button click on 'Match any tag' button, and verify `onChange` is called with `tagFilterMode: 'any'` in `src/web/components/__tests__/Sidebar.test.tsx`

### Implementation for User Story 1

- [x] T006 [US1] Create `TagMatchToggle` component with `mode` and `onChange` props, rendering two buttons ('OR' mapped to `'any'`, 'AND' mapped to `'all'`) with `aria-pressed` active state and primary-color highlight in `src/web/components/TagMatchToggle.tsx`
- [x] T007 [US1] Replace the `<label className="match-mode-selector">` block in `Sidebar.tsx` with `<TagMatchToggle mode={filters.tagFilterMode} onChange={...} />` that calls `onChange({...filters, tagFilterMode: mode})` in `src/web/components/Sidebar.tsx`
- [x] T008 [US1] Remove the unused `match-mode-selector` import/JSX from `Sidebar.tsx` and verify the `<span>Match</span>` and `<select>` elements are fully removed from `src/web/components/Sidebar.tsx`

**Checkpoint**: User Story 1 complete — 'OR'/'AND' toggle renders in sidebar header, switches `tagFilterMode`, and collection list re-filters. Tests pass.

---

## Phase 4: User Story 2 — Accessible Segmented Control (Priority: P2)

**Goal**: Ensure the tag match toggle is fully accessible with proper ARIA group semantics, button labels, and keyboard operability.

**Independent Test**: Navigate to the toggle using keyboard Tab + Enter/Space. Verify `role="group"`, `aria-label="Tag match mode"`, and each button has `aria-label` and `aria-pressed`.

### Tests for User Story 2

- [x] T009 [US2] Add test assertions to `TagMatchToggle.test.tsx` verifying `role="group"` container, `aria-label="Tag match mode"`, and button `aria-label` values ("Match any tag", "Match all tags") with dynamic `aria-pressed` in `src/web/components/__tests__/TagMatchToggle.test.tsx`

### Implementation for User Story 2

- [x] T010 [US2] Add `role="group"` and `aria-label="Tag match mode"` to the `TagMatchToggle` container div, and add `aria-label="Match any tag"` to the OR button and `aria-label="Match all tags"` to the AND button in `src/web/components/TagMatchToggle.tsx`

**Checkpoint**: User Story 2 complete — toggle is accessible via keyboard, ARIA attributes are correct, screen readers announce state. Tests pass.

---

## Phase 5: User Story 3 — Consistent Visual Design (Priority: P3)

**Goal**: Verify the tag match toggle is visually identical to the theme toggle — same border radius, padding, button sizing, active highlight color, and hover behavior.

**Independent Test**: Compare the tag match toggle and theme toggle side by side — they should be visually indistinguishable in style.

### Implementation for User Story 3

- [x] T011 [US3] Verify `.tag-match-toggle` CSS properties match `.theme-toggle` exactly: `display: inline-flex`, `border: 1px solid var(--border)`, `border-radius: 0.85rem`, `overflow: hidden`, `background: var(--surface)`, button padding `0.55rem 0.8rem`, active state `background: var(--primary); color: #fff`, hover `transform: none` in `src/web/index.css`

**Checkpoint**: User Story 3 complete — both toggles are visually consistent.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup across all user stories.

- [x] T012 Run `npm run check` (lint + test + build) and verify zero errors
- [x] T013 Run quickstart.md manual validation scenarios (toggle rendering, mode switching, accessibility, legacy element removal)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — existing project
- **Foundational (Phase 2)**: No dependencies — can start immediately
- **User Story 1 (Phase 3)**: Depends on Phase 2 (CSS styles must exist)
- **User Story 2 (Phase 4)**: Depends on Phase 3 (component must exist to add ARIA attributes)
- **User Story 3 (Phase 5)**: Depends on Phase 2 (CSS verification)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (Phase 2) — no dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 (P1) — ARIA attributes are added to the component created in US1
- **User Story 3 (P3)**: Independent of US1/US2 — CSS verification only, but should run after US1 for visual validation

### Within Each User Story

- Tests written first, expected to fail before implementation
- Component creation before integration into Sidebar
- Core implementation before cleanup

### Parallel Opportunities

- T002 and T003 (CSS changes) can run sequentially in one edit since they target the same file
- T004 and T005 (tests) can run in parallel (different test files)
- T009 extends the same test file as T004 — must run after T004

---

## Parallel Example: User Story 1

```bash
# Launch tests in parallel (different files):
Task: "Create TagMatchToggle unit test in src/web/components/__tests__/TagMatchToggle.test.tsx"
Task: "Update Sidebar test in src/web/components/__tests__/Sidebar.test.tsx"

# Then implement sequentially (same component, then integration):
Task: "Create TagMatchToggle component in src/web/components/TagMatchToggle.tsx"
Task: "Integrate TagMatchToggle into Sidebar.tsx"
Task: "Remove legacy match-mode-selector from Sidebar.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational CSS
2. Complete Phase 3: User Story 1 (toggle component + Sidebar integration + tests)
3. **STOP and VALIDATE**: Verify toggle works, tests pass, legacy dropdown removed
4. Run `npm run check`

### Incremental Delivery

1. Phase 2 (CSS) → Foundation ready
2. Phase 3 (US1: Toggle + Sidebar) → Test independently → MVP complete
3. Phase 4 (US2: Accessibility) → Test ARIA attributes → Accessible
4. Phase 5 (US3: Visual consistency) → Verify side by side → Polished
5. Phase 6 (Polish) → Full validation → Done

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US2 depends on US1 because ARIA attributes are added to the component US1 creates; in practice, US1 implementation should include basic ARIA from the start — US2 tasks ensure explicit test coverage
- Commit after each phase checkpoint
- Total: 14 tasks (T000–T013)
