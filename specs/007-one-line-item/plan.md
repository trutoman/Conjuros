# Implementation Plan: Top-Row Item Text Placement

**Branch**: `007-one-line-item` | **Date**: 2026-08-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/007-one-line-item/spec.md`

## Summary

Rearrange item-card layout so item content text moves to the top row between title and tags, keep row elements vertically centered, and apply width compression rules where the content-text area shrinks first down to approximately 2 rem. If further compression is required, collapse tags into a +N indicator while keeping title and actions visible. Hidden tags are discoverable on pointer hover and keyboard focus, and intentionally not revealed on touch-only collapsed rows.

## Technical Context

**Language/Version**: TypeScript 5.7 (monorepo, Node.js 20-compatible tooling)

**Primary Dependencies**: React 19, Vite 6, TanStack Query 5, Express 4, MongoDB driver 6, Zod 3, Vitest 3, Testing Library

**Storage**: No storage schema changes; existing MongoDB persistence and contracts remain authoritative

**Testing**: Vitest + Testing Library component/page tests, plus targeted API regression checks already in the suite

**Target Platform**: Authenticated browser UI (desktop and mobile responsive)

**Project Type**: TypeScript monorepo web application with shared contracts in `packages/contracts`

**Performance Goals**: Maintain responsive row rendering and interaction without introducing visible lag in typical list sizes (up to ~200 items on collection page)

**Constraints**: Preserve ownership/security behavior, keep explicit user actions for link opening, avoid backend business-rule changes, and avoid adding new UI libraries for this layout update

**Scale/Scope**: Frontend layout and interaction behavior centered on item-card rendering in collection list; no new endpoints

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Ownership and private-data boundaries MUST be preserved for every feature.
- Shared contracts MUST be updated before API or UI changes that alter request or response shapes.
- Tests MUST cover success, validation failures, ownership boundaries, and critical flows.
- Security-sensitive changes MUST avoid secrets, preserve explicit user actions, and keep destructive operations guarded.

Initial gate assessment:

- Ownership and private-data boundaries: **Pass**. Feature is a presentation/layout change and keeps existing user-scoped service calls.
- Shared contracts first: **Pass**. No request/response shape changes are required; existing contracts remain source of truth.
- Test-first quality: **Pass**. Plan includes focused tests for top-row placement, overflow behavior, and interaction parity.
- Security and safe actions: **Pass**. Link opening remains explicit and no sensitive-data handling changes are introduced.

## Project Structure

### Documentation (this feature)

```text
specs/007-one-line-item/
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
│   │   ├── ItemCard.tsx
│   │   ├── CollectionList.tsx
│   │   └── __tests__/
│   │       └── ItemCard.test.tsx
│   ├── pages/
│   │   ├── CollectionPage.tsx
│   │   └── __tests__/
│   └── index.css
├── api/
│   └── services/
└── tests/
    ├── integration/
    └── api/

packages/
└── contracts/
    └── src/
        └── items.ts
```

**Structure Decision**: Keep the existing monorepo structure and implement this feature in the web layer (`src/web/components`, `src/web/index.css`, and related tests). API and contracts are reused as-is unless implementation reveals shape mismatches.

## Constitution Check (Post-Design)

- Ownership and private-data boundaries: **Pass**. No ownership logic is moved or weakened; existing service/API guardrails remain in effect.
- Contract-first architecture: **Pass**. Design introduces no new external contract shapes; existing contract definitions remain authoritative.
- Test-first quality and verification: **Pass**. Design requires tests for layout placement, overflow/collapse behavior, keyboard discoverability, and preserved copy/open semantics.
- Security and safe user actions: **Pass**. Explicit open action is preserved; no secret handling or destructive flow changes.
- Focused product experience: **Pass**. The design prioritizes fast scanning and quick actions while minimizing layout churn.

## Complexity Tracking

No constitution violations identified for this feature.

## Validation Results

- Focused regression run:
  - Command: `npm run test -- src/web/components/__tests__/itemCardOverflow.test.ts src/web/components/__tests__/ItemCard.test.tsx src/web/pages/__tests__/CollectionPage.test.tsx src/tests/api/items.test.ts src/tests/api/reorder.test.ts`
  - Result: pass

- Full quality gate:
  - Command: `npm run check`
  - Result: pass (lint, tests, and build)
