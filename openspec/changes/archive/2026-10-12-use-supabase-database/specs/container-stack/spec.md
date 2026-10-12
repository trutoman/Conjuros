## MODIFIED Requirements

### Requirement: Stack runs in three connected containers
The system SHALL run as a Docker Compose stack of two application services — `api` (Express) and `web` (Nginx serving the built frontend) — connected on a shared network so services resolve each other by service name. The database is external and is not part of the stack.

#### Scenario: Full stack starts with one command
- **WHEN** a contributor runs `docker compose up -d --build` with a valid `.env`
- **THEN** the `conjuros-api` and `conjuros-web` containers start and the frontend is reachable at `http://localhost:5173`

#### Scenario: Startup ordering is health-gated
- **WHEN** the stack starts
- **THEN** the `web` container waits for the `api` container to report healthy before starting

#### Scenario: No local database container
- **WHEN** the Compose file is inspected
- **THEN** it defines no `db` or database-administration service and no PostgreSQL volume

### Requirement: API connects to MongoDB over the stack network
The `api` container SHALL connect to the remote PostgreSQL database using the `DATABASE_URL` and `DATABASE_SSL` values passed from `.env`.

#### Scenario: Remote database connection
- **WHEN** the `api` container starts with a valid `.env`
- **THEN** it connects to the database named by `DATABASE_URL` and serves the API once migrations are applied

#### Scenario: Missing database URL
- **WHEN** `docker compose up` runs without `DATABASE_URL` in `.env`
- **THEN** Compose fails with a `DATABASE_URL is required` error before starting the `api` container
