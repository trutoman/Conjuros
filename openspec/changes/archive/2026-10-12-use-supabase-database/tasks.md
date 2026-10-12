## 1. Configuration

- [x] 1.1 Extend `src/api/config/environment.ts` with optional `DATABASE_SSL` (`disable` | `require`, default `disable`, blank treated as unset) and optional `DATABASE_SSL_CA` (file path); expose them on the parsed environment
- [x] 1.2 Extend `src/tests/api/environment.test.ts`: defaults, `require`, CA path, and invalid `DATABASE_SSL` throwing the named error

## 2. Database connection

- [x] 2.1 Update `createDatabase` in `src/api/db/client.ts` to accept an SSL option (`require` → encrypted; with CA file → verified) and pass it to `pg.Pool`; wire it in `src/api/server.ts`
- [x] 2.2 Update `drizzle.config.ts` to apply the same `DATABASE_SSL`/`DATABASE_SSL_CA` settings to `dbCredentials`
- [x] 2.3 Add unit tests for the SSL option builder (disabled, require, require + CA)

## 3. Row Level Security

- [x] 3.1 Add `.enableRLS()` to all six tables in `src/api/db/schema.ts` and run `npm run db:generate` to produce the `drizzle/0003_*.sql` migration
- [x] 3.2 Add a PGlite test asserting every application table has `relrowsecurity = true` and repositories still work after migrations

## 4. Remove local database tooling

- [x] 4.1 Remove `db` and `cloudbeaver` services, the `postgres_data`/`cloudbeaver_workspace` volumes and the `depends_on: db` from `docker-compose.yml`; pass `DATABASE_URL` (required) and `DATABASE_SSL` to `api`
- [x] 4.2 If `DATABASE_SSL_CA` is used in Docker, document that the Docker `api` container uses `DATABASE_SSL=require` without CA verification (`DATABASE_SSL_CA` is for host runs)
- [x] 4.3 Update `package.json`: `dev:db` only frees/checks ports (no Docker database), remove `test:docker`; delete `vitest.docker.config.ts` and `src/tests/integration/docker-compose.test.ts`
- [x] 4.4 Update `.env.example`: remove `POSTGRES_*`, document Supabase `DATABASE_URL` placeholder, `DATABASE_SSL=require`, `DATABASE_SSL_CA` (commented); placeholders only

## 5. Documentation

- [x] 5.1 Rewrite README database sections: where to find the Session pooler connection string and database password in the Supabase dashboard (Connect → Session pooler; Project Settings → Database), copy to `.env`, URL-encode special characters, expected ports, free-plan pause troubleshooting
- [x] 5.2 Update `AGENTS.md` commands/architecture notes (no local db container, no `test:docker`)

## 6. Verification

- [x] 6.1 Run `npm run check` (lint, test, build)
- [x] 6.2 With the user's real `.env`, run `npm run db:migrate`, then `npm run dev` and confirm register/login works and tables show RLS enabled in the Supabase dashboard
- [x] 6.3 Confirm `docker compose config` shows only `api` and `web`, then `docker compose up -d --build` serves the app at `http://localhost:5173`
