## Context

Motivation and scope are in proposal.md; observable requirements are in the specs (`postgres-persistence` and the modified capabilities). This document covers how to build it.

- Layers today: Controllers → Services → Repositories → MongoDB. Every aggregate has a repository interface with an `InMemory*` implementation (used by all service and API tests through `createTestApp()`) and a `Mongo*` implementation on the `mongodb` driver. `repositories/connection.ts` memoizes a `MongoClient`; `server.ts` wires the Mongo repositories after `parseApiEnvironment` (`MONGODB_URI`, `MONGODB_DATABASE`).
- Stored shapes are the `Stored*` interfaces exported by the repositories: app-generated string ids (`randomUUID()`, but theme seeds use fixed ids such as `theme-light`), ISO-8601 strings for timestamps, arrays for item tags / related items / category membership, nested objects for theme tokens. The code creates no indexes or constraints.
- `@conjuros/contracts` holds every Zod schema, is shared with the browser bundle and never exposes persistence-only fields. AGENTS.md requires: only repositories touch the datastore, services stay persistence-agnostic, `npm run check` stays Docker-independent.
- Versions checked on the npm registry on 2026-09-29: `drizzle-orm` latest `0.45.3` (`1.0` is only `rc`), `drizzle-kit` latest `0.31.11`, `drizzle-zod` `0.8.3`, `pg` `8.23.0`, `@electric-sql/pglite` `0.5.8` (embeds PostgreSQL 18.3), project `zod` `3.25.76`.
- A throwaway spike against those versions confirmed the assumptions marked "spike-verified" below. Docker is not available in the current WSL environment, so anything that needs the real `pg` driver is covered by the Docker test on Docker-capable machines.

## Goals / Non-Goals

**Goals:**
- Swap the datastore behind the existing repository interfaces so services, controllers, routes, frontend and contracts do not change.
- Move integrity rules that are cheap to express in SQL (uniqueness, foreign keys, kind/field consistency, single default theme) into the schema.
- Test real SQL and the committed migrations in `npm run test`, without Docker.
- Make schema evolution reproducible: generated, committed, automatically applied migrations.

**Non-Goals:**
- Importing or converting MongoDB data.
- Relational remodeling of item tags, related items and category membership (junction tables, `tags.category_id`). Arrays keep exact parity with the current interfaces; see D4.
- Changing domain behavior: `nextOrder` stays `count + 1`, reorder still bumps `updatedAt` on every row of the owner, name-plus-category tag uniqueness stays a service rule, the legacy-shape read normalization in `ThemesService` and the startup-time admin grant stay as they are.
- Search indexing (`pg_trgm`, GIN, full-text), Drizzle relational queries, `drizzle-seed`, Drizzle 1.0, a Zod 4 migration.
- Production concerns beyond a single API instance (migration locking, TLS to the database, pool tuning, graceful shutdown).

## Decisions

### D1. Drizzle ORM 0.45 with node-postgres (`pg`)

Use `drizzle-orm@^0.45.3`, `drizzle-kit@^0.31.11` and `pg@^8`, with `casing: 'snake_case'` in both `drizzle()` and `drizzle.config.ts` so TypeScript keys stay camelCase (`ownerId`) and columns are snake_case (`owner_id`).

- Alternative: Drizzle `1.0.0-rc.x`. Rejected: it is not `latest`, changes the migration folder layout and relations API, and a foundation layer should not start on a release candidate. Upgrading is a separate change confined to `src/api/db` and the repositories.
- Alternative: `postgres` (postgres.js). Also supported by Drizzle, but `pg` is the most widely deployed driver and needs no extra configuration for drizzle-kit.

### D2. Zod stays in `@conjuros/contracts`; `drizzle-zod` is not adopted

The request left this open ("if you recommend it"). Recommendation: do not adopt it now.

1. Version mismatch (verified in the published package): `drizzle-zod@0.8.3` builds its schemas from `zod/v4`, while the contracts use the Zod 3 API from the root `zod` export (3.25.76). Zod 3 and Zod 4 schemas cannot be composed, so adoption would first require moving every contract to Zod 4.
2. The contracts are the API boundary shared with the browser. They carry rules that generated table schemas cannot express (normalizing transforms, the `kind` discriminated union with strict variants, filename patterns, cross-field `superRefine` checks) and they must hide persistence-only fields (`ownerId`, `passwordHash`, normalized names). Generated row schemas would be a second, drifting set of shapes.
3. What generated schemas would add is already covered: Drizzle infers row types (`$inferSelect`), repositories map rows to the existing `Stored*` interfaces, and `ThemesService` already re-validates stored themes with `themeSchema` on every read.

To stop the database and Zod vocabularies from drifting, enum columns are built from contract constants (spike-verified): `pgEnum('item_kind', itemKinds)`, `pgEnum('user_role', roleSchema.options)`, `pgEnum('theme_preference', themePreferenceSchema.options)`. Revisit `drizzle-zod` (or the `drizzle-orm/zod` module of Drizzle 1.0) when the contracts move to Zod 4 and there is a concrete need to validate rows, for example the JSONB theme columns.

### D3. Layout and repository seam

- `src/api/db/schema.ts`: tables, enums, indexes, constraints. `src/api/db/client.ts`: `createDatabase(url)` returning `{ db, pool }` and the shared `Database` type. `src/api/db/migrate.ts`: `runMigrations(db)`. `src/api/db/sqlstate.ts`: helper to read SQLSTATE codes. `drizzle/`: generated SQL and metadata. `drizzle.config.ts` at the repository root.
- Each `*.repository.ts` keeps its interface, its exported `Stored*` types and its `InMemory*` class; `Mongo*` becomes `Postgres*Repository` taking a `Database`. Row-to-`Stored*` mapping (Date to ISO string, NULL to `null`, JSONB to typed objects) lives inside each repository, so no Drizzle type reaches a service.
- `Database` is `PgDatabase<PgQueryResultHKT, typeof schema>`. Spike-verified with TypeScript 5.9: both `NodePgDatabase` and `PgliteDatabase` are assignable to it, so tests inject PGlite into the same repository classes that production wires to `pg`.
- `repositories/connection.ts` is deleted. The pool registers an `error` listener so a dropped idle connection cannot crash the process.

### D4. Data model

| Table | Columns and constraints |
| --- | --- |
| `users` | `id` text PK; `email` text NOT NULL UNIQUE; `password_hash` text NOT NULL; `theme` enum (`light`, `dark`) NOT NULL default `light`; `role` enum (`user`, `admin`) NOT NULL default `user`; `created_at` timestamptz NOT NULL |
| `collection_items` | `id` text PK; `owner_id` FK → `users` ON DELETE CASCADE; `kind` enum NOT NULL; `title` NOT NULL; `description` NULL; `tags` text[] NOT NULL default `{}` (normalized tag names); `related_item_ids` text[] NOT NULL default `{}`; `position` integer NOT NULL (TS key `order`); `command`, `url`, `content`, `filename` NULL; `created_at`, `updated_at` timestamptz NOT NULL. CHECK: `spell` ⇒ only `command`; `web-link` ⇒ only `url`; `markdown`/`file` ⇒ `content` (and optional `filename`) and no `command`/`url`. Index `(owner_id, position)` |
| `tags` | `id` PK; `owner_id` FK cascade; `tag_name`, `tag_name_normalized` NOT NULL; `description` NOT NULL default `''`; `color` NOT NULL; `position`; timestamps. Index `(owner_id, tag_name_normalized)`, deliberately not unique; index `(owner_id, position)` |
| `tag_categories` | `id` PK; `owner_id` FK cascade; `name`, `name_normalized` NOT NULL; `description` NOT NULL default `''`; `tag_ids` text[] NOT NULL default `{}`; `position`; timestamps. UNIQUE `(owner_id, name_normalized)` |
| `themes` | `id` text PK; `name` UNIQUE NOT NULL; `label` NOT NULL; `colors`, `font_sizes`, `fonts`, `icon_assets`, `kind_colors` jsonb NOT NULL typed with the contract types; `tag_color_palette` text[] NOT NULL; `is_default` boolean NOT NULL default false; timestamps. Partial unique index on `(is_default) WHERE is_default` |

Notes and alternatives:
- `text` ids, not `uuid`. Ids reach the API as arbitrary strings (contracts allow 1–128 characters) and seed themes use non-UUID ids. A `uuid` column would turn an unknown id into a driver error (HTTP 500) instead of a clean not-found or validation error. Ids stay app-generated with `randomUUID()`.
- `timestamptz` with `mode: 'date'`. Repositories convert with `toISOString()` because the contracts require ISO-8601 UTC (`z.string().datetime()`), which the driver's string mode would not produce.
- `position` avoids the reserved word `order` while the TS key and the API field stay `order`.
- Arrays are kept for item tags, related items and membership. Alternative: junction tables (`item_tags`, `item_relations`) and `tags.category_id` give referential integrity and would make the tag rename/delete cascades unnecessary, but they change the repository interfaces and service logic. That is a domain redesign, so it is a possible follow-up, not part of a datastore swap.
- No unique constraint on tag names: the tag rules allow the same name in different categories (conflict only on name plus category, checked in `TagsService`). A database constraint would change behavior.
- JSONB for the theme token objects: they are admin-edited documents with fixed shapes; a column per token would be over-normalized.
- The kind CHECK, the single-default partial index and the FKs are the "domain rules that are cheap in SQL". All were spike-verified: they generate cleanly with drizzle-kit and reject bad rows with SQLSTATE `23514`, `23505` and `23503`.

### D5. Query translation (parity with the Mongo behavior)

- Every owner-scoped query carries `owner_id = $1`.
- Search: `ILIKE '%term%'` over `title`, `description`, `command`, `url`, `content` plus `EXISTS (SELECT 1 FROM unnest(tags) t WHERE t ILIKE …)`. `\`, `%` and `_` in the term are escaped and the pattern is a bound parameter (the Mongo path escaped regex metacharacters). Spike-verified: `100%` matches `100% done` and not `1000 items`.
- Tag filters: `arrayContains` (mode `all`) and `arrayOverlaps` (mode `any`).
- Listing runs the page query and `count(*)` with the same predicate in parallel. Every list orders by the chosen key plus `id`, so ties (reorder gives every row the same `updated_at`) cannot repeat or skip rows across pages. Sorts: order → `position` asc, title → `title` asc, updatedAt → `updated_at` desc.
- Errors: Drizzle 0.45 wraps driver errors in `DrizzleQueryError`; the SQLSTATE lives on `error.cause` (spike-verified), so the helper in `sqlstate.ts` inspects the cause chain. `PostgresUsersRepository.create` maps `23505` to `AppError(409, 'CONFLICT', 'An account with this email already exists')`, the same error `registerUser` raises. Category creation uses `INSERT … ON CONFLICT DO NOTHING RETURNING` and reads the existing row when nothing is returned, preserving today's "return the existing category" behavior.
- Hydration: item and user reads need no `normalizeRead`/`hydrate` (nullable columns, NOT NULL defaults). Category reads keep `hydrateCategory`, a pure function already shared with the in-memory repository.
- Injection safety: only Drizzle operators and bound parameters; no `sql.raw` with user input.
- Drizzle gotcha (spike-verified): a JS array inside an `sql` template expands to a tuple, so `::text[]` fails. Build array parameters with ``ARRAY[${sql.join(values.map((v) => sql`${v}`), sql`, `)}]::text[]``.

### D6. Atomic multi-row operations

- `reorder` (items, tags, categories): one transaction that selects the owner's ids ordered by `(position, id)` with `FOR UPDATE`, applies the same splice-and-clamp as today, rewrites every row's `position` and `updated_at`, and returns the moved entity.
- Tag delete and rename cascades on items: one `UPDATE` each, using `array_remove` and `array_replace` plus an order-preserving de-duplication, returning the affected row count (spike-verified).
- Category membership add/remove: a single `UPDATE … RETURNING` with set semantics (`$addToSet` / `$pull` equivalents, spike-verified).
- `setDefault` theme: one transaction that demotes the current default and then promotes the target, in that order because of the partial unique index (spike-verified).

### D7. Startup, migrations and configuration

- `drizzle-kit generate` authors SQL migrations that are committed in `drizzle/`. The API applies pending migrations with the Drizzle migrator at startup, before seeding and before `listen`; the folder is resolved from `import.meta.url` so it does not depend on the working directory. `npm run db:generate` and `npm run db:migrate` wrap the drizzle-kit CLI for authoring and explicit runs.
- Alternative considered: a separate migration job in Compose. Rejected as more moving parts for a single-instance app.
- `parseApiEnvironment` validates `DATABASE_URL` (protocol `postgres:` or `postgresql:`) and returns `databaseUrl`; the error names the variable and never the value.
- `server.ts` order: parse environment → `createDatabase` → `runMigrations` → build repositories → `grantAdminRole` / `ensureThemesSeeded` / `backfillThemeIcons` (kept) → `createApp` → `listen`. Failures propagate through top-level `await`, giving a non-zero exit; the Compose restart policy plus health-gated `depends_on` cover start-up races.
- `drizzle.config.ts` loads `.env` through `dotenv` and is added to `tsconfig.json` `include`. drizzle-kit resolved the `@conjuros/contracts` alias in the spike.

### D8. Compose, images and environment

- `db`: `postgres:18-alpine`, pinned to an immutable tag and digest like the previous Mongo image. PostgreSQL 18 matches the engine embedded in PGlite 0.5.x, so test and runtime engines share a major version. PostgreSQL 18 images moved `VOLUME`/`PGDATA` (data lives under `/var/lib/postgresql/18/docker`), so the named volume `postgres_data` mounts at `/var/lib/postgresql`, not `/var/lib/postgresql/data` (documented in the image README).
- `db` environment: `POSTGRES_USER` (default `conjuros`), `POSTGRES_PASSWORD` (required through `${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}`), `POSTGRES_DB` (default `conjuros`). Healthcheck `pg_isready`. Host port `127.0.0.1:5432:5432`.
- `api`: `DATABASE_URL: postgres://${POSTGRES_USER:-conjuros}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB:-conjuros}`. The password is embedded in a URL, so it must be URL-safe; `.env.example` and the README say so.
- `.env.example`: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` for Compose and `DATABASE_URL` (pointing to `localhost:5432`) for the host-run API; placeholders only.
- `Dockerfile.api` adds `COPY drizzle ./drizzle`. `Dockerfile.web` is unchanged; its build stage installs all dependencies and type-checks `src`.

### D9. Test strategy

- Existing service and API tests keep using in-memory repositories.
- New repository tests run the Postgres repositories on PGlite (`@electric-sql/pglite` with `drizzle-orm/pglite`) after applying the committed migrations with the PGlite migrator. That verifies SQL semantics, the migrations from an empty database, and schema/migration drift (a column without a migration fails the queries) inside `npm run test`.
- The global Vitest environment is jsdom, so these files start with `// @vitest-environment node`. One PGlite instance per file, tables truncated between tests.
- Where behavior is identical (ownership, CRUD, reorder, cascades) one behavior suite is parameterized over `InMemory*` and `Postgres*` so the test double stays honest; SQL-specific cases (wildcard escaping, constraints, error mapping, atomicity) are Postgres-only.
- One API smoke test drives `createApp` over the Postgres repositories on PGlite (register, tag, item, list, reorder, delete).
- `docker-compose.test.ts` (`npm run test:docker`) starts an isolated Compose project with explicit test credentials and exercises the production wiring (`createDatabase`, `runMigrations`, a repository round trip) across a `db` restart, so the `pg` driver mapping (timestamptz, arrays, jsonb, error shapes) is covered wherever Docker exists.
- Alternatives: Testcontainers or the Compose database for all repository tests (needs Docker, breaks the Docker-independent `check`); mocking Drizzle's query builder (verifies nothing about SQL).

### D10. Mongo-only removals

Delete `repositories/connection.ts`, `scripts/backfill-content-null.mjs`, `scripts/migrate-tag-category-storage.{mjs,lib.mjs,lib.d.mts}`, `scripts/normalize-tag-categories.mjs`, `src/tests/scripts/migrate-tag-category-storage.test.ts`, the `migrate:backfill-content` script and the `mongodb` dependency. The git-ignored `backup-*/` dump stays on disk untouched.

## Risks / Trade-offs

- [PGlite is not the production `pg` driver (single connection, different type parsing)] → Repositories map types explicitly (Date, JSONB, arrays) and `test:docker` drives the production wiring against the real container.
- [Password embedded in `DATABASE_URL` must be URL-safe] → Documented in `.env.example` and README; Compose passes it through unchanged.
- [Startup migrations could race with several API instances] → One instance today; move migrations to a one-shot job if the API is ever scaled out.
- [`nextOrder` is `count + 1`, so a deletion can leave two rows with the same position, and reorder bumps `updated_at` for the whole list] → Preserved on purpose for parity. The `id` tie-break keeps paging correct, and the next reorder renumbers 1..n. Candidates for a follow-up.
- [Search uses `ILIKE` without a trigram index] → The `(owner_id, position)` index limits scans to one user's rows; add `pg_trgm` only if collections grow to thousands of items.
- [Item tags reference tag names while the rules allow one name in several categories] → Pre-existing ambiguity, preserved by the array model; the junction-table follow-up would remove it.
- [Local PostgreSQL already listening on `5432`] → README troubleshooting, same as the old `27017` note.
- [Enum or CHECK changes require a migration when a new item kind appears] → Accepted: it is a generated migration, as `add-file-item-type` would have needed.
- [Drizzle 0.x to 1.0 upgrade later] → Confined to `src/api/db`, the repositories and the migration folder; separate change.

## Migration Plan

1. Implement on the feature branch and run `npm run check`; run `npm run test:docker` on a Docker-capable machine.
2. Update the local `.env`: add `POSTGRES_PASSWORD` (URL-safe) and `DATABASE_URL`, optionally `POSTGRES_USER` and `POSTGRES_DB`, and drop the two MongoDB variables. Never commit `.env`.
3. `docker compose down --remove-orphans`, then `docker compose up -d --build` (or `npm run dev`). The first start applies the migrations and seeds the default themes into an empty database. The old `mongo_data` volume is not touched; remove it manually with `docker volume rm` when it is no longer wanted.
4. Register accounts again. To get an admin, register the `ADMIN_EMAIL` account and restart the API once, because the admin grant runs at startup (existing behavior).
5. Rollback: check out the previous revision and start the old Mongo stack. The Mongo volume and the `backup-*/` dump stay intact, and no data flows in either direction.
