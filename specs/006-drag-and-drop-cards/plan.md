# Implementation Plan: Drag-and-Drop Card Reordering

**Branch**: `006-drag-and-drop-cards` | **Date**: 2026-07-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-drag-and-drop-cards/spec.md`

## Summary

Replace arrow-based item-card reordering with drag-and-drop in the collection list, keep persistence through the existing reorder API call, and add keyboard reordering with `Alt+ArrowUp` and `Alt+ArrowDown` on the focused card. The implementation remains in the existing React and CSS web layer, removes the old `ReorderHandle` interaction path from item rows, and validates behavior with targeted component and page tests.

## Technical Context

**Language/Version**: TypeScript 5.7 on Node.js 20-compatible runtime

**Primary Dependencies**: React 19, Vite 6, TanStack Query 5, Express 4, MongoDB Node.js driver 6, Vitest 3

**Storage**: No new persistence store; continue using existing collection item ordering persisted by current API reorder endpoint

**Testing**: Vitest with Testing Library component/page tests under `src/web/components/__tests__` and `src/web/pages/__tests__`

**Target Platform**: Authenticated browser-based web UI

**Project Type**: TypeScript monorepo web application with shared contracts in `packages/contracts`

**Performance Goals**: Reorder interactions should remain immediate for normal collection sizes (typical lists under 200 items)

**Constraints**: Remove up/down arrows entirely, preserve ownership boundaries, avoid new backend business logic, keep explicit user-triggered actions, and provide keyboard reordering with `Alt+ArrowUp`/`Alt+ArrowDown`

**Scale/Scope**: UI behavior update centered on collection item list ordering interactions, associated styling, and focused test coverage

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Ownership and private-data boundaries MUST be preserved for every feature.
- Shared contracts MUST be updated before API or UI changes that alter request or response shapes.
- Tests MUST cover success, validation failures, ownership boundaries, and critical flows.
- Security-sensitive changes MUST avoid secrets, preserve explicit user actions, and keep destructive operations guarded.

Initial gate assessment:

- Ownership and private-data boundaries: **Pass**. Reordering continues to use user-scoped APIs and does not introduce cross-user data paths.
- Shared contracts first: **Pass**. Request and response shapes for reorder remain unchanged.
- Test-first quality: **Pass**. Plan includes tests for drag/drop reorder, keyboard reorder, no-op drops, and error handling.
- Security and safe actions: **Pass**. No secrets or unsafe automation introduced; all reorder actions are explicit user interactions.

## Project Structure

### Documentation (this feature)

```text
specs/006-drag-and-drop-cards/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── web/
│   ├── components/
│   │   ├── CollectionList.tsx
│   │   ├── ItemCard.tsx
│   │   ├── ReorderHandle.tsx
│   │   └── __tests__/
│   │       ├── CollectionList.test.tsx
│   │       └── ItemCard.test.tsx
│   ├── pages/
│   │   ├── CollectionPage.tsx
│   │   └── __tests__/
│   │       └── CollectionPage.test.tsx
│   └── index.css
└── tests/
    └── api/
```

**Structure Decision**: Keep the existing monorepo and implement the feature exclusively in the web UI layer. The API reorder contract already exists, so no backend module expansion or contract shape changes are needed.

## Constitution Check (Post-Design)

- Ownership and private-data boundaries: **Pass**. The design reuses existing authenticated reorder APIs and keeps user scoping unchanged.
- Contract-first architecture: **Pass**. No change to shared contracts is required for this interaction-only redesign.
- Test-first quality and verification: **Pass**. Design includes component/page tests for drag/drop and keyboard reorder behavior, including failure feedback.
- Security and safe user actions: **Pass**. Reordering is explicit and user-initiated, and no destructive semantics were added.
- Focused product experience: **Pass**. The feature removes obsolete arrow controls and replaces them with direct ordering interactions without unnecessary libraries or decorative behavior.

## Complexity Tracking

No constitution violations require special justification for this feature.
