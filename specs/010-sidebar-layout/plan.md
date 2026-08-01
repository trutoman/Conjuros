# Implementation Plan: Sidebar Tag Filter Layout

**Branch**: `010-sidebar-layout` | **Date**: 2026-08-01 | **Spec**: [spec.md](file:///home/alosadad/Conjuros/specs/010-sidebar-layout/spec.md)

**Input**: Feature specification from `/specs/010-sidebar-layout/spec.md`

---

## Summary
The main collection page layout will be redesigned to replace the exclusive page-level navigation of "tags" vs "collection" and the top horizontal `FilterBar`. Clicking "Tags" will toggle a left-aligned sidebar panel containing the filtering checkboxes grouped by category, the match mode selector, and a navigation link to the existing tags CRUD page.

---

## Technical Context

**Language/Version**: TypeScript / Node 22

**Primary Dependencies**: React, Vite, Zod, React Query

**Storage**: MongoDB (No changes)

**Testing**: Vitest, React Testing Library

**Target Platform**: Web browsers (desktop & mobile)

**Project Type**: Monorepo Web Application

**Performance Goals**: Sidebar toggling animation runs at 60 FPS, item filtering completes within 150ms.

**Constraints**: Pure client-side layout adjustments, no database migration needed.

**Scale/Scope**: Impacts `App.tsx` navigation and `CollectionPage.tsx` layout.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Ownership and private-data boundaries**: Preserved. Tag fetching and item list querying remain scoped strictly to the authenticated user.
- **Shared contracts**: Unchanged. The data contracts for Tags and Items are preserved as-is.
- **Tests**: Core layout, state changes, responsive behaviors, and filtering actions will have unit and integration tests.
- **Security-sensitive changes**: No secrets, auth mechanisms, or session credentials are changed.

---

## Project Structure

### Documentation (this feature)

```text
specs/010-sidebar-layout/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── quickstart.md        # Phase 1 output
```

### Source Code (repository root)

```text
src/
└── web/
    ├── components/
    │   ├── Sidebar.tsx  # [NEW] Sidebar component containing tag filter groups
    │   └── FilterBar.tsx # [DELETE] Existing filter bar component
    ├── pages/
    │   └── CollectionPage.tsx # [MODIFY] Layout update to support sidebar Grid
    └── App.tsx          # [MODIFY] Change Page navigation state structure
```

**Structure Decision**: Monorepo Web Application structure. The changes are entirely inside the frontend UI package (`src/web`).

---

## Complexity Tracking

*All constitution checks passed successfully without violations.*
