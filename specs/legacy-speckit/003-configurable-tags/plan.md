# Implementation Plan: User Configurable Tags

**Branch**: `003-configurable-tags` | **Date**: 2026-07-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-configurable-tags/spec.md`

## Summary

Replace the static global tag catalog with user-owned configurable tags that support full CRUD, case-insensitive uniqueness per user, case-insensitive search, color validation as `#RRGGBB`, and assignment to spells and web-links only when the tag is owned by the authenticated user. Filtering will support both AND and OR modes (default AND), and tag deletion will cascade by removing the deleted tag from all of the owner's items.

## Technical Context

**Language/Version**: TypeScript 5.7 on Node.js 20 LTS-compatible runtime

**Primary Dependencies**: Express 4, MongoDB Node.js driver 6, React 19, Vite 6, Zod 3, TanStack Query 5, Vitest 3

**Storage**: MongoDB collections for `collectionItems` and new `tags` (or equivalent user-owned tag persistence)

**Testing**: Vitest unit and API integration tests under `src/tests`, plus frontend component/page tests under `src/web/components/__tests__` and `src/web/pages/__tests__`

**Target Platform**: Web application (API + browser UI) for authenticated users on local/dev Linux, macOS, and Windows environments

**Project Type**: TypeScript monorepo web application with shared contracts in `packages/contracts`

**Performance Goals**: Tag-filtered collection queries return results within 3 seconds for at least 95% of queries at 100 tagged items per user

**Constraints**: Strict per-user ownership checks; no business logic in HTTP controllers; Zod validation at boundaries; pagination max limit 50; no secret exposure in logs/errors

**Scale/Scope**: One new user-owned tag domain model, tag-aware item create/update/list flows, one new tag API surface, and web UI updates for tag management and filter mode selection

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Ownership and private-data boundaries MUST be preserved for every feature.
- Shared contracts MUST be updated before API or UI changes that alter request or response shapes.
- Tests MUST cover success, validation failures, ownership boundaries, and critical flows.
- Security-sensitive changes MUST avoid secrets, preserve explicit user actions, and keep destructive operations guarded.

Initial gate assessment:

- Ownership and private-data boundaries: **Pass**. Tag and item operations remain scoped by `ownerId`, including search/filter and tag assignment checks.
- Shared contracts first: **Pass**. `packages/contracts` will be updated before API and web integration changes.
- Test-first quality: **Pass**. Plan includes API and UI coverage for CRUD, validation, ownership boundaries, cascade delete, and filter modes.
- Security and safe actions: **Pass**. No tag operation executes spell commands or auto-opens links; destructive actions remain explicit and authorized.

## Project Structure

### Documentation (this feature)

```text
specs/003-configurable-tags/
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
    ├── items.ts
    └── index.ts

src/
├── api/
│   ├── controllers/
│   │   ├── items.controller.ts
│   │   └── tags.controller.ts                # new
│   ├── routes/
│   │   ├── items.route.ts
│   │   └── tags.route.ts                     # new
│   ├── services/
│   │   ├── items.service.ts
│   │   └── tags.service.ts                   # new
│   ├── repositories/
│   │   ├── items.repository.ts
│   │   └── tags.repository.ts                # new
│   └── app.ts
├── web/
│   ├── components/
│   │   ├── FilterBar.tsx
│   │   ├── ItemForm.tsx
│   │   ├── TagForm.tsx                       # new
│   │   └── TagList.tsx                       # new
│   ├── hooks/
│   │   ├── useCollection.ts
│   │   ├── useCollectionFilters.ts
│   │   └── useTags.ts                        # new
│   ├── pages/
│   │   └── CollectionPage.tsx
│   └── services/
│       ├── items.ts
│       └── tags.ts                           # new

src/tests/
└── api/
    ├── items.test.ts
    ├── items-crud.test.ts
    ├── reorder.test.ts
    └── tags.test.ts                         # new

src/web/
├── components/
│   └── __tests__/
│       └── TagForm.test.tsx                 # new
└── pages/
    └── __tests__/
        └── CollectionPage.tags.test.tsx     # new
```

**Structure Decision**: Keep the existing monorepo split and extend current item-centric architecture with a dedicated tag domain across contracts, API, repository, and UI layers. This preserves the constitution rule that controllers stay thin, services hold domain logic, and repositories own MongoDB operations.

## Constitution Check (Post-Design)

- Ownership and private-data boundaries: **Pass**. The design introduces ownership checks at tag CRUD, tag lookup, tag assignment validation, and cascade updates.
- Contract-first architecture: **Pass**. New schemas and types for tags, collection query tag filters, and filter-mode options are defined in shared contracts before implementation.
- Test-first quality and verification: **Pass**. The design defines tests for successful CRUD, invalid name/color formats, cross-user denial, AND/OR filtering behavior, and cascade deletion effects on item tags.
- Security and safe user actions: **Pass**. The design keeps destructive operations explicit and authorized; no execution of spell text or implicit opening of links is introduced.
- Focused product experience: **Pass**. UI changes are scoped to search/filter and tag management actions; no unnecessary libraries or decorative behavior are introduced.

## Complexity Tracking

No constitution violations require special justification for this feature.
