## RENAMED Requirements

- FROM: ### Requirement: Repeatable local development setup using Docker and MongoDB
- TO: ### Requirement: Repeatable local development setup using Docker and PostgreSQL

## MODIFIED Requirements

### Requirement: Repeatable local development setup using Docker and PostgreSQL
The system SHALL provide a repeatable local development setup using Docker Compose that builds and runs the full application in three containers (`db`, `api`, and `web`), with a documented fallback that runs only PostgreSQL in Docker for npm-based hot-reload development.

#### Scenario: Full stack start
- **WHEN** a contributor runs `docker compose up -d --build` with a valid `.env`
- **THEN** the stack builds and the frontend is available at `http://localhost:5173`

#### Scenario: Database-only start for npm development
- **WHEN** a contributor runs `docker compose up -d db`
- **THEN** PostgreSQL is available at `localhost:5432` so the contributor can run `npm install` and `npm run dev`
- **AND** the API applies pending database migrations when it starts

### Requirement: Contributor onboarding documented for local setup and validation
Contributor onboarding SHALL document the container-first workflow (env file before Compose start, three-container build, ports available, and troubleshooting), the npm-based development variant, the from-scratch database, and validation commands.

#### Scenario: Env file is required before Compose start
- **WHEN** a contributor runs `docker compose up` without `.env`, without `SESSION_SECRET`, or without `POSTGRES_PASSWORD`
- **THEN** Compose fails with a `SESSION_SECRET is required` or `POSTGRES_PASSWORD is required` error before the `api` container starts

#### Scenario: Container-first workflow is documented
- **WHEN** a contributor follows the documented setup
- **THEN** the README explains creating `.env` from `.env.example` (including the PostgreSQL credentials and `DATABASE_URL`), requiring ports `5432`, `3000`, and `5173`, and building the whole stack with `docker compose up -d`

#### Scenario: Fresh database is documented
- **WHEN** a contributor reads the setup instructions
- **THEN** the README states that the database starts empty with no MongoDB data import
- **AND** it explains how to reset the database volume and how `ADMIN_EMAIL` takes effect

### Requirement: Local verification steps independent of runtime feature changes
The project SHALL support local verification steps that do not depend on runtime feature changes, including a Docker-based persistence check that targets the `db` service and repository behavior tests that run without Docker.

#### Scenario: Docker persistence test targets the db service
- **WHEN** `npm run test:docker` runs on a Docker-capable machine with port `5432` free
- **THEN** the test starts the `db` service in an isolated Compose project, writes a record, restarts the service, and verifies the record remains

#### Scenario: Repository behavior is verified without Docker
- **WHEN** `npm run test` runs on a machine where Docker is unavailable
- **THEN** the persistence layer's behavior tests run against an in-process PostgreSQL engine with the committed migrations applied
- **AND** their outcome does not depend on Docker

## ADDED Requirements

### Requirement: Schema changes are authored as generated migrations
Contributors SHALL change the database schema by editing the schema definition and generating a versioned SQL migration with `npm run db:generate`. Generated migrations SHALL be committed with the change, and `npm run db:migrate` SHALL apply pending migrations to the database named by `DATABASE_URL`.

#### Scenario: Generate a migration after a schema edit
- **WHEN** a contributor changes the schema definition and runs `npm run db:generate`
- **THEN** a new numbered SQL migration appears in the migrations folder

#### Scenario: Apply migrations explicitly
- **WHEN** a contributor runs `npm run db:migrate` with a valid `DATABASE_URL`
- **THEN** pending migrations are applied and already-applied migrations are skipped

#### Scenario: A schema edit without a migration fails verification
- **WHEN** the schema definition contains a column that no committed migration creates
- **THEN** the repository behavior tests fail because they run against a database built only from the committed migrations
