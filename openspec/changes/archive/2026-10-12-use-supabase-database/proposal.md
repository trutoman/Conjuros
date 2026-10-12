## Why

The project's standard database is moving from a local PostgreSQL container to a hosted Supabase (PostgreSQL) project. A single remote database removes the local `db` container, its volume and port `5432` conflicts, and gives every environment the same persistent data.

## What Changes

- Remove the local `db` and `cloudbeaver` services from `docker-compose.yml`; the `api` container reads `DATABASE_URL` directly from `.env` and no longer depends on a local database.
- Add optional TLS settings for the API's PostgreSQL connection (`DATABASE_SSL`, `DATABASE_SSL_CA`) so the API and the migration runner can reach Supabase, which requires TLS.
- Standardize on Supabase's Session pooler connection string (IPv4-compatible, supports migrations) as the documented `DATABASE_URL`.
- Add a migration that enables Row Level Security on every application table so the tables are not readable through Supabase's public Data API; the API keeps full access through its direct database role.
- Simplify `npm run dev` / `dev:db`: no Docker database to start; only free ports `3000`/`5173` and start API + frontend.
- Remove `POSTGRES_*` variables and the Docker persistence test (`npm run test:docker`); repository behavior stays covered by the PGlite tests.
- Update `.env.example` (placeholders only) and the README with where to obtain each Supabase value and how to put it in `.env`.
- **BREAKING**: local development and the container stack require a reachable Supabase database; existing local PostgreSQL data is not migrated and the `postgres_data` volume becomes unused.

## Capabilities

### New Capabilities
- `remote-database`: Connecting the API and migrations to a hosted Supabase PostgreSQL database over TLS, and keeping application tables private from Supabase's public Data API.

### Modified Capabilities
- `container-stack`: the stack no longer contains a `db` container; `api` and `web` connect to the remote database via `DATABASE_URL`.
- `developer-environment`: setup, onboarding and verification no longer rely on a local database container or the Docker persistence test.

## Impact

- Code: `src/api/db/client.ts`, `src/api/config/environment.ts`, `src/api/db/schema.ts`, a new `drizzle/0003_*.sql` migration, `drizzle.config.ts`.
- Infrastructure: `docker-compose.yml`, `package.json` scripts, `scripts/check-ports.mjs` usage, removal of `src/tests/integration/docker-compose.test.ts` and `vitest.docker.config.ts`.
- Docs/config: `.env.example`, `README.md`, `AGENTS.md`.
- Tests: environment parsing and TLS option tests; RLS migration check under PGlite.
- Security: the Supabase database password must live only in the untracked `.env`.
