# Implementation Plan: Tag Match Mode Segmented Toggle

**Branch**: `013-new-fined-selector` | **Date**: 2026-08-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/013-new-fined-selector/spec.md`

## Summary

Replace the native `<select>` dropdown for tag match mode in the sidebar header with a segmented toggle component (`TagMatchToggle`) visually identical to `ThemeToggle`. The toggle contains two buttons — 'OR' (match any) and 'AND' (match all) — with primary-color highlighting on the active option. This is a purely presentational refactor; no data model, API, or contract changes are required.

## Technical Context

**Language/Version**: TypeScript 5.7, React 19, Node.js (ESM)

**Primary Dependencies**: React 19, Vite, Vitest, @testing-library/react

**Storage**: N/A (client-side UI state only; `tagFilterMode` persisted in `sessionStorage` via `useCollectionFilters`)

**Testing**: Vitest + @testing-library/react + jsdom

**Target Platform**: Web browser (desktop and mobile viewports)

**Project Type**: Web application (monorepo: `src/web` frontend, `src/api` backend, `packages/contracts` shared types)

**Performance Goals**: N/A (trivial UI toggle — no measurable performance impact)

**Constraints**: Must visually match existing `.theme-toggle` CSS design tokens

**Scale/Scope**: Single component addition + Sidebar component modification + CSS addition + test updates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ Ownership and private-data boundaries MUST be preserved for every feature. → No data access changes. Purely client-side presentational refactor.
- ✅ Shared contracts MUST be updated before API or UI changes that alter request or response shapes. → No request/response shape changes. `tagFilterMode` type (`'all' | 'any'`) remains unchanged in `CollectionFilters`.
- ✅ Tests MUST cover success, validation failures, ownership boundaries, and critical flows. → New `TagMatchToggle` component test + updated `Sidebar` test covering toggle interaction.
- ✅ Security-sensitive changes MUST avoid secrets, preserve explicit user actions, and keep destructive operations guarded. → No security surface. Toggle is a non-destructive UI filter control.

**Gate result**: PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/013-new-fined-selector/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/web/
├── components/
│   ├── TagMatchToggle.tsx          # [NEW] Segmented toggle component
│   ├── Sidebar.tsx                 # [MODIFY] Replace match-mode-selector with TagMatchToggle
│   ├── ThemeToggle.tsx             # [REFERENCE] Visual design reference
│   └── __tests__/
│       ├── TagMatchToggle.test.tsx  # [NEW] Unit tests for TagMatchToggle
│       └── Sidebar.test.tsx        # [MODIFY] Update match mode interaction tests
├── index.css                       # [MODIFY] Add .tag-match-toggle styles, remove .match-mode-selector
└── hooks/
    └── useCollectionFilters.ts     # [NO CHANGE] tagFilterMode type unchanged
```

**Structure Decision**: Frontend-only change within `src/web/`. No backend, API, or contract modifications needed. New component follows the existing flat component directory pattern.

## Complexity Tracking

No constitution violations — table not applicable.
