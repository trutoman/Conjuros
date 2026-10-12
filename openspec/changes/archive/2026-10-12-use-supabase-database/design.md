## Context

The API uses `pg` + Drizzle (`src/api/db/client.ts`) and runs committed migrations at startup (`src/api/db/migrate.ts`). `docker-compose.yml` currently provides `db` (PostgreSQL 18), `cloudbeaver`, `api` and `web`; `npm run dev` starts the `db` container first. Tests use PGlite and are Docker-independent, except `npm run test:docker`, which exercises the `db` service.

Supabase is a managed PostgreSQL that requires TLS, offers a direct connection (IPv6 only on the free plan), a Session pooler (port 5432, IPv4, session semantics) and a Transaction pooler (port 6543, no prepared statements). It also exposes `public` tables through its REST Data API unless Row Level Security is enabled.

## Goals / Non-Goals

**Goals:**
- Make Supabase the only database for dev and containers, configured purely through `.env`.
- Keep the DB layer (repositories, services, tests) unchanged.
- Prevent accidental public exposure of data through Supabase's Data API.

**Non-Goals:**
- Using Supabase Auth, Storage, Realtime or the supabase-js client; auth stays JWT-cookie based.
- Migrating existing local data.
- Separate Supabase projects per environment (one project, can be split later via different `DATABASE_URL`s).

## Decisions

- **Session pooler URL as the standard `DATABASE_URL`.** It is IPv4-compatible and supports the multi-statement migrations and prepared statements used by `pg`/Drizzle. Direct connection fails on IPv4-only networks (including many Docker setups); the Transaction pooler breaks prepared statements. Format: `postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres`.
- **`DATABASE_SSL` (`disable` | `require`) plus optional `DATABASE_SSL_CA`.** Parsed in `environment.ts`, converted to a `pg` `ssl` option in `createDatabase`. `require` encrypts with `rejectUnauthorized: false` unless a CA file is provided, in which case the certificate is verified. Default `disable` keeps tests and any plain local database working. Alternative `?sslmode=` in the URL was rejected: `pg` semantics for it changed between versions and it cannot carry a CA.
- **Same settings for `drizzle-kit`.** `drizzle.config.ts` builds its `ssl` credential from the same variables so `npm run db:migrate` works against Supabase.
- **RLS migration.** A new Drizzle migration runs `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` on all six tables (`users`, `password_reset_tokens`, `collection_items`, `tags`, `tag_categories`, `themes`), and the schema declares `.enableRLS()` so `db:generate` does not drift. No policies are created: `anon`/`authenticated` get nothing, while the `postgres` role from the pooler URL bypasses RLS. Under PGlite the statements are plain PostgreSQL and run unchanged.
- **Remove local DB tooling.** Drop `db` and `cloudbeaver` from Compose, `POSTGRES_*` vars, the `postgres_data` volume, `vitest.docker.config.ts`, `src/tests/integration/docker-compose.test.ts` and the `test:docker` script. `dev:db` keeps port-checking only (renamed behavior documented in README); `docker:check` stays since the API/web still run in Docker.
- **Compose requires `DATABASE_URL`** via `${DATABASE_URL:?DATABASE_URL is required}`; TLS vars default to empty.

## Risks / Trade-offs

- Offline development is no longer possible → accepted by the user; `npm run check` stays offline-capable.
- `require` without CA does not authenticate the server (MITM risk) → documented; optional CA path provides verification.
- Free-tier projects pause after inactivity → first request fails until resumed; documented in troubleshooting.
- Dev and any other consumer share one remote database → destructive actions affect real data; document using a separate Supabase project for experiments.
- Database password in `DATABASE_URL` must be URL-encoded if it contains special characters → documented; `.env` is untracked and `.env.example` holds only placeholders.
