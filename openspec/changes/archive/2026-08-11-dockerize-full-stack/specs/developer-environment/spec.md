## MODIFIED Requirements

### Requirement: Repeatable local development setup using Docker and MongoDB
The system SHALL provide a repeatable local development setup using Docker Compose that builds and runs the full application in three containers (`db`, `api`, and `web`), with a documented fallback that runs only MongoDB in Docker for npm-based hot-reload development.

#### Scenario: Full stack start
- **WHEN** a contributor runs `docker compose up -d --build` with a valid `.env`
- **THEN** the stack builds and the frontend is available at `http://localhost:5173`

#### Scenario: Database-only start for npm development
- **WHEN** a contributor runs `docker compose up -d db`
- **THEN** MongoDB is available at `mongodb://localhost:27017` so the contributor can run `npm install` and `npm run dev`

### Requirement: Contributor onboarding documented for local setup and validation
Contributor onboarding SHALL document the container-first workflow (env file before Compose start, three-container build, ports available, and troubleshooting), the npm-based development variant, and validation commands.

#### Scenario: Env file is required before Compose start
- **WHEN** a contributor runs `docker compose up` without `.env` or without a `SESSION_SECRET` of at least 32 characters
- **THEN** Compose fails with a `SESSION_SECRET is required` error before the `api` container starts

#### Scenario: Container-first workflow is documented
- **WHEN** a contributor follows the documented setup
- **THEN** the README explains creating `.env` from `.env.example`, requiring ports `27017`, `3000`, and `5173`, and building the whole stack with `docker compose up -d`

### Requirement: Local verification steps independent of runtime feature changes
The project SHALL support local verification steps that do not depend on runtime feature changes, including a Docker-based persistence check that targets the `db` service.

#### Scenario: Docker persistence test targets the db service
- **WHEN** `npm run test:docker` runs on a Docker-capable machine with port `27017` free
- **THEN** the test starts the `db` service in an isolated Compose project, writes a record, restarts the service, and verifies the record remains