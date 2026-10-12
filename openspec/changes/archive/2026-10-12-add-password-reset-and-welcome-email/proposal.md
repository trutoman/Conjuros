## Why

An account can only be reached with a password the user must remember; if they forget it there is no way back in, and there is no outbound email at all. Users also get no confirmation that their sign-up succeeded. Adding standard email-based password recovery plus a welcome email closes both gaps and makes the email/password flow self-service.

## What Changes

- Add outbound transactional email: a configurable SMTP sender (nodemailer) with optional configuration, and a development fallback that logs messages instead of sending so local runs keep working without a mail server.
- Send a welcome email to the user's address when an account is created through registration. A failed welcome email MUST NOT fail or roll back registration.
- Add password recovery by email: a request endpoint that takes an email and, when a matching account exists, emails a one-time link to a reset screen; the response is the same whether or not the account exists so it cannot be used to enumerate accounts.
- Add a reset endpoint that takes the one-time token and a new password, validates the password with the existing strong policy, replaces the stored password, and invalidates the token. Expired, unknown, or already-used tokens are rejected with a message.
- Store reset tokens server-side as a hash with an expiry and a used marker; issuing a new token invalidates the user's outstanding ones. Tokens are single-use.
- Frontend: a "Forgot password?" path from the sign-in screen that requests the email, and a reset screen reached from the emailed link where the user sets a new password and is redirected back to sign-in on success. Consistent with existing behavior, these forms perform no client-side validation and display the API's message.
- Configuration adds optional `SMTP_URL`, `MAIL_FROM`, `APP_BASE_URL` (for building the emailed link) and `PASSWORD_RESET_TTL_MINUTES`; the app still boots when email is not configured.
- Passwordless (external-identity-only) accounts are out of scope for reset: they have no local password to reset.

## Capabilities

### New Capabilities
- `password-reset`: Email-initiated password recovery, including the request and confirm behavior, one-time token lifecycle (hash, expiry, single use, invalidation), non-enumerating responses, password policy reuse, and the redirect back to sign-in.
- `transactional-email`: Outbound email delivery seam and configuration, the welcome email sent on successful registration, and the degraded behavior when email is not configured or delivery fails.

### Modified Capabilities
<!-- No existing spec's requirements change: credential-validation's password policy is reused as-is, and external-identity-accounts' passwordless behavior is preserved (those accounts are not reset targets). -->

## Impact

- **Dependencies**: add `nodemailer` as a runtime dependency (and its types) for SMTP delivery.
- **Database**: new `password_reset_tokens` table (owner, token hash, expiry, used timestamp) and a generated migration under `drizzle/`.
- **API**: `src/api/config/environment.ts` (email and reset variables), new `src/api/email/` sender + templates, new `src/api/repositories/password-reset-tokens.repository.ts` (Postgres + in-memory), `UsersRepository.updatePasswordHash`, new `src/api/services/password-reset.service.ts`, `src/api/services/auth.service.ts` (welcome email hook), `src/api/controllers/auth.controller.ts`, `src/api/routes/auth.route.ts`, `src/api/app.ts` and `src/api/server.ts` wiring.
- **Contracts**: `packages/contracts/src/auth.ts` gains the password-reset request/confirm shapes, reusing `passwordSchema`; no persistence-only fields exposed.
- **Frontend**: `src/web/App.tsx` gains the forgot-password request view, the reset view read from the URL, and the redirect back to sign-in.
- **Tests**: environment parsing, reset-token repository, password-reset service (valid, expired, used, unknown token, non-enumeration), email sender fallback, registration welcome-email behavior, API routes, and the frontend screens, using an injected in-memory email sender.
- **Docs/config**: `.env.example`, `README.md`, `AGENTS.md` and `docker-compose.yml` document/pass the new email variables.
