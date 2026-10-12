## 1. Dependencies and configuration

- [x] 1.1 Add `nodemailer` as a runtime dependency and `@types/nodemailer` as a dev dependency, and install them (lockfile updated)
- [x] 1.2 Extend `src/api/config/environment.ts` with optional `SMTP_URL` (validated as an `smtp:`/`smtps:` URL), optional `MAIL_FROM` (email, required when `SMTP_URL` is set), optional `APP_BASE_URL` (defaults to `CORS_ORIGIN`), and optional `PASSWORD_RESET_TTL_MINUTES` (positive integer, default 60)
- [x] 1.3 Document the new variables in `.env.example`, pass them to the `api` service in `docker-compose.yml`, and note the email setup in `README.md` and `AGENTS.md`
- [x] 1.4 Extend `src/tests/api/environment.test.ts`: absent email settings parse with defaults, configured values parse, malformed values throw a named error, and `MAIL_FROM` is required when `SMTP_URL` is set

## 2. Email seam and templates

- [x] 2.1 Create the `EmailSender` interface and `EmailMessage` shape (`to`, `subject`, `text`, `html?`) under `src/api/email/`
- [x] 2.2 Implement `SmtpEmailSender` using `nodemailer.createTransport(SMTP_URL)` and `sendMail`, setting the configured `MAIL_FROM`
- [x] 2.3 Implement a non-delivering `ConsoleEmailSender` fallback that records/logs the message and never throws
- [x] 2.4 Implement `createEmailSender(config)` selecting SMTP when configured and the fallback otherwise
- [x] 2.5 Add welcome and reset email builders that produce text and HTML bodies, with the reset email containing `${APP_BASE_URL}/reset-password?token=<token>`
- [x] 2.6 Add unit tests: the fallback does not throw and does not deliver, `createEmailSender` selects the right implementation, and the reset email contains the reset link with the token

## 3. Data model and repositories

- [x] 3.1 Add the `password_reset_tokens` table to `src/api/db/schema.ts` (`id`, `user_id` FK cascade, unique `token_hash`, `expires_at`, nullable `used_at`, `created_at`)
- [x] 3.2 Generate the migration with `npm run db:generate` and review the committed SQL under `drizzle/`
- [x] 3.3 Add the `PasswordResetTokensRepository` interface and `StoredPasswordResetToken` with `create`, `findByTokenHash`, `markUsed`, and `deleteUnusedForUser`
- [x] 3.4 Implement `PostgresPasswordResetTokensRepository` and `InMemoryPasswordResetTokensRepository`
- [x] 3.5 Add `updatePasswordHash(id, passwordHash)` to the `UsersRepository` interface and both implementations
- [x] 3.6 Add repository tests (Postgres via PGlite and in-memory): create/find by hash, mark used, delete unused for a user, unique hash constraint, and cascade delete when the user is removed

## 4. Password reset and welcome services

- [x] 4.1 Create `src/api/services/password-reset.service.ts` with token helpers (cryptographically random token, SHA-256 hash) and `requestPasswordReset`: find the account, skip passwordless/unknown accounts, invalidate outstanding tokens, store the new hash, and send the reset email
- [x] 4.2 Implement `resetPassword`: reject unknown/expired/used tokens with an invalid-or-expired error, bcrypt-hash the new password, update the account, and mark the token used
- [x] 4.3 Ensure password policy validation happens before the token is consumed so a rejected password leaves the token usable
- [x] 4.4 Add a `sendWelcomeEmail` helper that awaits the sender and catches/logs errors so it never rejects
- [x] 4.5 Add unit tests with an in-memory sender and repository: request sends for a password account and not for unknown/passwordless; response behavior is identical; confirm succeeds and changes the password; a weak password is rejected without consuming the token; expired, used, and unknown tokens are rejected; a second request invalidates the first token

## 5. Contracts and HTTP layer

- [x] 5.1 Add `passwordResetRequestSchema` and `passwordResetConfirmSchema` (token plus `passwordSchema`) and their inferred types to `packages/contracts/src/auth.ts`
- [x] 5.2 Add `requestPasswordReset` and `confirmPasswordReset` handlers to `src/api/controllers/auth.controller.ts`, using `parseCredentialsOrThrow` so password policy messages surface, returning the generic request message and the success message, and setting no session cookie
- [x] 5.3 Register the public `POST /api/auth/password-reset/request` and `POST /api/auth/password-reset/confirm` routes in `src/api/routes/auth.route.ts` (not behind `requireAuth`)
- [x] 5.4 Thread the email sender, reset-tokens repository, app base URL, and TTL through `AppDependencies`, `createApp`, and `src/api/server.ts`
- [x] 5.5 Send the welcome email after a successful registration in the auth controller without affecting the response
- [x] 5.6 Add API tests: the request endpoint returns the generic message for existing, unknown, and passwordless emails; confirm resets the password and the new one signs in while the old fails; a weak password returns the policy message; an invalid token returns the invalid-or-expired message; no `conjuros_session` cookie is set by reset; registration still succeeds when the sender throws

## 6. Frontend

- [x] 6.1 Add a "Forgot password?" action to `AuthScreen` in `src/web/App.tsx` that opens a request view posting to `/api/auth/password-reset/request` and showing the generic message
- [x] 6.2 Add a `ResetPasswordScreen` rendered when the path is `/reset-password`, reading the `token` query parameter and posting to `/api/auth/password-reset/confirm` with a single new-password field
- [x] 6.3 On a successful reset, redirect to the sign-in view (replace the URL to `/`) and show a success message; keep forms free of client-side validation
- [x] 6.4 Add frontend tests: the forgot-password view posts and shows the API message, and the reset view submits the token and password and shows errors returned by the API

## 7. Verification

- [x] 7.1 Run `npm run check` (lint → test → build) and resolve any failures
- [x] 7.2 Manually verify the end-to-end flow using the console fallback or a local SMTP catcher: request a reset, open the link, set a new password, sign in with it, and confirm a welcome email is produced on registration
