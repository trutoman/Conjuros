# Tasks: Local Development Environment Setup

**Input**: Design documents from `/specs/002-environment-setup/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/local-development.md](contracts/local-development.md), [quickstart.md](quickstart.md)

**Tests**: Tests are required by FR-010 and the project constitution. The normal `npm run check` suite must remain Docker-independent; the Compose persistence test is run only through `npm run test:docker`.

**Organization**: Tasks are grouped by user story so each increment can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the runtime configuration dependency and protect the standard test suite from Docker-only verification.

- [X] T001 Add the `dotenv` runtime dependency and update the lockfile in `package.json` and `package-lock.json`
- [X] T002 Configure `vitest.config.ts` so `src/tests/integration/docker-compose.test.ts` is excluded from default `npm run test` execution

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the reusable process-command boundary required for deterministic Docker availability checks and optional integration tests.

**⚠️ CRITICAL**: Complete this phase before implementing workflow commands or Docker-dependent tests.

- [X] T003 Implement an injectable process-command helper with exit status, stdout, and stderr results in `scripts/process-command.mjs`
- [X] T004 Add unit coverage for successful and failed mocked command execution in `src/tests/scripts/process-command.test.ts`

**Checkpoint**: A deterministic command boundary is ready without calling the host Docker daemon.

---

## Phase 3: User Story 1 - Start a local data service (Priority: P1) 🎯 MVP

**Goal**: Provide a contributor-owned MongoDB 7.0 service that is reachable locally and preserves data across normal restarts.

**Independent Test**: On a Docker-capable machine, `docker compose up -d` starts `mongo-local` on `localhost:27017`; `npm run test:docker` writes a record, restarts the service, and verifies that it remains.

### Tests for User Story 1

- [X] T005 [P] [US1] Add optional Docker Compose persistence coverage, including a clear Docker-unavailable skip reason and cleanup, in `src/tests/integration/docker-compose.test.ts`

### Implementation for User Story 1

- [X] T006 [US1] Create the root Compose definition with the immutable MongoDB 7.0.39 digest, `mongo-local`, `27017:27017`, and `mongo_data:/data/db` in `docker-compose.yml`
- [X] T007 [US1] Add the `test:docker` script that runs only the Compose persistence test in `package.json`

**Checkpoint**: The local MongoDB service can be started and its named-volume persistence can be verified without requiring Docker for the standard test suite.

---

## Phase 4: User Story 2 - Configure a local application safely (Priority: P1)

**Goal**: Load personal `.env` settings and block API startup before request serving when MongoDB configuration or session-secret validation fails.

**Independent Test**: Copy `.env.example` to `.env`, provide valid values, and start the API; invalid, blank, malformed, or short values produce variable-name-only feedback before the server opens a connection or port.

### Tests for User Story 2

- [X] T008 [P] [US2] Add valid configuration, missing/blank values, malformed MongoDB URI, and short-secret tests that assert no secret value is exposed in `src/tests/api/environment.test.ts`

### Implementation for User Story 2

- [X] T009 [US2] Implement Zod-backed API environment parsing for `MONGODB_URI`, `MONGODB_DATABASE`, `SESSION_SECRET`, and optional `PORT` in `src/api/config/environment.ts`
- [X] T010 [US2] Load `.env` and use validated environment configuration before MongoDB connection or `app.listen` in `src/api/server.ts`
- [X] T011 [US2] Update non-secret local configuration placeholders, including `mongodb://localhost:27017`, in `.env.example`

**Checkpoint**: The API starts only with a complete valid local configuration and exposes no configuration values in validation errors.

---

## Phase 5: User Story 3 - Run the full development workspace (Priority: P2)

**Goal**: Give contributors one documented setup flow with clear Docker-unavailable feedback before they start the full workspace.

**Independent Test**: A contributor runs `npm run docker:check`, follows the documented sequence, and reaches `http://localhost:5173`; mocked unavailable Docker output directs them to install or start Docker without claiming MongoDB ran.

### Tests for User Story 3

- [X] T012 [P] [US3] Add deterministic mocked-command tests for missing Docker CLI and inaccessible Docker daemon feedback in `src/tests/scripts/docker-availability.test.ts`

### Implementation for User Story 3

- [X] T013 [US3] Implement the Docker CLI and daemon availability command with actionable failure output in `scripts/check-docker.mjs`
- [X] T014 [US3] Add the `docker:check` command and preserve the existing `dev`, `check`, and `test:docker` interfaces in `package.json`
- [X] T015 [US3] Document the Docker check, Compose startup, `.env` setup, dependency install, `npm run dev`, failure modes, and `http://localhost:5173` verification in `README.md`

**Checkpoint**: Contributors can distinguish Docker-unavailable, configuration-invalid, and frontend-unreachable conditions from a successful local workspace startup.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Confirm all public contributor guidance agrees with the delivered interfaces and the required validation paths remain isolated.

- [X] T016 [P] Reconcile command, image digest, secret-safety, and persistence statements with the delivered files in `specs/002-environment-setup/quickstart.md`
- [X] T017 Run the Docker-independent quality gate and resolve feature-related failures using `package.json`
- [X] T018 Run the optional Docker Compose persistence verification and record an explicit skip reason if Docker is unavailable in `src/tests/integration/docker-compose.test.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Starts immediately.
- **Foundational (Phase 2)**: Depends on T001 and blocks Docker-command work in US3 and optional integration behavior in US1.
- **US1 (Phase 3)**: Requires T002; T005 is implemented before T006 and T007.
- **US2 (Phase 4)**: Requires T001; T008 is implemented before T009-T011.
- **US3 (Phase 5)**: Requires T003-T004; T012 is implemented before T013-T015.
- **Polish (Phase 6)**: Requires all desired user-story phases.

### User Story Dependencies

- **US1 (P1)**: Independent of US2 and US3 once test isolation is configured.
- **US2 (P1)**: Independent of US1 and US3 after the `dotenv` setup task.
- **US3 (P2)**: Uses the foundational command boundary but can be developed independently of the API configuration and Compose implementation.

### Parallel Opportunities

- T001 and T002 affect separate dependency and test-configuration files and can run in parallel.
- T005 and T008 can be authored in parallel after their respective test prerequisites are available.
- T008, T012, and T006 are in distinct files and can proceed in parallel once their prerequisites finish.
- The US1 Compose work and US2 configuration work can run in parallel after Phase 1.

## Parallel Execution Examples

### User Story 1

```text
Task: "T005 [US1] Add optional Docker Compose persistence coverage in src/tests/integration/docker-compose.test.ts"
Task: "T006 [US1] Create the root Compose definition in docker-compose.yml"
```

### User Story 2

```text
Task: "T008 [US2] Add API environment validation tests in src/tests/api/environment.test.ts"
Task: "T011 [US2] Update non-secret local configuration placeholders in .env.example"
```

### User Story 3

```text
Task: "T012 [US3] Add mocked Docker availability tests in src/tests/scripts/docker-availability.test.ts"
Task: "T015 [US3] Document the contributor workflow in README.md"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 to install the configuration dependency and isolate Docker tests.
2. Complete the foundational process-command helper and its tests.
3. Complete US1: Compose configuration, its opt-in test command, and persistence coverage.
4. Validate `docker compose up -d` and, where Docker is available, `npm run test:docker`.

### Incremental Delivery

1. Deliver US1 for a repeatable local database.
2. Deliver US2 to prevent unsafe or ambiguous API startup.
3. Deliver US3 so a new contributor can follow a documented, diagnosable setup path to Vite.
4. Complete cross-cutting documentation reconciliation and the Docker-independent quality gate.

## Notes

- `[P]` tasks modify independent files and have no dependency on incomplete sibling tasks.
- `[US1]`, `[US2]`, and `[US3]` provide direct story traceability.
- Do not add session values to documentation, test output, source control, or logs.
- `docker compose down -v` remains an explicit destructive action outside the normal contributor workflow.