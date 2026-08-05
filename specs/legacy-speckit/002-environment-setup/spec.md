# Feature Specification: Local Development Environment Setup (Docker + MongoDB)

**Feature Branch**: `002-environment-setup`

**Created**: 2026-07-28

**Status**: Draft

**Input**: User description: "Provide a repeatable local development environment using Docker Compose and MongoDB 7.0, documented environment settings, startup validation, and a clear contributor workflow."

## Clarifications

### Session 2026-07-28

- Q: How should the MongoDB 7.0 Docker image be pinned? → A: Exact MongoDB 7.0 image digest.
- Q: Which startup command must validate required environment variables before serving requests? → A: API server startup only.
- Q: How should automated validation cover Docker-unavailable behavior? → A: Automated mocked-command validation.
- Q: What automated-test environment should verify MongoDB volume persistence? → A: Optional Docker Compose integration test.
- Q: What minimum strength should startup validation require for `SESSION_SECRET`? → A: At least 32 characters.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start a local data service (Priority: P1)

A contributor can start the project's local MongoDB service before working on the application, so they have an isolated and repeatable data store without relying on a shared or production environment.

**Why this priority**: A working local database is the prerequisite for developing and testing features that use persisted collection data.

**Independent Test**: On a machine with Docker available, a contributor can start the local services and confirm that MongoDB accepts connections at the documented local address.

**Acceptance Scenarios**:

1. **Given** Docker is available, **When** a contributor starts the project's Docker Compose services, **Then** MongoDB version 7.0 starts with the service and container name `mongo-local`.
2. **Given** the local MongoDB service is running, **When** a contributor connects through `localhost` on port `27017`, **Then** the connection reaches the local MongoDB service.
3. **Given** the local MongoDB service has stored data, **When** its container is restarted, **Then** the data remains available through the named `mongo_data` volume mounted at `/data/db`.

---

### User Story 2 - Configure a local application safely (Priority: P1)

A contributor can create a personal local configuration from documented placeholders, so the application has the connection, database name, and session signing value it needs without committing secrets.

**Why this priority**: Clear configuration prevents startup failures and protects personal or sensitive values from entering source control.

**Independent Test**: A contributor copies `.env.example` to `.env`, supplies the required values, and starts the application successfully.

**Acceptance Scenarios**:

1. **Given** a new checkout of the repository, **When** a contributor reads `.env.example`, **Then** it documents `MONGODB_URI=mongodb://localhost:27017`, `MONGODB_DATABASE`, and `SESSION_SECRET`.
2. **Given** the contributor has copied `.env.example` to `.env` and supplied all required values, **When** they start the application, **Then** startup proceeds using those values.
3. **Given** any required environment value is missing or blank, or `SESSION_SECRET` is shorter than 32 characters, **When** the contributor starts the application, **Then** startup stops with a clear message identifying the invalid configuration without revealing a secret value.

---

### User Story 3 - Run the full development workspace (Priority: P2)

A contributor can follow one documented sequence to prepare and run the project locally, so they can reach the frontend and begin development with minimal setup ambiguity.

**Why this priority**: A predictable onboarding path shortens the time before a contributor can verify a change in the browser.

**Independent Test**: A contributor follows the documented flow from a clean checkout and reaches the frontend at the specified local address.

**Acceptance Scenarios**:

1. **Given** a contributor is preparing a new local checkout, **When** they follow the documented flow, **Then** it directs them to verify Docker availability before attempting to start MongoDB.
2. **Given** Docker is available and `.env` is configured, **When** the contributor installs dependencies and runs `npm run dev`, **Then** the Vite frontend is available at `http://localhost:5173`.
3. **Given** Docker is unavailable, **When** a contributor follows the setup flow, **Then** they receive an actionable instruction to start or install Docker before proceeding.

### Edge Cases

- Docker is installed but its daemon is stopped or inaccessible; the setup flow identifies Docker as unavailable and does not imply that MongoDB has started.
- Port `27017` is already in use; the contributor receives a clear failure rather than connecting unintentionally to an unknown service.
- A contributor runs the application with a missing, blank, or malformed required environment value; startup fails before the application serves requests and does not expose the configured session secret.
- A contributor stops and restarts the local MongoDB service; data in `mongo_data` persists, while removing the named volume is an explicit destructive action outside the normal setup flow.
- Port `5173` is unavailable; the contributor can see that the requested frontend address is not reachable rather than assuming the workspace started successfully.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST provide a Docker Compose configuration that starts MongoDB version `7.0` using an exact immutable image digest and MUST NOT use a mutable tag such as `latest` or `7.0` alone.
- **FR-002**: The Docker Compose configuration MUST assign the MongoDB service and container the name `mongo-local`.
- **FR-003**: The local MongoDB service MUST expose port mapping `27017:27017` for contributors connecting from the host machine.
- **FR-004**: The local MongoDB service MUST use a named volume called `mongo_data`, mounted at `/data/db`, so normal service restarts preserve local development data.
- **FR-005**: The project MUST provide `.env.example` that documents `MONGODB_URI=mongodb://localhost:27017`, `MONGODB_DATABASE`, and `SESSION_SECRET` without including real secret values.
- **FR-006**: The API server entry point MUST validate that `MONGODB_URI` and `MONGODB_DATABASE` are present and non-blank and that `SESSION_SECRET` is at least 32 characters before serving requests. It MUST stop startup with actionable feedback when validation fails without displaying configuration values.
- **FR-007**: The local development workflow MUST instruct contributors to verify Docker availability, copy `.env.example` to `.env`, install npm dependencies, and run `npm run dev` in that order.
- **FR-008**: When the documented workflow completes successfully, the Vite frontend MUST be reachable at `http://localhost:5173`.
- **FR-009**: Setup guidance and startup errors MUST not display or commit actual session secret values.
- **FR-010**: Validation for this feature MUST cover successful local configuration, missing required environment values, unavailable Docker through deterministic mocked-command validation, and persistence across a normal MongoDB service restart. Persistence MUST be verified through an optional Docker Compose integration test when Docker is available and skipped with a clear reason otherwise.

### Key Entities *(include if feature involves data)*

- **Local MongoDB Service**: The contributor-owned MongoDB 7.0 instance used for local development, reachable through the documented host address and port.
- **Local Data Volume**: The named `mongo_data` storage that preserves local MongoDB data across normal container restarts.
- **Local Environment Configuration**: The contributor-specific `.env` values used to identify the local database and sign sessions; it is derived from non-secret placeholders in `.env.example`.

## Constitution Alignment *(mandatory)*

- The local database is contributor-owned and isolated; the setup must not direct contributors to a shared or production database.
- Environment configuration must not commit, log, or expose real secrets or session material, preserving the constitution's security and safe-user-action principle.
- Startup validation is a boundary check that provides actionable errors without exposing configuration values.
- The feature requires risk-proportionate, deterministic tests for successful setup, missing configuration, Docker availability failures, and persisted local data.
- The setup remains compatible with the repository's contract-first, private-data architecture and does not alter collection ownership or public contracts.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A contributor with Docker installed can complete the documented local setup flow from a clean checkout and reach the frontend at `http://localhost:5173` within 10 minutes, excluding dependency download time.
- **SC-002**: In a clean-environment verification, 100% of attempts with all required configuration values present start the local MongoDB service and application successfully.
- **SC-003**: In validation checks, 100% of attempts with each required environment value missing or blank, or with a `SESSION_SECRET` shorter than 32 characters, stop before serving the application and identify the invalid variable without displaying its value.
- **SC-004**: In a restart verification, data written to the local MongoDB service remains available after a normal service restart in 100% of test runs.
- **SC-005**: A contributor who follows the documented setup flow can distinguish Docker-unavailable, configuration-invalid, and frontend-unreachable failures from a successful startup using the provided feedback.

## Assumptions

- Contributors have permission to install and run Docker and npm dependencies on their local machine.
- This feature supports local development only; production hosting, shared development databases, database backups, and data migration are out of scope.
- Contributors supply an appropriate local database name and a unique session secret of at least 32 characters in `.env`; `.env.example` contains placeholders only.
- The MongoDB image digest is selected from an approved MongoDB 7.0 image and updated deliberately when the project adopts a new image version.
- The API server entry point is the single authority for required environment validation; `npm run dev` starts that server but does not duplicate its validation logic.
- Docker-unavailable feedback is verified through a mocked Docker-command boundary so the test does not depend on changing the host Docker daemon state.
- MongoDB volume persistence is verified by a Docker Compose integration test only in Docker-capable environments; the standard unit-test suite remains Docker-independent.
- The repository continues to provide the `npm run dev` command as the supported local development entry point.
- The required Vite frontend address is `http://localhost:5173`; resolving a host-port conflict is outside the standard success path but must be identifiable to the contributor.