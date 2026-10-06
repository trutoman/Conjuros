## RENAMED Requirements

- FROM: ### Requirement: API connects to MongoDB over the stack network
- TO: ### Requirement: API connects to PostgreSQL over the stack network

## MODIFIED Requirements

### Requirement: Stack runs in three connected containers
The system SHALL run as a Docker Compose stack of exactly three application services — `db` (PostgreSQL), `api` (Express), and `web` (Nginx serving the built frontend) — connected on a shared network so services resolve each other by service name.

#### Scenario: Full stack starts with one command
- **WHEN** a contributor runs `docker compose up -d --build` with a valid `.env`
- **THEN** the `conjuros-db`, `conjuros-api`, and `conjuros-web` containers start and the frontend is reachable at `http://localhost:5173`

#### Scenario: Startup ordering is health-gated
- **WHEN** the stack starts
- **THEN** the `api` container waits for the `db` container to report healthy, and the `web` container waits for the `api` container to report healthy, before starting
- **AND** the `db` container reports healthy only once PostgreSQL accepts connections

### Requirement: API connects to PostgreSQL over the stack network
The `api` container SHALL connect to PostgreSQL using the `db` service name within the Compose network, taking the database name and credentials from the Compose project's `.env` (`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`), requiring no host-port dependency for its primary connection. PostgreSQL data SHALL be kept in a named volume so it survives container recreation, and the database port SHALL be published to the host loopback interface only.

#### Scenario: Internal database connection
- **WHEN** the `api` container starts in the stack
- **THEN** it connects to PostgreSQL at host `db` on port `5432`, applies pending database migrations, and serves the API once the connection is established

#### Scenario: Host access to PostgreSQL
- **WHEN** the stack is running
- **THEN** PostgreSQL is also reachable on the host at `localhost:5432` for external tooling and tests
- **AND** it is not reachable through the host's other network interfaces

#### Scenario: Data survives a database container restart
- **WHEN** the `db` container is restarted or recreated
- **THEN** previously stored data is still available afterwards

### Requirement: Container images are defined for API and web
The project SHALL define image builds that produce a runnable API container and a runnable frontend container from source.

#### Scenario: API image
- **WHEN** the API image is built from `Dockerfile.api`
- **THEN** it installs dependencies, includes the database migrations needed to bootstrap an empty database, runs the API server entry point, and exposes port `3000`

#### Scenario: Web image
- **WHEN** the web image is built from `Dockerfile.web`
- **THEN** it produces the production Vite bundle, applies the Nginx configuration, and serves the bundle on port `80`
