# Tasks: Item Collection UI Refresh

**Input**: Design documents from `/specs/004-mejora-ui/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/theme-preference.md](contracts/theme-preference.md), [quickstart.md](quickstart.md)

**Tests**: Tests are required by the spec for theme persistence, item actions, tag color visibility, keyboard usability, and interaction feedback.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the shared contract and UI scaffolding needed by the refresh.

- [X] T001 [P] Add authenticated user theme preference types to shared auth contracts in `packages/contracts/src/auth.ts` and export them from `packages/contracts/src/index.ts`
- [X] T002 [P] Scaffold the theme preference hook in `src/web/hooks/useThemePreference.ts`
- [X] T003 [P] Scaffold the theme toggle component in `src/web/components/ThemeToggle.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the user theme persistence and app-wide theming foundations that every story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Implement authenticated user theme preference storage on the users repository in `src/api/repositories/users.repository.ts`
- [X] T005 Implement theme preference read and update helpers in `src/api/services/auth.service.ts`
- [X] T006 Implement auth controller and route handlers for exposing and updating the authenticated user's theme in `src/api/controllers/auth.controller.ts` and `src/api/routes/auth.route.ts`
- [X] T007 Apply the selected theme to the authenticated app shell and base surfaces in `src/web/App.tsx` and `src/web/index.css`

**Checkpoint**: Theme preference can be persisted and read back, and the app shell can reflect the selected theme.

---

## Phase 3: User Story 1 - Use a consistent visual theme (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can switch between light and dark themes and keep the same choice across reloads and devices.

**Independent Test**: Change the theme as one authenticated user, reload the page, and sign in on another device or browser to confirm the same theme remains active.

### Tests for User Story 1

- [X] T008 [P] [US1] Add API tests for default theme, theme read and update, and cross-user isolation in `src/tests/api/auth.theme.test.ts`
- [X] T009 [P] [US1] Add UI tests for default theme rendering and persistence across reloads in `src/web/components/__tests__/ThemeToggle.test.tsx`

### Implementation for User Story 1

- [X] T010 [US1] Wire the theme preference hook into the authenticated collection shell in `src/web/App.tsx` and `src/web/pages/CollectionPage.tsx`
- [X] T011 [US1] Add a visible theme switcher to the collection header in `src/web/components/ThemeToggle.tsx` and `src/web/pages/CollectionPage.tsx`
- [X] T012 [US1] Update theme-aware card, button, and background styling in `src/web/index.css`

**Checkpoint**: Users can choose a theme, keep it across sessions, and see the collection surface respond consistently.

---

## Phase 4: User Story 2 - Recognize and act on collection items quickly (Priority: P1)

**Goal**: Users can immediately distinguish spells from web links and use clear copy, open, edit, and delete actions.

**Independent Test**: Open a spell and a web-link card, verify the command or URL is easy to read and copy, verify the link opens only after an explicit user action, and verify edit/delete stay visually de-emphasized until hover or focus.

### Tests for User Story 2

- [X] T013 [P] [US2] Add UI tests for spell and web-link card actions in `src/web/components/__tests__/ItemCard.test.tsx`
- [X] T014 [P] [US2] Add UI tests for hover and focus visibility of secondary actions in `src/web/pages/__tests__/CollectionPage.test.tsx`

### Implementation for User Story 2

- [X] T015 [US2] Refine the item card layout and action grouping in `src/web/components/ItemCard.tsx`
- [X] T016 [US2] De-emphasize edit and delete actions until hover or focus in `src/web/components/ItemCard.tsx` and `src/web/index.css`
- [X] T017 [US2] Ensure web links open only from the explicit open action in `src/web/components/ItemCard.tsx`

**Checkpoint**: Collection items are fast to scan and the primary actions are clear without adding visual noise.

---

## Phase 5: User Story 3 - Use colors to understand tags (Priority: P2)

**Goal**: Users can assign a color to each tag and see that color reflected in tag editing and item views.

**Independent Test**: Save a tag color, confirm the color swatch appears in edit mode, and confirm the same color is reflected in the tag text on item cards and tag lists.

### Tests for User Story 3

- [X] T018 [P] [US3] Add UI tests for tag color swatches in `src/web/components/__tests__/TagForm.test.tsx`
- [X] T019 [P] [US3] Add UI tests for colored tag text on collection items in `src/web/components/__tests__/ItemCard.test.tsx`

### Implementation for User Story 3

- [X] T020 [US3] Surface the selected tag color in the tag edit form in `src/web/components/TagForm.tsx`
- [X] T021 [US3] Render tag labels with their assigned color in `src/web/components/TagList.tsx` and `src/web/components/ItemCard.tsx`
- [X] T022 [US3] Update supporting tag styles for readable color chips in `src/web/index.css`

**Checkpoint**: Tag colors are visible at edit time and remain recognizable anywhere tags are displayed.

---

## Phase 6: User Story 4 - Receive immediate interaction feedback (Priority: P2)

**Goal**: Users get clear feedback when they copy values or use other collection actions, including on keyboard-only interaction paths.

**Independent Test**: Trigger copy success and failure scenarios, then navigate the cards and actions with the keyboard to confirm the active controls remain visible and usable.

### Tests for User Story 4

- [X] T023 [P] [US4] Add UI tests for copy success and failure feedback in `src/web/components/__tests__/ItemCard.test.tsx`
- [X] T024 [P] [US4] Add UI tests for keyboard focus visibility of collection actions in `src/web/pages/__tests__/CollectionPage.test.tsx`

### Implementation for User Story 4

- [X] T025 [US4] Refine card action feedback handling in `src/web/components/ItemCard.tsx`
- [X] T026 [US4] Add transient success and failure messaging plus focus-visible styling in `src/web/components/ItemCard.tsx` and `src/web/index.css`

**Checkpoint**: The interface gives fast, obvious feedback and stays usable without a mouse.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation updates and full validation across the refreshed collection experience.

- [X] T027 Update the feature quickstart and validation notes in `specs/004-mejora-ui/quickstart.md` and `specs/004-mejora-ui/checklists/requirements.md`
- [X] T028 Run the full validation suite and record any feature-specific follow-ups in `specs/004-mejora-ui/checklists/requirements.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
- **Polish (Final Phase)**: Depends on the desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on other stories after the foundational theme work is complete.
- **User Story 2 (P1)**: Can start after Foundational; it uses the existing item card surface but does not depend on tag color or feedback enhancements.
- **User Story 3 (P2)**: Can start after Foundational completion; it shares the item card and tag display surface but remains independently testable.
- **User Story 4 (P2)**: Can start after Foundational completion; it layers feedback onto the item card action surface and remains independently testable.

### Within Each User Story

- Tests (if included) MUST be written before implementation.
- Shared foundation work comes before UI polish.
- The story must be complete and independently verifiable before moving to the next priority.

### Parallel Opportunities

- T001, T002, and T003 can run in parallel.
- T008 and T009 can run in parallel.
- T013 and T014 can run in parallel.
- T018 and T019 can run in parallel.
- T023 and T024 can run in parallel.
- T027 can run in parallel with the final validation prep.

---

## Parallel Examples

### User Story 1

```text
Task: T008 [US1] API tests for default theme and persistence in `src/tests/api/auth.theme.test.ts`
Task: T009 [US1] UI tests for theme toggle persistence in `src/web/components/__tests__/ThemeToggle.test.tsx`
```

### User Story 2

```text
Task: T013 [US2] UI tests for copy/open item actions in `src/web/components/__tests__/ItemCard.test.tsx`
Task: T014 [US2] UI tests for hover and focus visibility in `src/web/components/__tests__/ItemCard.test.tsx`
```

### User Story 3

```text
Task: T018 [US3] UI tests for tag color swatches in `src/web/components/__tests__/TagForm.test.tsx`
Task: T019 [US3] UI tests for colored tag text in `src/web/components/__tests__/ItemCard.test.tsx`
```

### User Story 4

```text
Task: T023 [US4] UI tests for copy feedback in `src/web/components/__tests__/ItemCard.test.tsx`
Task: T024 [US4] UI tests for keyboard focus visibility in `src/web/components/__tests__/ItemCard.test.tsx`
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete User Story 1 tests and implementation.
3. Validate User Story 1 independently before expanding scope.

### Incremental Delivery

1. Deliver User Story 1 so the user can choose and keep a theme.
2. Deliver User Story 2 so item cards are easier to scan and act on.
3. Deliver User Story 3 so tag colors are visible and useful.
4. Deliver User Story 4 so actions give immediate feedback and remain keyboard-friendly.
5. Run the polish tasks and full validation.

### Parallel Team Strategy

1. One developer can handle the theme contract and persistence path.
2. One developer can refine item card presentation and action behavior.
3. One developer can handle tag color presentation and supporting tests.
4. One developer can finish the feedback and keyboard-accessibility polish.
