## 1. Data model

- [x] 1.1 Update `users` in `src/api/db/schema.ts`: make `passwordHash` nullable and add a nullable, unique `googleId` text column
- [x] 1.2 Generate the migration with `npm run db:generate` and review the committed SQL under `drizzle/` (drop NOT NULL, add unique column)

## 2. Repository seam

- [x] 2.1 Update the `UsersRepository` interface and `StoredUser`: `passwordHash: string | null`, new `googleId: string | null`, `create(email, passwordHash: string | null)`, and new `findByGoogleId` and `linkGoogleId` methods
- [x] 2.2 Implement the interface changes in `PostgresUsersRepository`, mapping `googleId` on every read and returning `null` password correctly
- [x] 2.3 Implement the same changes in `InMemoryUsersRepository`, honoring nullable passwords and lookup/link by external identity
- [x] 2.4 Add a schema/constraint test: multiple `NULL` external identities are allowed and a duplicate non-null `google_id` is rejected

## 3. Authentication behavior

- [x] 3.1 Guard `authenticateUser` in `src/api/services/auth.service.ts` so an account with `passwordHash === null` returns the existing 401 `AUTH_ERROR`
- [x] 3.2 Add `resolveExternalIdentity(repository, { subject, email, emailVerified })` implementing the precedence: reject unverified/absent email, else linked identity, else verified-email link, else new passwordless account
- [x] 3.3 Ensure `toStoredUser` and all repository reads surface `passwordHash: null` without coercing it to a string

## 4. Tests

- [x] 4.1 Repository tests (in-memory and Postgres/PGlite) for passwords stored as `null` and for `findByGoogleId` / `linkGoogleId`
- [x] 4.2 Unit test: password sign-in against a passwordless account returns 401 `AUTH_ERROR`
- [x] 4.3 Unit test: resolution returns the linked account, links on a matching verified email, creates a passwordless account when none matches, and rejects unverified or absent email
- [x] 4.4 Confirm the public profile schema still omits the external identity (existing contract test or a small assertion)

## 5. Documentation and verification

- [x] 5.1 Update the `AGENTS.md` domain rules to state that accounts may have no local password and may carry one external identity
- [x] 5.2 Run `npm run check` (lint -> test -> build) and resolve any failures
