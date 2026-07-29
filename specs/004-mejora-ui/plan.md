# Implementation Plan: Item Collection UI Refresh

**Branch**: `004-mejora-ui` | **Date**: 2026-07-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-mejora-ui/spec.md`

## Summary

Refresh the collection experience so users can switch and retain a light or dark theme, scan item cards quickly, read commands and URLs with clear code-style presentation, see explicit feedback for copy/open/delete actions, and recognize tag colors consistently across edit and item views. Theme preference must persist per authenticated user across devices.

## Technical Context

**Language/Version**: TypeScript 5.7 on a Node.js 20-compatible runtime

**Primary Dependencies**: Express 4, React 19, Vite 6, MongoDB Node.js driver 6, Zod 3, TanStack Query 5, Vitest 3, existing shared contracts in `packages/contracts`

**Storage**: MongoDB for authenticated user preferences plus the existing collection item and tag data

**Testing**: Vitest API, integration, and UI tests under `src/tests`, `src/web/components/__tests__`, and `src/web/pages/__tests__`

**Target Platform**: Web application for authenticated users on desktop and mobile browsers

**Project Type**: TypeScript monorepo web application with `src/api`, `src/web`, and shared contracts in `packages/contracts`

**Performance Goals**: Theme changes should apply immediately on the next render; item actions must remain responsive; tagged items and cards must remain easy to scan during normal collection browsing

**Constraints**: Preserve ownership and privacy boundaries, keep controllers thin, validate boundaries with Zod, avoid secrets in logs or responses, and keep explicit user actions required for open/delete flows

**Scale/Scope**: One collection experience, one user preference domain, item card and tag presentation updates, and the minimum contract additions needed to persist theme preference

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Ownership and private-data boundaries MUST be preserved for every feature.
- Shared contracts MUST be updated before API or UI changes that alter request or response shapes.
- Tests MUST cover success, validation failures, ownership boundaries, and critical flows.
- Security-sensitive changes MUST avoid secrets, preserve explicit user actions, and keep destructive operations guarded.

Initial gate assessment:

- Ownership and private-data boundaries: **Pass**. Theme preference is scoped to the authenticated user, and item/tag ownership rules remain unchanged.
- Shared contracts first: **Pass**. The plan introduces a user-preference contract before implementation details are touched.
- Test-first quality: **Pass**. The feature requires API and UI coverage for theme persistence, card actions, tag color visibility, and keyboard behavior.
- Security and safe actions: **Pass**. No implicit link opening or destructive action is introduced; user-triggered copy/open/delete behavior remains explicit.

## Project Structure

### Documentation (this feature)

```text
specs/004-mejora-ui/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/
└── contracts/
    └── src/
        ├── auth.ts
        ├── items.ts
        ├── tags.ts
        └── index.ts

src/
├── api/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── items.controller.ts
│   │   └── tags.controller.ts
│   ├── repositories/
│   │   ├── users.repository.ts
│   │   ├── items.repository.ts
│   │   └── tags.repository.ts
│   ├── routes/
│   │   ├── auth.route.ts
│   │   ├── items.route.ts
│   │   └── tags.route.ts
│   └── services/
│       ├── auth.service.ts
│       ├── items.service.ts
│       └── tags.service.ts
├── web/
│   ├── components/
│   │   ├── CollectionList.tsx
│   │   ├── ItemCard.tsx
│   │   ├── ItemForm.tsx
│   │   ├── TagForm.tsx
│   │   ├── TagList.tsx
│   │   └── ThemeToggle.tsx
│   ├── hooks/
│   │   ├── useCollection.ts
│   │   ├── useCollectionFilters.ts
│   │   ├── useTags.ts
│   │   └── useThemePreference.ts
│   └── pages/
│       └── CollectionPage.tsx
└── tests/
    ├── api/
    ├── integration/
    ├── web/components/__tests__/
    └── web/pages/__tests__/
```

**Structure Decision**: Keep the existing monorepo structure and add the smallest set of shared, API, and web artifacts needed to persist authenticated user theme preference while preserving the current collection and tag flows.

## Phase 0: Research

Complete research is captured in [research.md](research.md). The main decisions are:

- Persist the theme preference per authenticated user so the same choice follows the user across devices.
- Use the current light theme as the default when no saved preference exists.
- Reuse the existing validated tag color model and display it both as a swatch in editing and as colored tag text in item views.
- Keep item actions explicit and lightweight: copy gives feedback, web links open only on user action, and edit/delete remain visually de-emphasized until interaction.

## Phase 1: Design & Contracts

### Data model

The data model is captured in [data-model.md](data-model.md) and centers on a persisted user theme preference plus ephemeral UI interaction state for cards and tag editing.

### Contracts

The contract folder documents the user preference interface needed to persist theme selection across devices.

### Quickstart

The validation guide is captured in [quickstart.md](quickstart.md) and describes how to verify theme persistence, card interactions, tag color rendering, and keyboard accessibility end to end.

## Constitution Check (Post-Design)

- Ownership and private-data boundaries: **Pass**. Theme preference is user-owned; collection item ownership behavior remains unchanged.
- Contract-first architecture: **Pass**. The preference contract is documented before implementation work begins.
- Test-first quality and verification: **Pass**. The design requires API and UI tests for persistence, card interactions, tag rendering, and keyboard access.
- Security and safe user actions: **Pass**. Explicit user action remains required for web-link opening and destructive actions.
- Focused product experience: **Pass**. The design keeps the refresh centered on collection readability and quick actions, without unnecessary new surface area.

## Complexity Tracking

No constitution violations require special justification for this feature.
