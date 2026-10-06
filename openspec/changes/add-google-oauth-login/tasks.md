## 1. Dependencies and configuration

- [ ] 1.1 Add `google-auth-library` as a runtime dependency and install it (pnpm lockfile updated)
- [ ] 1.2 Add optional `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and optional `GOOGLE_REDIRECT_BASE_URL` to the environment Zod schema in `src/api/config/environment.ts`, exposing a derived `redirectUri` ending in `/api/auth/google/callback`
- [ ] 1.3 Document the new variables in `.env.example`, and pass them through to the `api` service in `docker-compose.yml`
- [ ] 1.4 Extend `src/tests/api/environment.test.ts`: valid values parse, absent values parse as disabled, malformed values still throw named errors

## 2. Data model and repository

- [ ] 2.1 Update `users` in `src/api/db/schema.ts`: make `passwordHash` nullable and add a nullable unique `googleId` text column
- [ ] 2.2 Generate the migration with `npm run db:generate` and review the committed SQL under `drizzle/` (drop NOT NULL, add unique column)
- [ ] 2.3 Update the `UsersRepository` interface and `StoredUser`: nullable `passwordHash`, new `googleId`, new `findByGoogleId` and `linkGoogleId` methods, and `create(email, passwordHash: string | null)`
- [ ] 2.4 Implement the interface changes in `PostgresUsersRepository`, mapping the new column and returning `googleId` from every read
- [ ] 2.5 Implement the same changes in `InMemoryUsersRepository` (null password allowed, find/link by google id)
- [ ] 2.6 Add a schema/constraint test asserting multiple `NULL` `google_id` rows are allowed and that duplicate non-null `google_id` values are rejected

## 3. Google auth service

- [ ] 3.1 Create a Google auth service that builds the authorization URL (`state`, PKCE `code_verifier`/`challenge`, scopes) and exposes the verifier/state to the controller
- [ ] 3.2 Implement the callback exchange: validate `state`, exchange the code, verify the Google ID token and extract `sub`, `email` and `email_verified`
- [ ] 3.3 Add `resolveGoogleUser(repository, identity)`: sign in by `googleId`, else link by verified email, else create a passwordless account; reject unverified or absent email
- [ ] 3.4 Keep the token verifier injectable/stubbable so unit tests run without network access
- [ ] 3.5 Guard `authenticateUser` in `src/api/services/auth.service.ts` so `passwordHash === null` returns the existing 401 `AUTH_ERROR`
- [ ] 3.6 Add unit tests for `resolveGoogleUser` (existing linked user, email link, new account, unverified email rejected, disabled provider) using the in-memory repository
- [ ] 3.7 Add a unit test asserting password sign-in against a Google-only account returns 401 `AUTH_ERROR`

## 4. HTTP layer wiring

- [ ] 4.1 Add Google auth controller handlers: `googleStart` (set the short-lived `conjuros_oauth` state/PKCE cookie and redirect to Google) and `googleCallback` (validate, resolve, set the `conjuros_session` cookie, clear the OAuth cookie, redirect to the app)
- [ ] 4.2 Handle every callback failure path (state mismatch, `error` param, exchange/verification failure, unverified email) by redirecting to the app with a safe `authError` query value and clearing the OAuth cookie
- [ ] 4.3 Make the start route respond safely (disabled indication) when Google credentials are not configured, without breaking startup
- [ ] 4.4 Register the public `GET /api/auth/google` and `GET /api/auth/google/callback` routes in `src/api/routes/auth.route.ts` (not behind `requireAuth`)
- [ ] 4.5 Thread the optional Google service and frontend redirect origin through `AppDependencies`, `createApp` and `src/api/server.ts`
- [ ] 4.6 Add API tests for the start redirect, the callback success path (stubbed verifier), callback error/state-mismatch redirects, and the disabled-provider path

## 5. Frontend

- [ ] 5.1 Add a "Continue with Google" action to `AuthScreen` in `src/web/App.tsx` that navigates to `/api/auth/google`
- [ ] 5.2 Read the `authError` query parameter on load, show a user-facing message, and clear it from the URL
- [ ] 5.3 Add a frontend test covering the Google action and the callback error message using accessible roles/text

## 6. Contracts and docs

- [ ] 6.1 Add any Google-related request/response shapes to `packages/contracts/src/auth.ts`, ensuring the public profile still omits `googleId`
- [ ] 6.2 Update `README.md` and `AGENTS.md` with the Google Cloud Console setup steps and the new configuration variables

## 7. Verification

- [ ] 7.1 Run `npm run check` (lint → test → build) and resolve any failures
- [ ] 7.2 Manually verify the end-to-end flow against a real Google client, including new-user registration and linking an existing password account, and confirm password sign-in still works
