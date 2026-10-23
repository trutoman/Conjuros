# Container Stack

## Purpose

Defines the containerized running model of Conjuros: a Compose stack of two connected containers (`api`, `web`) that communicate over a shared network to serve the frontend and API on a single origin, backed by an external Supabase PostgreSQL database.

## Requirements

### Requirement: Stack runs in two connected containers
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

### Requirement: API connects to Supabase PostgreSQL
The `api` container SHALL connect to the remote PostgreSQL database using the `DATABASE_URL` and `DATABASE_SSL` values passed from `.env`.

#### Scenario: Remote database connection
- **WHEN** the `api` container starts with a valid `.env`
- **THEN** it connects to the database named by `DATABASE_URL` and serves the API once migrations are applied

#### Scenario: Missing database URL
- **WHEN** `docker compose up` runs without `DATABASE_URL` in `.env`
- **THEN** Compose fails with a `DATABASE_URL is required` error before starting the `api` container

### Requirement: Frontend and API are served on a single origin
The `web` container SHALL serve the built single-page application and forward `/api/*` requests to the API upstream named by the `API_UPSTREAM` environment variable so the browser communicates with one host and port. The image SHALL default `API_UPSTREAM` to `localhost:3000` (Azure Container Apps, where containers of a replica share a network), and the Compose stack SHALL override it with `api:3000`.

#### Scenario: API proxying with SPA fallback
- **WHEN** a browser requests `/api/auth/me` or an application route at `http://localhost:5173`
- **THEN** API requests are proxied to the `api` container and unknown application routes are answered with `index.html`

#### Scenario: Session cookie continuity
- **WHEN** a user authenticates through the `web` origin
- **THEN** subsequent API requests carry the `conjuros_session` cookie without any cross-origin handling

#### Scenario: Default upstream for Azure
- **WHEN** the web image starts without `API_UPSTREAM` set
- **THEN** Nginx proxies `/api/*` to `localhost:3000`

#### Scenario: Compose upstream override
- **WHEN** the stack starts through `docker compose`
- **THEN** the `web` service runs with `API_UPSTREAM=api:3000`

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

### Requirement: Azure rollout targets the renamed API container
The deploy workflow SHALL update the API container of the Container App using the container name `conjuros-api` and the web container using `conjuros-web`.

#### Scenario: Rollout after rename
- **WHEN** the deploy workflow runs on a push to `main`
- **THEN** it updates the containers `conjuros-api` and `conjuros-web` with images tagged with the commit SHA

### Requirement: External URLs are validated before the API touches the database
The API SHALL validate `SUPABASE_URL`, `CORS_ORIGIN`, and `APP_BASE_URL` as absolute `http:` or `https:` URLs while parsing its environment. Values that lack a well-formed scheme or use another protocol SHALL be rejected with an error that names the invalid variable, and validation SHALL complete before the database client is created and before migrations are applied. Absent optional URLs SHALL keep their current defaults and behavior.

#### Scenario: Malformed scheme is rejected before migrations
- **WHEN** `SUPABASE_URL` is set to `ttps://project.supabase.co`
- **THEN** the API fails to start with an error naming `SUPABASE_URL` and no migration is applied

#### Scenario: Non-HTTP protocol is rejected
- **WHEN** `APP_BASE_URL` is set to `ftp://conjuros.app`
- **THEN** the API fails to start with an error naming `APP_BASE_URL`

#### Scenario: Valid URLs are accepted
- **WHEN** `SUPABASE_URL`, `CORS_ORIGIN`, and `APP_BASE_URL` are absolute `http:` or `https:` URLs
- **THEN** the API starts normally

#### Scenario: Unset optional URLs keep current behavior
- **WHEN** `SUPABASE_URL`, `CORS_ORIGIN`, and `APP_BASE_URL` are unset
- **THEN** the API starts with no Storage configuration and the existing CORS and base URL defaults