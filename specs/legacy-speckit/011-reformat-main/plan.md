# Implementation Plan: Boxed Application Shell & Layout Reformat

**Branch**: `011-reformat-main` | **Date**: 2026-08-01 | **Spec**: [spec.md](file:///home/alosadad/Conjuros/specs/011-reformat-main/spec.md)

**Input**: Feature specification from `/specs/011-reformat-main/spec.md`

## Summary

Reformat the web application layout back to a centered, boxed application shell (`.app-shell`) with desktop max-width (1440px), centered alignment (`margin: 0 auto`), and mobile viewport padding (`<= 650px`). Ensure the collapsible search/tags sidebar operates in-flow using CSS flex/grid layout with a 200ms smooth transition, preserving grid alignment and preventing item displacement in the main collection frame.

## Technical Context

**Language/Version**: TypeScript 5+, HTML5, CSS3

**Primary Dependencies**: React 18, Vite, Vanilla CSS (`src/web/index.css`)

**Storage**: N/A (Frontend layout refactoring)

**Testing**: Vitest (`npm test`)

**Target Platform**: Desktop & Mobile Web Browsers (Chrome, Firefox, Safari)

**Project Type**: Web Application

**Performance Goals**: 60 fps smooth CSS layout transitions (200ms ease) without layout shift or reflow lag

**Constraints**: Mobile breakpoint at `<= 650px` (`width: min(100% - 1rem, 1120px)`); Desktop container max-width bounded at `1440px` (within 1400–1600px range)

**Scale/Scope**: Layout shell (`src/web/index.css`, `src/web/pages/CollectionPage.tsx`, `src/web/pages/TagsPage.tsx`, `src/web/App.tsx`)

## Constitution Check

*GATE: Passed. All core principles preserved.*

- **Ownership Boundaries**: Preserved (UI layout changes do not alter ownership verification or cross-user boundaries).
- **Contract-First Architecture**: Preserved (UI layout contracts documented; no API contract modifications required).
- **Test-First Quality & Verification**: Preserved (Vitest UI tests and manual validation scenarios defined in quickstart guide).
- **Security & Safe Actions**: Preserved (no secrets or sensitive material exposed).

## Project Structure

### Documentation (this feature)

```text
specs/011-reformat-main/
├── plan.md              # Implementation plan (this file)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
    └── ui-layout-contract.md
```

### Source Code (repository root)

```text
src/
├── api/                 # Express backend API & controllers
├── web/                 # React frontend application
│   ├── components/      # UI components (sidebar, cards, dialogs)
│   ├── pages/           # Page layouts (CollectionPage, TagsPage)
│   ├── App.tsx          # Main application wrapper
│   └── index.css        # Core styling & app-shell layout rules
└── tests/               # Backend & contract tests

packages/
└── contracts/           # Shared Zod schemas & contract types
```

**Structure Decision**: Single Monorepo with `src/web` for frontend application and `src/api` for Express backend API. Layout changes are isolated to `src/web/index.css` and associated page wrappers in `src/web/pages/`.

## Complexity Tracking

*No constitution violations present. No extra complexity added.*
