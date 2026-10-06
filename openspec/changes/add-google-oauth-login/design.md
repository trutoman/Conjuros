## Context

See `proposal.md` for motivation. Current state that shapes the approach:

- Authentication is stateless: `authenticateUser`/`registerUser` (`src/api/services/auth.service.ts`) return `{ id, email }`, the controller signs a 7-day JWT with `SESSION_SECRET` and stores it in the `conjuros_session` cookie (`httpOnly`, `sameSite: lax`, `secure` in production). `requireAuth` (`src/api/middleware/auth.ts`) reads that cookie and sets `request.currentUser`. All protected routes depend only on that cookie, so a Google flow that sets the same cookie integrates without touching them.
- `users` (`src/api/db/schema.ts`) has `passwordHash` NOT NULL and no external identity column. The `UsersRepository` interface has `findByEmail`, `findById`, `create(email, passwordHash)`, `updateTheme`, `setRole`; both a Postgres and an in-memory implementation must be updated in lockstep.
- Environment is a single Zod schema in `src/api/config/environment.ts`; invalid values throw a named error at startup. `createApp(dependencies)` receives `users`, `sessionSecret`, `corsOrigin`.
- The frontend is a plain React app served by Vite; `AuthScreen` in `src/web/App.tsx` posts JSON to `/api/auth/login` and `/api/auth/register`. There is no router.

## Goals / Non-Goals

**Goals:**
- Add Google Authorization Code + PKCE sign-in that issues the existing cookie session.
- Support both new Google-only accounts and linking a Google identity to an existing email/password account.
- Keep the password flow working, including safe handling of passwordless accounts.
- Make Google credentials optional so local and test runs stay Docker-independent and boot without Google config.

**Non-Goals:**
- No Google API access beyond basic OpenID profile (no Gmail/Drive scopes).
- No refresh tokens, offline access or server-side token storage; we only need identity at sign-in.
- No account-linking management UI, no unlinking, no multiple providers.
- No session-store or revocation changes; we keep the existing stateless JWT.

## Decisions

### Authorization Code flow with PKCE, handled by the API (not the SPA)

The API serves two public routes: `GET /api/auth/google` starts the flow, `GET /api/auth/google/callback` completes it. The browser is fully redirected, so no SPA token handling or CORS considerations arise and the client secret never reaches the browser.

*Alternative considered:* popup/`@react-oauth/google` returning a credential to the SPA, then POSTing it to the API. Rejected: it puts the OAuth client into the frontend, adds a token-in-browser step, and gives no natural place for the state cookie.

### PKCE + `state` bound to a short-lived httpOnly cookie

`/api/auth/google` generates a random `state`, a PKCE `code_verifier`, and stores them in a short-lived (10 min) `httpOnly`, `sameSite: lax` cookie (`conjuros_oauth`). The callback compares the returned `state` to the cookie and uses the stored verifier for the token exchange, then clears the cookie. `sameSite: lax` is required because the callback is a top-level cross-site GET from Google; the state is bound to the browser that started the flow, mitigating CSRF/login-CSRF.

*Alternative considered:* server-side session store keyed by state. Rejected as overkill for a single-use, 10-minute value and it would introduce state that the stateless design avoids.

### Token/ID token validation with `google-auth-library`

Use `OAuth2Client` (`generateAuthUrl`, `getToken`, `verifyIdToken`) with the configured `clientId`, `clientSecret` and redirect URI. This is Google's maintained Node client and validates issuer, audience, signature and expiry. The identity is `payload.sub` plus `payload.email` / `payload.email_verified`.

*Alternative considered:* hand-rolled `fetch` calls to Google's token and JWKS endpoints. Rejected: reinventing signature/claim validation is error-prone and unnecessary.

### Data model: nullable `password_hash` + unique nullable `google_id`

- `password_hash` becomes nullable (`ALTER COLUMN ... DROP NOT NULL`); Google-only accounts store `NULL`.
- Add `google_id text` with a partial/unique index (`UNIQUE` allows multiple `NULL`s in PostgreSQL, which is exactly the "not linked" case), storing the Google `sub`.
- The migration is a single generated, committed SQL file under `drizzle/`; existing rows are unaffected because their `google_id` is `NULL`.

*Alternative considered:* a separate `user_identities` table (provider + subject). Rejected for now: one provider does not justify the join, though the column can be generalized later.

### Account resolution order (service layer)

On a validated identity with `email_verified === true`:
1. `findByGoogleId(sub)` → if found, sign in.
2. else `findByEmail(email)` → if found, `linkGoogleId(id, sub)`, sign in.
3. else `createWithGoogle(email, sub)` → new passwordless account, sign in.

This lives in the auth service behind the repository interface so it is unit-testable with `InMemoryUsersRepository`.

### Repository interface changes (both implementations)

- `create(email, passwordHash: string | null)`.
- New `findByGoogleId(googleId: string): Promise<StoredUser | null>`.
- New `linkGoogleId(id: string, googleId: string): Promise<StoredUser | null>`.
- `StoredUser` gains `googleId: string | null` and `passwordHash: string | null`.

`authenticateUser` guards with `if (!user || user.passwordHash === null || !(await bcrypt.compare(...)))` so a Google-only account yields the existing 401 `AUTH_ERROR` instead of crashing.

### Optional configuration, disabled when absent

`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are optional in the environment schema; a derived `redirectUri` uses `GOOGLE_REDIRECT_BASE_URL` (fallback to the API's own origin) + `/api/auth/google/callback`. `server.ts` builds an optional Google auth service; when config is absent the start route responds 503/redirects with a disabled indication and the app otherwise behaves as today. This keeps `npm run check` and local dev working without Google credentials.

### Callback failure handling

All failure modes (state mismatch, `error` query param, exchange/validation failure, unverified email) redirect to the frontend with a safe error code query parameter (e.g. `/?authError=google`) instead of returning JSON, because the browser is navigating, not an XHR. `AuthScreen` reads that parameter and shows a message, then clears it from the URL.

## Risks / Trade-offs

- **Email-matching account takeover** → Trust only `email_verified === true` from a validated Google ID token before linking; never link on an unverified email.
- **Doing an OAuth state cookie alongside the session cookie** → Keep the OAuth cookie short-lived, distinct name, `httpOnly`, `sameSite: lax`, and clear it on every callback path.
- **`sameSite: lax` cross-site callback in production** → Ensure `secure` is set in production and the redirect URI is registered with the exact HTTPS origin; document that the SPA origin and API callback must be consistent.
- **Passwordless accounts breaking the password path** → Explicit `passwordHash === null` guard plus a unit test asserting 401 `AUTH_ERROR`.
- **Unique index on nullable `google_id`** → PostgreSQL treats `NULL`s as distinct, so many unlinked users coexist; verified by a schema/constraint test.
- **Tests depending on live Google** → Unit-test the Google auth service with an injected/stubbed token verifier and the in-memory repository; route tests cover config-absent and callback error paths without network calls.
- **Collision: existing account with same email but different Google sub** → Step 2 links and overwrites `google_id`; acceptable for a single-provider model, documented as a known limitation.

## Migration Plan

1. Generate and commit the SQL migration (`npm run db:generate`) for the nullable `password_hash` and new `google_id` unique column.
2. Deploy the API; `runMigrations` applies it at startup. Existing password accounts keep working; `google_id` stays `NULL`.
3. Add Google variables to the deployment env (and `docker-compose.yml`); when absent, Google sign-in is simply disabled. Rollback is removing the variables (Google off) or reverting the commit; the nullable column and `NULL` values are backward-compatible.

## Open Questions

- Exact frontend origin to send the post-callback redirect to in production (defaults to `CORS_ORIGIN`); can be settled during implementation without changing the specs or approach.
