# Implementation Plan: New Tag Column Icon

**Branch**: `feature/new-tag-column-icon` | **Date**: 2026-08-02 | **Spec**: [spec.md](file:///home/alosadad/Conjuros/specs/014-new-tag-column-icon/spec.md)

**Input**: Feature specification from `/specs/014-new-tag-column-icon/spec.md`

## Summary

Implement the new custom soft bar bookmark SVG icon (`viewBox="0 0 64 64"`) across the user interface. The icon will be encapsulated in a reusable `TagColumnIcon` component and rendered in both the topbar Tags toggle button and the sidebar header title. In both locations, text and icon will be aligned vertically in a flex column (centered text at top, icon centered below text).

## Technical Context

**Language/Version**: TypeScript / React 18 / Node.js
**Primary Dependencies**: React, Vite, Vanilla CSS
**Storage**: N/A (UI display only)
**Testing**: Vitest, React Testing Library
**Target Platform**: Web browser
**Project Type**: Web application
**Performance Goals**: Instant SVG rendering, zero layout shift
**Constraints**: Must adapt to light/dark themes via `currentColor`; must be accessible (`aria-hidden="true"`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Ownership and private-data boundaries MUST be preserved for every feature: **PASS** (pure UI visual component, no data access).
- Shared contracts MUST be updated before API or UI changes that alter request or response shapes: **PASS** (no contract shape changes).
- Tests MUST cover success, validation failures, ownership boundaries, and critical flows: **PASS** (tests will cover component rendering and accessibility attributes).
- Security-sensitive changes MUST avoid secrets, preserve explicit user actions, and keep destructive operations guarded: **PASS**.

## Project Structure

### Documentation (this feature)

```text
specs/014-new-tag-column-icon/
├── plan.md              # Implementation plan
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
src/web/
├── components/
│   ├── TagColumnIcon.tsx         # [NEW] Reusable soft bar bookmark SVG component
│   ├── Sidebar.tsx               # [MODIFY] Render TagColumnIcon in sidebar header
│   └── __tests__/
│       └── TagColumnIcon.test.tsx # [NEW] Component unit tests
├── pages/
│   └── CollectionPage.tsx        # [MODIFY] Render TagColumnIcon in topbar Tags button
└── index.css                     # [MODIFY] Vertical column layout styles for topbar button & sidebar header title
```

**Structure Decision**: Standard web application component layout within `src/web/components/`.
