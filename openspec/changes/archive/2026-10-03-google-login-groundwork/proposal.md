## Why

Google sign-in is blocked until a Google OAuth client (and therefore a public redirect URL) exists. Most of the foundation for it, however, does not depend on Google at all: the user data model, the credential-verification seam and the account-resolution logic can be built, migrated and tested now. Doing this groundwork first shrinks the later OAuth change to "wire a provider into an existing seam" and removes the risk of a rushed schema migration.

## What Changes

- **BREAKING (schema)**: `users.password_hash` becomes nullable so an account can exist without a local password; existing rows keep their hash. A new nullable, unique `google_id` column reserves the external-identity slot (all current rows stay `NULL`).
- The `UsersRepository` gains an explicit external-identity seam: `findByGoogleId`, `linkGoogleId`, and `create` accepts `passwordHash: string | null`. Both the Postgres and in-memory implementations change together.
- Password sign-in is hardened against passwordless accounts: `authenticateUser` must return the existing 401 `AUTH_ERROR` (never crash) when an account has no password.
- Add a provider-agnostic account-resolution function (sign in by external id, else link an existing verified email, else create a passwordless account) in the auth service, unit-tested with the in-memory repository. This is the exact logic the later Google callback will call.
- No Google HTTP flow, no Google configuration variables, no frontend button and no new runtime dependency are added here. Those belong to the follow-up `add-google-oauth-login` change once a real client/URL exists.
- Update `AGENTS.md` domain rules to state that accounts may have no password and may carry an external identity.

## Capabilities

### New Capabilities
- `external-identity-accounts`: the account model and authentication seam for passwordless, externally-identified accounts: nullable passwords, a unique external identity, safe password sign-in for passwordless accounts, and provider-agnostic account resolution by external id or verified email.

### Modified Capabilities
<!-- No existing spec covers user accounts or email/password authentication, so this is captured as a new capability rather than a delta. -->

## Impact

- **API code**: `src/api/db/schema.ts` (`passwordHash` nullable, new `googleId`), a new generated migration under `drizzle/`, `src/api/repositories/users.repository.ts` (interface + both implementations), `src/api/services/auth.service.ts` (null-password guard + resolution function), `src/api/bootstrap.ts` only if typing requires it.
- **No new dependencies**: this change deliberately adds none; the later OAuth change adds the Google client library.
- **Tests**: extend repository tests (in-memory and Postgres) for nullable passwords and the external-identity slot; add a unit test asserting password sign-in on a passwordless account returns 401 `AUTH_ERROR`; add resolution tests (linked identity, email link, new account, unverified/absent email rejected).
- **Docs**: `AGENTS.md` domain rules; `README.md` only if it documents the user model.
- **Unblocks**: the `add-google-oauth-login` change, whose tasks 2.x/3.x/5.x shrink to provider wiring and UI once this lands.
