# Implementation Plan: Sidebar Collapse & Expand Mechanics

**Branch**: `016-sidebar-collapse` | **Date**: 2026-08-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/016-sidebar-collapse/spec.md`

## Summary

Implement sidebar width reduction (collapse/expand mechanics) for the tags sidebar panel. The topbar "Tags" toggle button is removed in favor of a single `tags-toggle-btn` positioned inside the sidebar header. When reduced, the sidebar column width shrinks down to the toggle button width, hiding inner filter controls (`display: none`) and excluding them from keyboard tab navigation. Layout preference is persisted in browser `localStorage` under key `conjuros_sidebar_open`.

## Technical Context

**Language/Version**: TypeScript 5.x / React 18
**Primary Dependencies**: React, Vite, CSS Flexbox
**Storage**: Browser `localStorage` (`conjuros_sidebar_open`)
**Testing**: Vitest + React Testing Library (`npm run check`)
**Target Platform**: Web Browsers (Desktop & Mobile viewports)
**Project Type**: React SPA Web Application
**Performance Goals**: Instant CSS transitions without layout thrashing or horizontal scrollbars
**Constraints**: Zero external state libraries, strict WCAG accessibility (`aria-expanded`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Ownership and private-data boundaries MUST be preserved for every feature. -> PASSED (Pure UI layout state, no data boundary impact)
- Shared contracts MUST be updated before API or UI changes that alter request or response shapes. -> PASSED (UI component contracts updated in `contracts/sidebar-contract.md`)
- Tests MUST cover success, validation failures, ownership boundaries, and critical flows. -> PASSED (Component unit tests in `src/web/components/__tests__/` and page tests in `src/web/pages/__tests__/`)
- Security-sensitive changes MUST avoid secrets, preserve explicit user actions, and keep destructive operations guarded. -> PASSED (No secrets or sensitive data involved)

## Project Structure

### Documentation (this feature)

```text
specs/016-sidebar-collapse/
├── spec.md              # Feature Specification
├── plan.md              # Implementation Plan
├── research.md          # Phase 0 Output (Research & Key Decisions)
├── data-model.md        # Phase 1 Output (SidebarState UI Entity)
├── quickstart.md        # Phase 1 Output (Validation Scenarios)
└── contracts/           # Phase 1 Output (Sidebar Component Contract)
    └── sidebar-contract.md
```

### Source Code (repository root)

```text
src/web/
├── components/
│   ├── Sidebar.tsx                # Single toggle button + conditional rendering of inner controls
│   ├── TagColumnIcon.tsx          # Soft bar bookmark SVG icon
│   └── __tests__/
│       └── Sidebar.test.tsx       # Unit tests for sidebar collapse/expand & aria attributes
├── pages/
│   ├── CollectionPage.tsx         # Remove topbar tags button; manage isSidebarOpen + localStorage
│   └── __tests__/
│       └── CollectionPage.test.tsx
└── index.css                      # CSS width transition rules for .app-sidebar.collapsed vs .expanded
```

**Structure Decision**: Web application layout updates across `src/web/components/Sidebar.tsx`, `src/web/pages/CollectionPage.tsx`, and `src/web/index.css`.

## Complexity Tracking

> No constitution violations.
