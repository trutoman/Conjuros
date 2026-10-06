## Why

Today the only way into Conjuros is an email/password account, so users must create and remember yet another password. Many already have a Google account and expect a one-click sign-in. Adding Google OAuth 2.0 / OpenID Connect lets users sign in or register with their Google account while keeping the existing password flow working for everyone else.

## What Changes

- Add a Google sign-in flow on top of the existing password authentication: a "Continue with Google" action starts the Google OAuth 2.0 / OpenID Connect Authorization Code flow, and the callback resolves the Google identity to a local user and issues the existing `conjuros_session` cookie.
- The API exposes two new public endpoints: one that redirects the browser to Google's consent screen and one that handles Google's redirect back, then redirects the browser to the app. Both reuse the current JWT cookie session, so all downstream auth stays unchanged.
- Account resolution: a Google identity matched by its verified email is linked to the existing local account; otherwise a new account is created. Google-only accounts have no local password.
- **BREAKING (schema)**: `users.password_hash` becomes nullable so Google-only accounts can exist; the `create()` repository path and password sign-in must tolerate accounts without a password. A new nullable, unique `google_id` column stores the Google subject identifier.
- Configuration adds `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and a callback/redirect base URL, validated at startup like the rest of the environment. When Google credentials are absent, Google sign-in is disabled but the rest of the app still boots.
- The login screen gains a "Continue with Google" control that navigates to the API's Google start endpoint; the email/password form is unchanged.
- Update docs and `.env.example` with the new variables and the Google Cloud Console setup steps.

## Capabilities

### New Capabilities
- `google-oauth-login`: Google OAuth 2.0 / OpenID Connect sign-in and registration, including the consent redirect, callback handling, identity/account linking, session issuance, provider configuration and failure handling.

### Modified Capabilities
<!-- No existing spec covers email/password authentication, so password sign-in behavior is described inside the new capability rather than as a delta. -->

## Impact

- **Dependencies**: add Google's official Node library (`google-auth-library`) for token/code verification and ID token validation.
- **API code**: `src/api/config/environment.ts` (new Google variables), `src/api/db/schema.ts` (`passwordHash` nullable, new `googleId`), a new migration under `drizzle/`, `src/api/repositories/users.repository.ts` (nullable password, find/create by Google id, email linking), `src/api/services/auth.service.ts`, a new Google auth controller/service, `src/api/controllers/auth.controller.ts`, `src/api/routes/auth.route.ts`, `src/api/app.ts` and `src/api/server.ts` wiring.
- **Contracts**: `packages/contracts/src/auth.ts` gains the Google-related request/response shapes; public user profile fields stay persistence-agnostic (no `googleId` exposed).
- **Frontend**: `src/web/App.tsx` `AuthScreen` adds the Google button and handles the callback error query parameter.
- **Tests**: unit tests for the Google service (identity resolution, new vs. linked account, disabled provider, invalid/absent email, unverified email) using the in-memory users repository, plus API route tests for start/callback and the existing password path still passing.
- **Docs**: `README.md`, `AGENTS.md`, `.env.example` and `docker-compose.yml` (pass Google variables to the API container).
