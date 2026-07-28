# Implementation Plan: Local Development Environment Setup

**Branch**: `002-environment-setup` | **Date**: 2026-07-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-environment-setup/spec.md`

## Summary

Provide a repeatable, contributor-owned local MongoDB environment through Docker Compose, then make `npm run dev` load `.env` safely and fail at the API entry point before serving requests when required configuration is invalid. The implementation will pin the official MongoDB 7.0 image to an immutable digest, preserve database data in `mongo_data`, document one setup sequence, and split deterministic configuration/Docker-command unit tests from an opt-in Docker Compose persistence test.

## Technical Context

**Language/Version**: TypeScript 5.7, Node.js 20 LTS-compatible runtime

**Primary Dependencies**: Express 4, MongoDB Node.js driver 6, React 19, Vite 6, Zod 3, Vitest 3; add `dotenv` for non-failing `.env` loading at API startup

**Storage**: Contributor-owned MongoDB 7.0.39 in Docker Compose; named `mongo_data` volume at `/data/db`

**Testing**: Vitest 3 unit tests for configuration and Docker command behavior; optional Docker Compose integration test for restart persistence; existing `npm run check`

**Target Platform**: Linux, macOS, or Windows contributors with Docker Desktop/Engine and a modern browser

**Project Type**: TypeScript monorepo web application with local infrastructure

**Performance Goals**: Complete documented local setup within 10 minutes excluding dependency download; fail invalid configuration before Express binds its port

**Constraints**: Pin MongoDB to `mongo:7.0.39@sha256:9bdaeb6dac6e7e762e84e2f84103d1f9bb078fa1ba6bde8bb9d2274f655ad173`; use `mongo-local`, `27017:27017`, and `mongo_data`; never log configuration values or secrets; regular tests must not require Docker

**Scale/Scope**: One local MongoDB service, one contributor `.env` contract, one API startup configuration boundary, one documented workflow, and one opt-in persistence integration check

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Ownership and private-data boundaries MUST be preserved for every feature. **Pass**: local MongoDB is contributor-owned and the feature does not modify collection access rules.
- Shared contracts MUST be updated before API or UI changes that alter request or response shapes. **Pass**: no HTTP request or response contract changes are required; the environment configuration contract is documented in `contracts/local-development.md`.
- Tests MUST cover success, validation failures, ownership boundaries, and critical flows. **Pass**: add configuration success/failure tests, mocked Docker-command tests, and an opt-in persistence integration check.
- Security-sensitive changes MUST avoid secrets, preserve explicit user actions, and keep destructive operations guarded. **Pass**: `.env` remains ignored, `.env.example` uses placeholders, and error paths name variables but never print values.

## Project Structure

### Documentation (this feature)

```text
specs/002-environment-setup/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── api/
│   ├── config/
│   │   └── environment.ts
│   ├── server.ts
│   └── repositories/
├── tests/
│   ├── api/
│   │   └── environment.test.ts
│   ├── scripts/
│   │   └── docker-availability.test.ts
│   └── integration/
│       └── docker-compose.test.ts
└── web/

scripts/
└── check-docker.mjs

docker-compose.yml
.env.example
README.md
package.json
vitest.config.ts
```

**Structure Decision**: Keep API configuration parsing under `src/api/config` so the server entry point remains the sole runtime authority. Keep Docker availability at a small, injectable command boundary under `scripts` for deterministic tests. Compose configuration and contributor documentation live at the repository root, while the optional integration test remains separate from the standard Vitest suite.

## Constitution Check (Post-Design)

- **Ownership and Private Data Boundaries: Pass.** The Compose service is isolated to contributor-owned local data and does not add a route, change collection ownership, or expose persistence-only data.
- **Contract-First Architecture: Pass.** No shared API contract changes are needed. The contributor-facing Compose, environment, and command interfaces are explicitly recorded in `contracts/local-development.md`.
- **Test-First Quality and Verification: Pass.** The design requires unit coverage for valid and invalid configuration and Docker failures, plus an optional real persistence check. `npm run check` remains Docker-independent.
- **Security and Safe User Actions: Pass.** Configuration parsing stops before serving, recognizes a 32-character secret minimum, and reports only variable names. Documentation keeps `.env` untracked and states that destructive volume removal is outside the normal flow.
- **Focused Product Experience: Pass.** The only frontend commitment is preserving the existing Vite entry point at `http://localhost:5173`; no product UI work or unnecessary dependencies are introduced.

## Complexity Tracking

No constitution violations require special justification for this feature.
