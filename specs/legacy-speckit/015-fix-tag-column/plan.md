# Implementation Plan: Fix Tag Column Icon Layout

**Branch**: `feature/fix-tag-column` | **Date**: 2026-08-02 | **Spec**: [spec.md](file:///home/alosadad/Conjuros/specs/015-fix-tag-column/spec.md)

**Input**: Feature specification from `/specs/015-fix-tag-column/spec.md`

## Summary

Verify and enforce the tag column icon layout fix (`<button class="quiet tags-toggle-btn"><span>Tags</span><TagColumnIcon /></button>`) with vertical flex column CSS alignment (`flex-direction: column`, `align-items: center`) across topbar action buttons and sidebar header title.

## Technical Context

**Language/Version**: TypeScript / React 18 / Node.js
**Primary Dependencies**: React, Vite, Vanilla CSS
**Storage**: N/A (UI layout)
**Testing**: Vitest, React Testing Library
**Target Platform**: Web browser
**Project Type**: Web application
**Performance Goals**: Instant rendering, no cumulative layout shift
**Constraints**: Theme adaptivity via `fill="currentColor"`; accessibility decoration via `aria-hidden="true"`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Ownership and private-data boundaries MUST be preserved for every feature: **PASS**
- Shared contracts MUST be updated before API or UI changes that alter request or response shapes: **PASS**
- Tests MUST cover success, validation failures, ownership boundaries, and critical flows: **PASS**
- Security-sensitive changes MUST avoid secrets, preserve explicit user actions, and keep destructive operations guarded: **PASS**

## Project Structure

### Documentation (this feature)

```text
specs/015-fix-tag-column/
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
│   ├── TagColumnIcon.tsx         # Soft bar bookmark SVG component
│   ├── Sidebar.tsx               # Sidebar header with TagColumnIcon
│   └── __tests__/
│       └── TagColumnIcon.test.tsx # Unit test suite
├── pages/
│   └── CollectionPage.tsx        # Topbar Tags toggle button markup
└── index.css                     # Vertical flex column layout rules
```

**Structure Decision**: Standard web application components layout.
