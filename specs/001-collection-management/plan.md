# Implementation Plan: Private Collection Management

**Branch**: `001-collection-management` | **Date**: 2026-07-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-collection-management/spec.md`

## Summary

Implement a private collection experience for authenticated users in a TypeScript monorepo that supports browsing, searching, filtering, creating, editing, deleting, and reordering spells and web links. The work will use shared Zod-based contracts in `packages/contracts`, an Express backend with ownership checks, a Vite + React frontend with accessible copy/open actions, and Vitest-based tests for unit, integration, and user-flow validation.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20 LTS

**Primary Dependencies**: Express, Vite, React, Zod, Vitest, MongoDB/Motor

**Storage**: MongoDB for private collection records and ordering metadata

**Testing**: Vitest, Testing Library, and supertest for API integration tests

**Target Platform**: Modern web browsers on desktop and mobile web

**Project Type**: Web application (TypeScript monorepo)

**Performance Goals**: Render collection views for 50 items quickly, support search/filter interactions with sub-second feedback, and keep list operations efficient for typical personal collections

**Constraints**: Private ownership must be enforced for every collection operation; spell commands must remain exact text; web links must require absolute `http`/`https` URLs; keyboard and pointer ordering must both work; pagination is required for list endpoints with a default maximum of 50

**Scale/Scope**: Initial release supports one authenticated user’s private collection with CRUD, search, filtering, ordering, and quick copy/open actions

## Constitution Check

- Ownership and private-data boundaries MUST be preserved for every feature. Yes.
- Shared contracts MUST be updated before API or UI changes that alter request or response shapes. Yes.
- Tests MUST cover success, validation failures, ownership boundaries, and critical flows. Yes.
- Security-sensitive changes MUST avoid secrets, preserve explicit user actions, and keep destructive operations guarded. Yes.

## Project Structure

```text
src/
├── api/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   └── repositories/
├── web/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── services/
├── shared/
└── tests/

packages/
└── contracts/
    └── src/
```

**Structure Decision**: Keep the backend in `src/api`, the frontend in `src/web`, and all shared request/response schemas and enums in `packages/contracts` so API and UI remain contract-driven.

## Complexity Tracking

No constitution violations require special justification for this feature.