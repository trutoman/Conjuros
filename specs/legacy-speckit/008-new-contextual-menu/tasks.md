# Tasks: Item Card Contextual Menu

**Input**: Design documents from `/specs/008-new-contextual-menu/`

**Prerequisites**: [plan.md](plan.md) ✅ | [spec.md](spec.md) ✅ | [research.md](research.md) ✅ | [data-model.md](data-model.md) ✅ | [contracts/item-card-menu-ui.md](contracts/item-card-menu-ui.md) ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no unmet dependencies)
- **[Story]**: User story this task belongs to (US1–US4)
- Exact file paths are included in every task description

---

## Phase 1: Setup — CSS Foundation

**Purpose**: Add the new CSS classes that the component will reference. No component changes yet.

- [x] T001 Add `.item-menu-wrapper { position: relative }` and `.item-menu-dropdown` positioning/styling classes to `src/web/index.css`

---

## Phase 2: Foundational — State and Refs

**Purpose**: Extend `ItemCard` with the new local state and refs needed by every subsequent phase. No visual change yet.

**⚠️ Must be complete before Phase 3.**

- [x] T002 Add `isMenuOpen: boolean`, `menuView: 'menu' | 'confirm'` state and `menuRef: useRef<HTMLDivElement>`, `triggerRef: useRef<HTMLButtonElement>` refs to `src/web/components/ItemCard.tsx`

**Checkpoint**: State and refs exist — US implementation can begin.

---

## Phase 3: User Story 1 — Menu Trigger and Dropdown (Priority: P1) 🎯 MVP

**Goal**: Replace the 3-button layout with 2 buttons; clicking the three-dot trigger opens the dropdown with Edit and Delete.

**Independent Test**: Render a spell card and a web-link card — each shows exactly 2 buttons in `item-actions`; clicking the trigger opens a dropdown containing Edit and Delete.

- [x] T003 [US1] Remove inline Edit and Delete buttons from `item-actions`; wrap the menu trigger in `.item-menu-wrapper`; add the trigger button (three-dot icon, `aria-label="Item menu"`, `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`, `ref={triggerRef}`) to `src/web/components/ItemCard.tsx`
- [x] T004 [US1] Render `.item-menu-dropdown` (`role="menu"`, `id="item-menu-{item._id}"`, `ref={menuRef}`) with Edit (`role="menuitem"`) and Delete (`role="menuitem"`) buttons when `isMenuOpen && menuView === 'menu'` in `src/web/components/ItemCard.tsx`
- [x] T005 [P] [US1] Update `src/web/components/__tests__/ItemCard.test.tsx`: remove stale `action-secondary` assertions for Edit/Delete; add tests — 2-button layout for spell and web-link, clicking trigger sets `aria-expanded="true"` and renders the dropdown with Edit and Delete
- [x] T006 [P] [US1] Update `src/web/pages/__tests__/CollectionPage.test.tsx`: fix `actionButtons[1]` / `actionButtons[2]` index and `action-secondary` class assertions to reflect the new 2-button layout

**Checkpoint**: User Story 1 is independently testable — 2-button layout renders correctly.

---

## Phase 4: User Story 2 — Menu Dismissal (Priority: P1)

**Goal**: The menu closes when the user clicks outside it, presses Escape, or opens a different card's menu.

**Independent Test**: Open the dropdown → click outside → dropdown gone. Open → press Escape → dropdown gone. Open card A's menu → click card B's trigger → A closes, B opens.

- [x] T007 [US2] Add `useEffect` that attaches a `document pointerdown` listener when `isMenuOpen` is `true`; on outside click (target not inside `menuRef.current`), set `isMenuOpen = false` and reset `menuView = 'menu'`; clean up listener on unmount or when menu closes in `src/web/components/ItemCard.tsx`
- [x] T008 [US2] Add `onKeyDown` handler on the dropdown container: `Escape` closes the menu and resets `menuView`; prevent default to stop browser behaviour in `src/web/components/ItemCard.tsx`
- [x] T009 [P] [US2] Add unit tests to `src/web/components/__tests__/ItemCard.test.tsx`: click outside closes menu, Escape closes menu, opening a second menu (simulated) leaves only one open at a time

**Checkpoint**: User Story 2 independently testable — all dismissal paths verified.

---

## Phase 5: User Story 3 — Edit and Delete Actions with Confirmation (Priority: P2)

**Goal**: Edit calls `onEdit` and closes the menu. Delete transitions to the inline confirmation view; Confirm calls `onDelete`; Cancel closes without calling it.

**Independent Test**: Open menu → click Edit → `onEdit` called, menu closed. Open menu → click Delete → confirmation view shown. Click Confirm → `onDelete` called. Reopen → Delete → Cancel → `onDelete` NOT called.

- [x] T010 [US3] Wire the Edit `menuitem` button: on click call `onEdit(item)`, set `isMenuOpen = false`, reset `menuView = 'menu'` in `src/web/components/ItemCard.tsx`
- [x] T011 [US3] Wire the Delete `menuitem` button: on click set `menuView = 'confirm'` (do NOT call `onDelete`) in `src/web/components/ItemCard.tsx`
- [x] T012 [US3] Render the confirm view when `isMenuOpen && menuView === 'confirm'`: Confirm button (calls `onDelete(item)`, closes menu) and Cancel button (closes menu only); both `role="menuitem"` in `src/web/components/ItemCard.tsx`
- [x] T013 [P] [US3] Add unit tests to `src/web/components/__tests__/ItemCard.test.tsx`: Edit calls `onEdit` and closes menu; Delete renders confirm view; Confirm calls `onDelete` and closes; Cancel closes without calling `onDelete`

**Checkpoint**: User Story 3 independently testable — full action and confirmation flow verified.

---

## Phase 6: User Story 4 — Keyboard Navigation and Focus Management (Priority: P2)

**Goal**: Menu is fully operable by keyboard — Enter/Space opens, ArrowDown/Up navigate, Enter activates, Escape closes with focus return.

**Independent Test**: Tab to trigger → Enter → focus on first menuitem → ArrowDown → focus on second → Enter → action fires. Escape → focus returns to trigger.

- [x] T014 [US4] On menu open (`isMenuOpen` becomes `true`), programmatically focus the first `menuitem` via `menuRef`; on menu close, return focus to `triggerRef.current` in `src/web/components/ItemCard.tsx`
- [x] T015 [US4] Add `onKeyDown` to the dropdown: `ArrowDown` moves focus to next `menuitem` (wraps); `ArrowUp` moves focus to previous `menuitem` (wraps); `Tab` while inside the dropdown closes the menu and lets focus move naturally in `src/web/components/ItemCard.tsx`
- [x] T016 [P] [US4] Add unit tests to `src/web/components/__tests__/ItemCard.test.tsx`: Enter/Space on trigger opens menu with first item focused; ArrowDown/Up cycle focus; Enter on a menuitem activates it; Escape returns focus to trigger

**Checkpoint**: User Story 4 independently testable — keyboard-only flow fully covered.

---

## Final Phase: Polish and Verification

- [x] T017 [P] Run `npm run check` from repo root; fix any TypeScript type errors or lint failures introduced by the feature
- [x] T018 Verify all scenarios in [quickstart.md](quickstart.md) pass: 2-button layout, open/close, Edit, Delete confirmation, keyboard navigation, one-menu-at-a-time

---

## Dependencies

```
T001 → T002 → T003 → T004
                T003 → T005 (parallel with T004)
                T003 → T006 (parallel with T004, T005)
       T004 → T007 → T008
                T007 → T009 (parallel with T008)
       T004 → T010 → T011 → T012
                        T012 → T013 (parallel with T012)
       T004 → T014 → T015
                T014 → T016 (parallel with T015)
T017 ← all implementation tasks
T018 ← T017
```

## Parallel Execution Examples

**Phase 3 start** (after T003): T004, T005, T006 can proceed simultaneously in 3 tracks.

**Phase 4 start** (after T004): T007 and T008 touch `ItemCard.tsx` in independent `useEffect`/`onKeyDown` sections; T009 (tests) can proceed in parallel on a separate track.

**Phase 5 start** (after T004): T010 → T011 → T012 are sequential within `ItemCard.tsx`; T013 (tests) runs in parallel on a separate track.

**Phase 6 start** (after T004): T014 → T015 are sequential within `ItemCard.tsx`; T016 (tests) runs in parallel.

---

## Implementation Strategy

**MVP scope** (minimum visible value): **Phase 1 + Phase 2 + Phase 3** — gives the user the new 2-button layout with a working dropdown. US2 (dismissal) should be added immediately after as it is also P1.

**Incremental delivery**:

1. P1 core: Phases 1–4 (layout + open/close) — fully testable standalone
2. P2 actions: Phase 5 — adds Edit/Delete with confirmation
3. P2 accessibility: Phase 6 — completes keyboard contract
4. Finalise: Phase 7 (check + quickstart validation)

---

## Task Count Summary

| Phase        | Story    | Tasks  |
| ------------ | -------- | ------ |
| Setup        | —        | 1      |
| Foundational | —        | 1      |
| Phase 3      | US1 (P1) | 4      |
| Phase 4      | US2 (P1) | 3      |
| Phase 5      | US3 (P2) | 4      |
| Phase 6      | US4 (P2) | 3      |
| Polish       | —        | 2      |
| **Total**    |          | **18** |

**Parallel opportunities identified**: 6 tasks carry `[P]` — T005, T006, T009, T013, T016, T017.
