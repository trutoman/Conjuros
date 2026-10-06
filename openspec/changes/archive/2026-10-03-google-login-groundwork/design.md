## Context

See `proposal.md` - Why. Current state that shapes this groundwork:

- `users` (`src/api/db/schema.ts`) declares `passwordHash: text().notNull()` and has no external identity column. Note the Drizzle column key `passwordHash` maps to the DB column `password_hash` by default (no explicit name), so a raw `ALTER COLUMN` still targets `password_hash`.
- The `UsersRepository` interface (`src/api/repositories/users.repository.ts`) exposes `findByEmail`, `findById`, `create(email, passwordHash)`, `updateTheme`, `setRole`; `StoredUser` carries `passwordHash: string`. Two implementations (`PostgresUsersRepository`, `InMemoryUsersRepository`) must change together.
- `authenticateUser` does `!user || !(await bcrypt.compare(credentials.password, user.passwordHash))`. With a nullable hash this would pass `null` to `bcrypt.compare` and throw, so it needs an explicit guard.
- Auth is otherwise stateless and password-shaped; nothing in this change touches the JWT/cookie session.

## Goals / Non-Goals

**Goals:**
- Make "no local password" a first-class, stored account state.
- Reserve and enforce a single external identity slot per account.
- Expose a provider-agnostic resolution seam so the later Google change only supplies a verified identity.
- Keep the migration backward-compatible and testable without any Google client or network.

**Non-Goals:**
- No Google HTTP flow, endpoints, routes, controllers or env vars. Those belong to `add-google-oauth-login`.
- No `google-auth-library` dependency, no frontend button, no OAuth state/PKCE handling.
- No change to session issuance, JWT claims, `requireAuth`, or any protected route.
- No multi-provider identity table, no unlinking, no profile UI.

## Decisions

### Nullable `password_hash` and a nullable unique `google_id`

Use `passwordHash: text()` (drop `.notNull()`) and add `googleId: text().unique()`. PostgreSQL treats `NULL`s as distinct in a unique index, so many unlinked accounts coexist while a non-null external identity stays unique - exactly the required behavior, and `openspec` spec scenario "External identity is unique" is enforced by the database, not just application code.

*Alternative considered:* a general `user_identities(provider, subject)` table. Rejected for now: one foreseeable provider does not justify the join, and the column can be promoted to a table later without changing the API contract. Naming it `googleId` keeps the future provider explicit while still behind a provider-agnostic *service* seam.

### Additive, backward-compatible migration

The migration only does `ALTER COLUMN password_hash DROP NOT NULL` and `ADD COLUMN google_id text` + unique constraint. No data backfill, existing rows keep their hash and get `NULL` for `google_id`. It is generated with `npm run db:generate` and committed under `drizzle/`.

*Alternative considered:* backfilling synthetic values into `google_id`. Rejected: unnecessary and would make "unlinked" ambiguous.

### Repository seam renamed to external identity, not Google

Add `findByGoogleId(googleId)` and `linkGoogleId(id, googleId)` and allow `create(email, passwordHash: string | null)`. The service-level resolution function takes an abstract identity `{ subject, email, emailVerified }`, so the *service* is provider-agnostic even though the *column* is named for Google. This keeps the later Google change thin.

*Alternative considered:* naming the column `externalId`. Rejected to avoid over-generalizing before a second provider exists; renaming is a trivial migration if needed.

### Guard password sign-in instead of schema tricks

`authenticateUser` becomes `if (!user || user.passwordHash === null || !(await bcrypt.compare(...))) throw 401`. This preserves the exact existing error and prevents `bcrypt.compare(null, ...)` from throwing, which is the concrete failure the spec's "Safe password sign-in" scenario targets.

### Resolution function with a clear precedence

`resolveExternalIdentity(repository, identity)`:
1. reject when `email` is missing or `emailVerified !== true`;
2. `findByGoogleId(subject)` -> return;
3. `findByEmail(email)` -> `linkGoogleId` -> return;
4. `create(email, null)` then `linkGoogleId` -> return.

It lives in `auth.service.ts` so it is unit-testable with `InMemoryUsersRepository` and no HTTP. The later Google controller will call it after verifying the ID token.

*Alternative considered:* putting resolution in the future Google controller. Rejected: it would make the core logic untestable without Google and couple it to the provider.

## Risks / Trade-offs

- **Nullable hash leaking into code paths that assume a string** -> Guard `authenticateUser` explicitly; update `StoredUser`/`toStoredUser` types to `string | null` so the compiler flags other sites; run `npm run build` (tsc) as part of `npm run check`.
- **Email-match account linking is an account-takeover vector** -> Resolution links only on `emailVerified === true`; the unverified path is a spec scenario and a unit test. Actual verification of the flag belongs to the provider step, which is out of scope here by design.
- **Unique constraint failure surface** -> `linkGoogleId` on an already-linked subject should surface the existing `CONFLICT` behavior; the repository's unique-violation mapping (`UNIQUE_VIOLATION` in `src/api/db/sqlstate.ts`) is reused. A constraint test covers it.
- **Two implementations drifting** -> Repository tests are extended for both `PostgresUsersRepository` (PGlite) and `InMemoryUsersRepository`, mirroring the existing test layout.
- **Spec mentions profiles omitting the identity but this change returns none** -> No profile change needed; the requirement is a guardrail for the follow-up and is satisfied because `authenticatedUserProfileSchema` already omits it. No task needed beyond keeping it out.

## Migration Plan

1. `npm run db:generate` produces the `DROP NOT NULL` + add-unique-column SQL; review and commit it.
2. Deploy: `runMigrations` at startup applies it. Existing accounts keep working; `google_id` is `NULL`.
3. Rollback: the added column and the dropped NOT NULL are backward-compatible, but reverting the code without the migration would break passwordless rows. If rollback is required before any passwordless rows exist, revert the commit and the migration together; document that once passwordless accounts exist the migration is forward-only.

## Open Questions

- None that affect this change. The eventual provider's exact subject claim and redirect handling are deferred to `add-google-oauth-login`.
