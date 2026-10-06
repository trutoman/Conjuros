## 1. Dependencies and tooling

- [x] 1.1 Add runtime dependencies `drizzle-orm@^0.45.3` and `pg@^8` and dev dependencies `drizzle-kit@^0.31.11`, `@types/pg` and `@electric-sql/pglite` with pnpm (keep `mongodb` until section 4 so the code keeps compiling)
- [x] 1.2 Create `drizzle.config.ts` (dialect `postgresql`, schema `./src/api/db/schema.ts`, out `./drizzle`, `casing: 'snake_case'`, `dbCredentials.url` from `DATABASE_URL` loaded through `dotenv/config`), add it to the `tsconfig.json` `include` list and add `drizzle/` to `.prettierignore`
- [x] 1.3 Add the `db:generate` (`drizzle-kit generate`) and `db:migrate` (`drizzle-kit migrate`) scripts to `package.json`

## 2. Schema, database client and migrations

- [x] 2.1 Create `src/api/db/schema.ts` with the tables, enums, foreign keys, indexes and constraints of design D4: enums built from contract constants (`itemKinds`, `roleSchema.options`, `themePreferenceSchema.options`), `text` ids, `timestamptz` in `mode: 'date'`, `position` column behind the `order` key, the item kind CHECK, the `(owner_id, name_normalized)` unique index on categories, the non-unique tag name index, the partial unique default-theme index, and JSONB theme columns typed with the contract types
- [x] 2.2 Create `src/api/db/client.ts` exporting `createDatabase(url)` (returns `{ db, pool }`, registers a pool `error` listener) and the `Database` type `PgDatabase<PgQueryResultHKT, typeof schema>`
- [x] 2.3 Create `src/api/db/sqlstate.ts` with a helper that finds a SQLSTATE code on an error or anywhere along its `cause` chain (Drizzle wraps driver errors in `DrizzleQueryError`)
- [x] 2.4 Create `src/api/db/migrate.ts` exporting `runMigrations(db)` that applies `drizzle/` with the Drizzle migrator, resolving the folder from `import.meta.url`
- [x] 2.5 Generate the initial migration with `npm run db:generate -- --name init`, review the SQL against design D4 (enums, CHECK, partial unique index, cascading foreign keys) and commit `drizzle/`
- [x] 2.6 Create the PGlite test helper `src/tests/api/pglite.ts` (`createPgliteDatabase()` builds a PGlite instance, wraps it with `drizzle-orm/pglite` and the shared schema and applies the committed migrations; `resetDatabase(db)` truncates all tables)
- [x] 2.7 Add `src/tests/api/schema.constraints.test.ts` (starts with `// @vitest-environment node`) covering: migrations apply to an empty database, duplicate user email is rejected, an item for an unknown owner is rejected, kind/field mismatches are rejected (`spell` without `command`, `web-link` with `content`), a duplicate category name per owner is rejected, and a second default theme is rejected

## 3. PostgreSQL repositories

- [x] 3.1 Implement `PostgresUsersRepository` behind `UsersRepository` (`findByEmail`, `findById`, `create`, `updateTheme`, `setRole` with `UPDATE … RETURNING`); map a unique violation on `create` to `AppError(409, 'CONFLICT', 'An account with this email already exists')`; add tests for the full interface and the duplicate email conflict
- [x] 3.2 Implement `PostgresThemesRepository` behind `ThemesRepository`: `list` (search over name and label, sorts by name, label and updated date, pagination with `limit`/`skip`, total of all matches, `id` tie-break), `findAll`, `findById`, `findByName`, `findDefault`, `count`, `create` (keeps a given id, otherwise `randomUUID()`), `replace`, `delete` and `setDefault` (one transaction that demotes then promotes); map timestamps to ISO strings and round-trip the JSONB columns; add tests including the single-default guarantee and `ThemesService.ensureSeeded` producing the `light` and `dark` themes with exactly one default on an empty database
- [x] 3.3 Implement `PostgresTagCategoriesRepository` behind `TagCategoriesRepository`: `list` (search over name and description, sorts, pagination), `findAllOwned`, `findOwned`, `findOwnedByNormalizedName`, `findOwnedByMemberTag`, `nextOrder`, `create` (`INSERT … ON CONFLICT DO NOTHING RETURNING`, then read the existing row when nothing was inserted), `replace`, `addMembers` and `removeMember` (single `UPDATE … RETURNING` with set semantics, arrays built with `sql.join`), `delete` and `reorder` (transaction, `FOR UPDATE`, splice and clamp); keep `hydrateCategory` on reads; add tests including concurrent `create` of the same name via `Promise.all`, duplicate-free membership and cross-owner isolation
- [x] 3.4 Implement `PostgresTagsRepository` behind `TagsRepository` (`findOwned`, `findOwnedByNormalizedNames`, `findAllOwned` ordered by `position` then `id`, `nextOrder`, `create`, `replace`, `delete`, `reorder` as in 3.3); add tests for ownership, lookups by normalized names and reorder
- [x] 3.5 Implement `PostgresItemsRepository.list` and the read methods (`findOwned`, `findOwnedByIds`, `findOwnedByTags`, `nextOrder`): kind filter, tag filter with `arrayContains` (`all`) and `arrayOverlaps` (`any`), case-insensitive search over title, description, command, URL, content and tags with `\`, `%` and `_` escaped, sorts by `position`, title and `updated_at` desc with an `id` tie-break, parallel page and `count(*)` queries; add tests for each filter, literal wildcard search, sort orders, `total` versus page size and paging over rows with identical `updated_at`
- [x] 3.6 Implement `PostgresItemsRepository` writes: `create` (kind-dependent fields, `null` for absent optional fields), `replace`, `delete`, `reorder` (transaction, `FOR UPDATE`, splice and clamp, contiguous positions), `removeTagFromOwnerItems` (`array_remove`) and `renameTagForOwnerItems` (`array_replace` with order-preserving de-duplication) as single statements returning the affected count; add tests for ownership isolation, contiguous reorder and clamping past the end, rename without duplicates, delete touching only the owner's items
- [x] 3.7 Parameterize the shared behavior suites (ownership isolation, CRUD, reorder, tag cascades) over `InMemory*` and `Postgres*` repositories where the behavior is identical, and keep SQL-specific cases in Postgres-only tests
- [x] 3.8 Add an API smoke test that builds `createApp` over the Postgres repositories on PGlite: register, create a tag with an unknown category, create items, list, reorder, delete; assert ISO-8601 timestamps, `null` optional fields, no `ownerId`/`passwordHash`/normalized names in responses, a `409` for two simultaneous registrations of one email, and one category for two simultaneous tag creations with the same unknown category

## 4. Configuration, server wiring and Mongo removal

- [x] 4.1 Replace `MONGODB_URI` and `MONGODB_DATABASE` in `src/api/config/environment.ts` with `DATABASE_URL` validated for the `postgres:` and `postgresql:` protocols; expose `databaseUrl` on `ApiEnvironment`; keep the error message limited to variable names
- [x] 4.2 Update `src/tests/api/environment.test.ts`: valid PostgreSQL URL, `mongodb://` rejected, missing and blank values rejected, the error names `DATABASE_URL` and never contains the URL or the session secret
- [x] 4.3 Update `.env.example` with placeholder-only values: `POSTGRES_USER`, `POSTGRES_PASSWORD` (URL-safe placeholder), `POSTGRES_DB`, `DATABASE_URL` pointing to `localhost:5432`, and the unchanged `SESSION_SECRET`, `ADMIN_EMAIL`, `CORS_ORIGIN` and `PORT` entries; drop both MongoDB variables
- [x] 4.4 Rewire `src/api/server.ts`: parse environment, `createDatabase`, `await runMigrations`, build the `Postgres*` repositories, then `grantAdminRole`, `ensureThemesSeeded` and `backfillThemeIcons`, `createApp` and `listen`
- [x] 4.5 Delete the `Mongo*Repository` classes and their `mongodb` imports from the five repository files and delete `src/api/repositories/connection.ts`
- [x] 4.6 Delete `scripts/backfill-content-null.mjs`, `scripts/migrate-tag-category-storage.mjs`, `scripts/migrate-tag-category-storage.lib.mjs`, `scripts/migrate-tag-category-storage.lib.d.mts`, `scripts/normalize-tag-categories.mjs` and `src/tests/scripts/migrate-tag-category-storage.test.ts`; remove the `migrate:backfill-content` script; remove the `mongodb` dependency with pnpm
- [x] 4.7 Search code, scripts, tests and `package.json` for `mongo` (case-insensitive) and confirm nothing runtime-related remains (documentation is handled in section 6)

## 5. Compose, images and Docker test

- [x] 5.1 Update `docker-compose.yml`: `db` becomes `postgres:18-alpine` pinned to an immutable tag and digest (resolve it with `docker buildx imagetools inspect`), `POSTGRES_USER` (default `conjuros`), required `POSTGRES_PASSWORD`, `POSTGRES_DB` (default `conjuros`), `pg_isready` healthcheck, port `127.0.0.1:5432:5432`, named volume `postgres_data` mounted at `/var/lib/postgresql`; `api` gets `DATABASE_URL` pointing to `db:5432`; replace the `mongo_data` volume entry
- [x] 5.2 Update `Dockerfile.api` to copy the `drizzle/` migrations folder
- [x] 5.3 Update the `scripts/check-docker.mjs` messages to refer to the database service instead of MongoDB and update `src/tests/scripts/docker-availability.test.ts` accordingly
- [x] 5.4 Port `src/tests/integration/docker-compose.test.ts` to PostgreSQL: isolated Compose project with explicit test credentials passed through the environment, connect through the production wiring (`createDatabase`, `runMigrations`, a repository round trip), restart `db`, verify the record remains, tear down with `--volumes`; keep the skip when Docker is unavailable and the README note that port `5432` must be free
- [x] 5.5 On a Docker-capable machine verify: `docker compose up -d --build` reaches healthy `db`, `api` and `web`, the API applies migrations and seeds themes on the empty database, a registered user and created item survive `docker compose restart db`, the API process exits with a non-zero status when it starts while the database is unreachable, and `npm run test:docker` passes

## 6. Documentation

- [x] 6.1 Update `README.md`: PostgreSQL instead of MongoDB, ports `5432`/`3000`/`5173`, `.env` variables (`POSTGRES_PASSWORD` required and URL-safe, `DATABASE_URL`), the from-scratch database and how to reset the `postgres_data` volume, the admin email taking effect after a restart, the `db:generate` / `db:migrate` workflow, the `5432` troubleshooting note; remove the `content` backfill section and the MongoDB persistence wording in the test section
- [x] 6.2 Update `AGENTS.md`: layer diagram and rules (PostgreSQL via Drizzle), development commands (PostgreSQL on `localhost:5432`, `db:generate`, `db:migrate`), setup notes (`DATABASE_URL`, `POSTGRES_PASSWORD`), testing notes (repository tests on PGlite, Docker test against PostgreSQL) and the rule that contracts stay in `packages/contracts` without a Drizzle dependency
- [x] 6.3 Update the persistence references in `docs/init.md` (MongoDB collections, indexes and Compose examples) to PostgreSQL with Drizzle

## 7. Validation

- [x] 7.1 Run `npm run check` (lint, tests, build) and fix any failure
- [x] 7.2 Run `openspec validate migrate-to-postgres-drizzle --strict`
- [x] 7.3 Final search for `mongo` across tracked files (excluding `openspec/changes/archive`, this change and the git-ignored `backup-*/` dump) and confirm each remaining hit is intentional
