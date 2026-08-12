## Purpose

Defines the containerized running model of Conjuros: a Compose stack of three connected containers (`db`, `api`, `web`) that communicate over a shared network to serve the frontend and API on a single origin.

## ADDED Requirements

### Requirement: Stack runs in three connected containers
The system SHALL run as a Docker Compose stack of exactly three application services — `db` (MongoDB), `api` (Express), and `web` (Nginx serving the built frontend) — connected on a shared network so services resolve each other by service name.

#### Scenario: Full stack starts with one command
- **WHEN** a contributor runs `docker compose up -d --build` with a valid `.env`
- **THEN** the `conjuros-db`, `conjuros-api`, and `conjuros-web` containers start and the frontend is reachable at `http://localhost:5173`

#### Scenario: Startup ordering is health-gated
- **WHEN** the stack starts
- **THEN** the `api` container waits for the `db` container to report healthy, and the `web` container waits for the `api` container to report healthy, before starting

### Requirement: API connects to MongoDB over the stack network
The `api` container SHALL connect to MongoDB using the `db` service name within the Compose network, requiring no host-port dependency for its primary connection.

#### Scenario: Internal database connection
- **WHEN** the `api` container starts in the stack
- **THEN** it connects to MongoDB at `mongodb://db:27017` and serves the API once the connection is established

#### Scenario: Host access to MongoDB
- **WHEN** the stack is running
- **THEN** MongoDB is also reachable on the host at `localhost:27017` for external tooling and tests

### Requirement: Frontend and API are served on a single origin
The `web` container SHALL serve the built single-page application and forward `/api/*` requests to the `api` container so the browser communicates with one host and port.

#### Scenario: API proxying with SPA fallback
- **WHEN** a browser requests `/api/auth/me` or an application route at `http://localhost:5173`
- **THEN** API requests are proxied to the `api` container and unknown application routes are answered with `index.html`

#### Scenario: Session cookie continuity
- **WHEN** a user authenticates through the `web` origin
- **THEN** subsequent API requests carry the `conjuros_session` cookie without any cross-origin handling

### Requirement: Container images are defined for API and web
The project SHALL define image builds that produce a runnable API container and a runnable frontend container from source.

#### Scenario: API image
- **WHEN** the API image is built from `Dockerfile.api`
- **THEN** it installs dependencies, runs the API server entry point, and exposes port `3000`

#### Scenario: Web image
- **WHEN** the web image is built from `Dockerfile.web`
- **THEN** it produces the production Vite bundle, applies the Nginx configuration, and serves the bundle on port `80`

### Requirement: API environment configuration is container-aware
The API SHALL accept a configurable CORS origin and SHALL treat an absent or empty admin email as no admin email, so Compose environment interpolation never invalidates startup.

#### Scenario: Configurable CORS origin
- **WHEN** `CORS_ORIGIN` is set in the environment
- **THEN** the API allows that origin for credentialed cross-origin requests
- **AND WHEN** `CORS_ORIGIN` is unset
- **THEN** the API defaults to allowing `http://localhost:5173`

#### Scenario: Empty admin email is accepted
- **WHEN** `ADMIN_EMAIL` is empty or unset
- **THEN** the API starts with no admin email instead of failing environment validation