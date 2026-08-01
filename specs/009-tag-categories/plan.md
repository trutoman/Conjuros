# Implementation Plan: Tag Categories

**Branch**: `009-tag-categories` | **Date**: 2026-08-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/009-tag-categories/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command; its definition describes the execution workflow.

## Summary

Extend the existing user-owned tag domain so every tag requires a category, duplicate detection uses the normalized pair of tag name and tag category, existing uncategorized tags are backfilled to `General`, and the tags UI shows each category without introducing a standalone category-management surface. The design keeps categories implicit in tag records, preserves owner-scoped CRUD and item-tag validation, and keeps collection item tags stored as tag-name strings.

## Technical Context

**Language/Version**: TypeScript 5.7 on a Node.js 20 LTS-compatible runtime

**Primary Dependencies**: Express 4, MongoDB Node.js driver 6, React 19, Vite 6, Zod 3, TanStack Query 5, Vitest 3

**Storage**: MongoDB collections for `tags`, `collectionItems`, and `users`

**Testing**: Vitest API integration tests under `src/tests/api`, shared validation tests under `src/tests/shared`, and frontend component/page tests under `src/web/**/__tests__`

**Target Platform**: Authenticated web application with Express API and browser UI for local/dev environments on Linux, macOS, and Windows

**Project Type**: TypeScript monorepo web application with shared contracts in `packages/contracts`

**Performance Goals**: Tag listing, create/update/delete, and related collection refreshes should remain within the current interactive envelope, targeting sub-3-second end-to-end responses for typical users with up to 100 tags and 100 tagged items

**Constraints**: Strict owner scoping on every tag and item operation; shared Zod contracts first; controllers remain transport-only; repositories are the only MongoDB access layer; no standalone category CRUD; pagination limit remains max 50; legacy tags missing category must resolve to `General`

**Scale/Scope**: One extension of the existing tag domain across contracts, API, persistence, UI, and tests, including compatibility for existing tag records and duplicate detection based on normalized name-category pairs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Ownership and private-data boundaries MUST be preserved for every feature.
- Shared contracts MUST be updated before API or UI changes that alter request or response shapes.
- Tests MUST cover success, validation failures, ownership boundaries, and critical flows.
- Security-sensitive changes MUST avoid secrets, preserve explicit user actions, and keep destructive operations guarded.

Initial gate assessment:

- Ownership and private-data boundaries: **Pass**. Tag creation, listing, conflict checks, updates, deletion, and legacy-data compatibility remain scoped by `ownerId`; no category data is shared across users.
- Shared contracts first: **Pass**. `packages/contracts/src/tags.ts` remains the source of truth for required category input, normalized pair semantics, and list/query shapes.
- Test-first quality: **Pass**. The feature requires API and UI coverage for category-required validation, duplicate pair detection, legacy default-category behavior, and user-visible category rendering.
- Security and safe actions: **Pass**. The feature adds metadata only; it does not alter spell execution rules, link opening rules, or destructive action authorization.

## Project Structure

### Documentation (this feature)

```text
specs/009-tag-categories/
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
        ├── index.ts
        ├── items.ts
        └── tags.ts

src/
├── api/
│   ├── app.ts
│   ├── controllers/
│   │   └── tags.controller.ts
│   ├── repositories/
│   │   ├── items.repository.ts
│   │   └── tags.repository.ts
│   ├── routes/
│   │   └── tags.route.ts
│   └── services/
│       └── tags.service.ts
├── tests/
│   ├── api/
│   │   ├── items.test.ts
│   │   ├── tags.test.ts
│   │   └── testApp.ts
│   └── shared/
│       └── validation.test.ts
└── web/
    ├── components/
    │   ├── TagForm.tsx
    │   ├── TagList.tsx
    │   └── __tests__/
    │       ├── TagForm.test.tsx
    │       └── itemCard.fixtures.ts
    ├── hooks/
    │   └── useTags.ts
    ├── pages/
    │   ├── CollectionPage.tsx
    │   ├── TagsPage.tsx
    │   └── __tests__/
    │       └── CollectionPage.tags.test.tsx
    └── services/
        └── tags.ts
```

**Structure Decision**: Keep the existing monorepo split and extend the current tag domain in place. Contracts continue to define shared validation and types, the API preserves thin controllers with service-owned business rules and repository-owned persistence, and the web layer updates the existing tags management surfaces instead of introducing a new category-specific feature area.

## Constitution Check (Post-Design)

- Ownership and private-data boundaries: **Pass**. The design keeps all tag/category reads and writes owner-scoped and treats category existence as a user-local derived concept.
- Contract-first architecture: **Pass**. Required category fields, normalized comparison semantics, and tag list sort/query changes are represented in shared contracts before downstream implementation.
- Test-first quality and verification: **Pass**. The design defines API and UI validation for create/update, duplicate normalized pairs, owner isolation, legacy `General` backfill compatibility, and visible category rendering.
- Security and safe user actions: **Pass**. The design does not introduce autonomous actions, background execution, or new destructive behavior beyond already-confirmed tag deletion.
- Focused product experience: **Pass**. The design reuses the existing tags page and tag form, adds category visibility, and avoids separate category CRUD, preserving a compact management flow.

## Complexity Tracking

No constitution violations require special justification for this feature.
