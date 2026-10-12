## Context

See `proposal.md` for motivation. Current state that shapes the approach:

- The API has no outbound email of any kind; `package.json` has no mail dependency. `server.ts` parses a Zod-validated environment (`src/api/config/environment.ts`), builds Postgres repositories, and calls `createApp(dependencies)`.
- Auth is stateless: `registerUser`/`authenticateUser` (`src/api/services/auth.service.ts`) return `{ id, email }`; the controller signs a 7-day JWT cookie. `AuthScreen` in `src/web/App.tsx` posts JSON to `/api/auth/{login,register}` and renders `body.error.message`. There is no router; `App` switches between screens with React state and `window.location` is only used implicitly.
- `UsersRepository` exposes `findByEmail`, `create`, `linkGoogleId`, `updateTheme`, `setRole`; accounts may have a `null` password (`external-identity-accounts`). The strong `passwordSchema` and the `parseCredentialsOrThrow` helper (first validation issue becomes `error.message`) were added by `credential-validation`.
- Migrations are generated with `drizzle-kit` into `drizzle/` and applied at API startup by `runMigrations`.
- The frontend is served by Vite in dev and nginx in the container; both fall back to `index.html` for unknown paths, so a `/reset-password` path is reachable.

## Goals / Non-Goals

**Goals:**
- Add a single, testable outbound email seam and send a welcome email on registration.
- Add a secure, single-use, expiring email password reset that does not reveal which emails have accounts.
- Reuse the existing password strength policy for the new password.
- Keep the app fully working when email is not configured.

**Non-Goals:**
- No email verification, change-email, or account-deletion emails.
- No password reset for external-identity-only (passwordless) accounts.
- No email delivery retries/queue, bounce handling, or templating engine.
- No session creation from the reset flow and no "remember me" changes.
- No client-side validation (consistent with the existing credential flow).

## Decisions

### Email seam: `EmailSender` interface with an SMTP implementation and a non-delivering fallback

Define `EmailSender { send(message: EmailMessage): Promise<void> }` with `EmailMessage = { to, subject, text, html? }`. Provide `SmtpEmailSender` backed by `nodemailer.createTransport(SMTP_URL)` and `ConsoleEmailSender` that logs the message when email is unconfigured. `createEmailSender(config)` picks one. Tests inject an in-memory sender.

*Alternative considered:* a provider SDK (Resend/SendGrid). Rejected: adds vendor lock-in and a mandatory account for a self-hostable app; SMTP is universal.
*Alternative considered:* hand-rolled SMTP over `net`. Rejected: reinventing MIME/TLS handling.

### Configuration: optional `SMTP_URL`, `MAIL_FROM`, `APP_BASE_URL`, `PASSWORD_RESET_TTL_MINUTES`

All are optional so startup succeeds without email. `SMTP_URL` uses nodemailer's connection-URL form (`smtp:`/`smtps:`), validated as a URL with those protocols. `MAIL_FROM` is required only when `SMTP_URL` is set (enforced by a refinement). `APP_BASE_URL` builds the reset link and defaults to `CORS_ORIGIN`. `PASSWORD_RESET_TTL_MINUTES` defaults to 60.

*Alternative considered:* discrete `SMTP_HOST`/`SMTP_PORT`/… variables. Rejected: the connection URL keeps one variable and maps directly to `createTransport`.

### Reset tokens: hashed, expiring, single-use rows

Add a `password_reset_tokens` table: `id`, `user_id` (FK, cascade delete), `token_hash` (unique), `expires_at`, `used_at` (nullable), `created_at`. Generate the token with `crypto.randomBytes(32).toString('base64url')`, store `sha256(token)` hex, and look up by hash. Issuing a new token deletes/invalidates the user's unused tokens. A `PasswordResetTokensRepository` (Postgres + in-memory) exposes `create`, `findByTokenHash`, `markUsed`, and `deleteUnusedForUser`.

*Alternative considered:* a stateless signed JWT reset token. Rejected: single-use and "invalidate the previous token" require server state, and a stored hash limits damage if the database leaks.

### Endpoints and non-enumeration

`POST /api/auth/password-reset/request` (public) accepts `{ email }`, always returns `202 { message: <generic> }`, and only sends mail when a matching account with a local password exists. `POST /api/auth/password-reset/confirm` (public) accepts `{ token, password }`, returns `200 { message }` on success. Failures are `AppError`s: password policy violations reuse the credential-validation behavior (first issue becomes the message, token left unused); unknown/expired/used tokens return `400 RESET_TOKEN_INVALID` with an invalid-or-expired message. No session cookie is set.

*Alternative considered:* returning 404 for unknown emails. Rejected: enables account enumeration.

### Reset only applies to accounts with a local password

`requestPasswordReset` sends a link only when the account has a non-null `passwordHash`. Passwordless accounts get the same generic response and no email, matching the non-enumeration rule and leaving the external-identity model unchanged.

### Welcome email on registration, decoupled from the result

The auth controller, after `registerUser` succeeds, calls a `sendWelcomeEmail` helper that awaits `sender.send(...)` but catches and logs any error, so the response is unaffected. The welcome email links to the app base URL.

*Alternative considered:* send inside `registerUser`. Rejected: the service should not depend on email transport; keeping it in the controller keeps the service pure and unit-testable.

### Frontend without a router

`App` gains a lightweight view decision: when `window.location.pathname` is `/reset-password`, render a `ResetPasswordScreen` that reads `token` from the query string; otherwise render the existing auth/collection flow. `AuthScreen` gains a "Forgot password?" action that shows a `ForgotPasswordScreen`. After a successful reset the app replaces the URL to `/` and shows the sign-in view with a success message. Forms post to the API and display the returned message; no client validation.

*Alternative considered:* introduce `react-router-dom`. Rejected: a single extra path does not justify a router migration.

### Reset link shape

The link is `${APP_BASE_URL}/reset-password?token=<token>`. The path is reachable in dev (Vite SPA fallback) and production (nginx `try_files`). Emails include both a text and an HTML body.

## Risks / Trade-offs

- **Account enumeration** → Identical request responses and no mail for unknown/passwordless accounts.
- **Token leakage through logs in the fallback sender** → The console fallback is for local development; document that production must configure SMTP, and keep the log concise.
- **Token in a URL (referrer/history)** → Use a short TTL, single-use tokens, and note that the reset page should not load third-party resources.
- **Email delivery failures silently ignored for reset requests** → Acceptable for non-enumeration; log the failure. Confirm-flow errors are surfaced to the user.
- **Registration coupled to a slow SMTP server** → Keep the welcome send awaited-but-caught; if latency becomes an issue, move it off the request path later without changing the spec.
- **Migration and nullable password interplay** → Reset targets only non-null passwords; the FK cascade removes tokens when an account is deleted.
- **`SMTP_URL` credentials in configuration** → Never logged; validated as a URL and only read by `createEmailSender`.

## Migration Plan

1. Add `nodemailer` and install.
2. Update the environment schema and `.env.example`/compose with the optional variables.
3. Add the `password_reset_tokens` table to the Drizzle schema, run `npm run db:generate`, and review the committed SQL.
4. Wire the sender, repository, service, controller, and routes; add the frontend views.
5. Run `npm run check`. Rollback is reverting the commit and dropping the new table; no existing data changes.

## Open Questions

- None that affect the specs, approach, or task breakdown.
