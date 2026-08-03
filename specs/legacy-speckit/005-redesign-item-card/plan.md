# Implementation Plan: Redesigned Item Card Layout

**Branch**: `005-redesign-item-card` | **Date**: 2026-07-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-redesign-item-card/spec.md`

## Summary

Refine the existing collection card UI so each item uses a compact two-row layout with an item-type icon, title, tags, and a right-aligned action cluster. The work will stay in the current React and CSS implementation, introduce the missing visual assets and theme toggle icons, and cover the updated behavior with component and page tests.

## Technical Context

**Language/Version**: TypeScript 5.7 on Node.js 20-compatible runtime

**Primary Dependencies**: React 19, Vite 6, Zod 3, TanStack Query 5, Vitest 3, Express 4, MongoDB Node.js driver 6

**Storage**: No new persistence is required; existing collection and tag data remain in the current MongoDB-backed API layer

**Testing**: Vitest for unit and component tests, plus existing API and page-level tests under `src/tests` and `src/web`

**Target Platform**: Web application for authenticated users in the existing browser UI

**Project Type**: TypeScript monorepo web application with shared contracts in `packages/contracts`

**Performance Goals**: Rendering and interaction updates for the collection view remain immediate for typical lists of fewer than 200 items

**Constraints**: Must preserve current ownership checks and explicit user actions; no new backend business rules are introduced

**Scale/Scope**: One UI component refresh for item cards, related styling, and targeted tests for card layout and theme/action behavior

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Ownership and private-data boundaries MUST be preserved for every feature.
- Shared contracts MUST be updated before API or UI changes that alter request or response shapes.
- Tests MUST cover success, validation failures, ownership boundaries, and critical flows.
- Security-sensitive changes MUST avoid secrets, preserve explicit user actions, and keep destructive operations guarded.

Initial gate assessment:

- Ownership and private-data boundaries: **Pass**. The feature only changes presentation and interactions in the collection UI and does not alter item ownership or authorization behavior.
- Shared contracts first: **Pass**. No new API contracts are required for this UI-only change.
- Test-first quality: **Pass**. The plan includes frontend regression tests for layout, action visibility, and theme behavior.
- Security and safe actions: **Pass**. Copy and link-opening actions remain explicit user-triggered behaviors and destructive actions remain guarded.

## Project Structure

### Documentation (this feature)

```text
specs/005-redesign-item-card/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
packages/
└── contracts/
    └── src/
        └── index.ts

src/
├── api/
│   └── ...
├── web/
│   ├── components/
│   │   ├── CollectionList.tsx
│   │   ├── ItemCard.tsx
│   │   ├── ReorderHandle.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── __tests__/
│   ├── hooks/
│   │   └── useThemePreference.ts
│   ├── pages/
│   │   └── CollectionPage.tsx
│   └── index.css
└── tests/
    └── api/
```

**Structure Decision**: Keep the current monorepo structure and implement the feature entirely in the existing web UI layer. No new backend modules or shared contracts are needed because the change is presentation-only.

## Constitution Check (Post-Design)

- Ownership and private-data boundaries: **Pass**. The design does not introduce any new data access path or change authorization rules.
- Contract-first architecture: **Pass**. The feature stays within the existing public contracts and does not require API contract changes.
- Test-first quality and verification: **Pass**. The design calls for component and page coverage for the new card layout and theme/action behaviors.
- Security and safe user actions: **Pass**. The design keeps copy and opening actions explicit and preserves confirmation behavior for destructive actions.
- Focused product experience: **Pass**. The UI work remains scoped to card layout, tag presentation, and action visibility without adding unnecessary libraries or decorative motion.

## Complexity Tracking

No constitution violations require special justification for this feature.
