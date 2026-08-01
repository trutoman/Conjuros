# Implementation Plan: Search & Filter Sub-Header in Main Content Frame

**Branch**: `012-searchbox-as-header` | **Date**: 2026-08-01 | **Spec**: [spec.md](file:///home/alosadad/Conjuros/specs/012-searchbox-as-header/spec.md)

**Input**: Feature specification from `/specs/012-searchbox-as-header/spec.md`

## Summary

Relocate the search input box (`.search-field`) and item type dropdown filter (`.type-selector-field`) from the tags sidebar into a dedicated sub-header container (`.collection-subheader`) inside `.main-content-frame` directly above the collection grid in `CollectionPage.tsx`. Format the sub-header as a horizontal flex row on desktop viewports (search expanding with `flex: 1`, type selector right-aligned) and stack into 2 full-width rows on mobile viewports (<= 650px). Rename the tags sidebar title from `"Search"` to `"Tags"` in `Sidebar.tsx`.

## Technical Context

**Language/Version**: TypeScript 5+, HTML5, CSS3

**Primary Dependencies**: React 18, Vite, Vanilla CSS (`src/web/index.css`)

**Storage**: N/A (Frontend component refactoring)

**Testing**: Vitest (`npm test`)

**Target Platform**: Desktop & Mobile Web Browsers

**Project Type**: Web Application

**Performance Goals**: Instant client-side filter updates (0ms delay) and responsive sub-header layout adjustments

**Constraints**: Mobile breakpoint at `<= 650px` (2 stacked rows); desktop flex layout with full-width search input growth

**Scale/Scope**: `src/web/components/Sidebar.tsx`, `src/web/pages/CollectionPage.tsx`, `src/web/index.css`, `src/web/components/__tests__/Sidebar.test.tsx`

## Constitution Alignment

*GATE: Passed. All core principles preserved.*

- **Ownership Boundaries**: Preserved (UI layout refactoring does not alter resource authorization).
- **Contract-First Architecture**: Preserved (UI contracts documented; shared Zod contracts unaffected).
- **Test-First Quality & Verification**: Preserved (Unit and component tests updated to cover sub-header rendering and sidebar title update).
- **Security & Safe Actions**: Preserved.

## Project Structure

### Documentation (this feature)

```text
specs/012-searchbox-as-header/
├── plan.md              # Implementation plan (this file)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
    └── ui-components-contract.md
```

### Source Code (repository root)

```text
src/
├── web/
│   ├── components/
│   │   ├── Sidebar.tsx             # Updated header text to "Tags", removed search/type inputs
│   │   └── CollectionSubHeader.tsx # New sub-header component for main-content-frame
│   ├── pages/
│   │   └── CollectionPage.tsx      # Rendered CollectionSubHeader inside main-content-frame
│   └── index.css                   # Added .collection-subheader flex and mobile styles
```

**Structure Decision**: Frontend React components in `src/web/components/` and layout styling in `src/web/index.css`.

## Complexity Tracking

*No constitution violations present. No extra complexity added.*
