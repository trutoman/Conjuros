## MODIFIED Requirements

### Requirement: Repeatable local development setup using Docker and MongoDB
The system SHALL provide a repeatable local development setup that runs against the remote Supabase database: a full-stack Docker Compose start (`api` and `web` containers) and an npm-based hot-reload variant that starts the API and frontend on the host.

#### Scenario: Full stack start
- **WHEN** a contributor runs `docker compose up -d --build` with a valid `.env`
- **THEN** the stack builds and the frontend is available at `http://localhost:5173`

#### Scenario: npm development start
- **WHEN** a contributor runs `npm run dev` with a valid `.env`
- **THEN** ports `3000` and `5173` are verified free and the API and Vite dev server start without starting any database container

### Requirement: Contributor onboarding documented for local setup and validation
Contributor onboarding SHALL document the Supabase-first workflow: which Supabase values to obtain (Session pooler connection string and database password), how to set `DATABASE_URL`, `DATABASE_SSL` and `SESSION_SECRET` in `.env`, ports needed, and troubleshooting.

#### Scenario: Env file is required before Compose start
- **WHEN** a contributor runs `docker compose up` without `.env` or without a `SESSION_SECRET` of at least 32 characters
- **THEN** Compose fails with a `SESSION_SECRET is required` error before the `api` container starts

#### Scenario: Supabase setup is documented
- **WHEN** a contributor follows the documented setup
- **THEN** the README explains where to copy the Session pooler connection string in the Supabase dashboard, how to place it in `.env`, and that `.env` must never be committed

### Requirement: Local verification steps independent of runtime feature changes
The project SHALL support local verification (`npm run check`) that needs neither Docker nor network access to Supabase, using an in-process PostgreSQL engine for repository tests.

#### Scenario: Check runs offline
- **WHEN** `npm run check` runs on a machine without Docker and without access to Supabase
- **THEN** lint, tests and build complete using only in-memory and in-process databases
