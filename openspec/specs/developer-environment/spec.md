# Developer Environment

## Purpose

This capability covers the local development environment and contributor workflow needed to run and validate the project.

## Requirements

### Requirement: Repeatable local development setup using Docker and Supabase
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

### Requirement: Development uses a database isolated from production
The documented development workflow SHALL run the API against a dedicated DEV PostgreSQL database (a separate Supabase project) that has the same schema as production through the committed migrations and contains no production data. Production credentials SHALL exist only in the production deployment configuration and SHALL NOT be placed in a local `.env`.

#### Scenario: DEV database is separate
- **WHEN** a contributor follows the documented setup
- **THEN** `DATABASE_URL` in `.env` points to the DEV Supabase project and not to the production project

#### Scenario: Same schema as production
- **WHEN** the API starts against an empty DEV database
- **THEN** the committed migrations are applied and the schema matches production

#### Scenario: Migrations are tried on DEV first
- **WHEN** a change includes a new migration
- **THEN** the documented release routine requires applying it to the DEV database and testing before merging to `main`

### Requirement: Checks gate deployment
The repository SHALL run lint, tests, and build (`npm run check`) on pull requests, and the production deploy workflow SHALL NOT build or roll out images unless the same checks pass.

#### Scenario: Pull request checks
- **WHEN** a pull request is opened or updated
- **THEN** a workflow runs `npm run check` and reports the result

#### Scenario: Failing checks block deployment
- **WHEN** a push to `main` fails `npm run check`
- **THEN** the deploy job does not run and no new revision is rolled out
