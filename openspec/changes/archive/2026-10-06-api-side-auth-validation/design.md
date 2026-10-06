## Context

See `proposal.md` for motivation. Current state that shapes the approach:

- `AuthScreen` (`src/web/App.tsx`) posts `{ email, password }` to `/api/auth/login` and `/api/auth/register` and already displays `body.error.message`. The inputs carry browser-native constraints: `type="email"`, `required` and `minLength={8}` on the password.
- Credential shapes live in `packages/contracts/src/auth.ts`. `passwordSchema` currently enforces 8–128 chars plus "at least one letter" (`[A-Za-z]`), one number and one special character, so it does not distinguish uppercase from lowercase. `credentialsSchema` is used for both register and login.
- The controller (`src/api/controllers/auth.controller.ts`) validates with `parseOrThrow(credentialsSchema, request.body)`. `parseOrThrow` (`src/api/utils/http.ts`) throws `AppError(400, 'VALIDATION_ERROR', 'Invalid request data', issues)`; `errorHandler` returns `{ error: { code, message, details } }`. The generic message hides the per-field rule messages that Zod already produced and stored in `details`.
- `authenticateUser` already throws `401 AUTH_ERROR` with the message `Invalid email or password` for unknown email, wrong password and passwordless accounts; `registerUser` throws `409 CONFLICT` with `An account with this email already exists`.
- Test fixtures register with `validPassword = 'correct-horse-battery-staple-1'` (`src/tests/api/testApp.ts`), which has no uppercase letter.

## Goals / Non-Goals

**Goals:**
- Make the API the only place that validates credentials, with browser-native constraints removed.
- Return a specific, user-facing message for the credential rule that failed.
- Strengthen the creation password policy to require upper, lower, number and special classes.
- Keep sign-in failures uniform and non-disclosing.

**Non-Goals:**
- No change to the JWT/cookie session model, `requireAuth`, or Google/external-identity flows.
- No password reset, password change, breach checking, or account lockout/rate limiting.
- No redesign of the auth screen layout or styling.
- No change to how other endpoints surface validation errors.

## Decisions

### Strengthen `passwordSchema` with explicit character-class regexes

Replace the single `[A-Za-z]` regex with separate rules and messages: `/[A-Z]/` ("uppercase"), `/[a-z]/` ("lowercase"), `/[0-9]/` ("number") and `/[^A-Za-z0-9]/` ("special character"), keeping `min(8)` and `max(128)`. A non-alphanumeric character is the definition of "special", which is locale-independent and simple to test.

*Alternative considered:* a single `refine` callback producing one combined message. Rejected because per-rule messages are what the API must return and are individually testable.

### Separate registration and login schemas

Keep the strong `passwordSchema` for registration and add a login shape that only requires the password to be present (for example `z.string().min(1).max(128)`). Apply the strength policy on creation only. Enforcing it on login would reject existing accounts whose stored password predates the stronger policy, effectively locking them out.

*Alternative considered:* keep one `credentialsSchema` for both paths. Rejected because of the legacy-password lockout risk above.

### Surface the first validation issue as the error message for credentials

Add a credentials-specific parse helper (for example `parseCredentialsOrThrow` in `src/api/utils/http.ts`) that throws `AppError(400, 'VALIDATION_ERROR', firstIssue.message, issues)`. The auth controller uses it so `error.message` states the problem, while `details` still carries every issue for API clients. The generic `parseOrThrow` stays untouched so other endpoints keep their current response.

*Alternative considered:* change the global `parseOrThrow` to always use the first issue message. Rejected to avoid altering unrelated endpoint responses; a targeted helper keeps the blast radius small.
*Alternative considered:* keep the generic message and have the frontend read `details[0].message`. Rejected because it spreads validation-message knowledge into the client and leaves `error.message` unhelpful for API consumers.

### Remove browser-native constraints from the auth form

Drop `required`, `minLength` and `type="email"` (use `type="text"` for the email field) and let the form submit every entry to the API. The submit handler keeps its existing flow: show `body.error.message` on failure, call `onAuthenticated` on success. Labels, `autoComplete` and accessibility semantics stay.

*Alternative considered:* keep native constraints and only soften them. Rejected because the requirement is that the form perform no validation.

### Keep the generic invalid-credentials error unchanged

`authenticateUser` already returns `Invalid email or password` for all three failure cases; no code change is needed there, and the new spec pins that behavior.

### Update the shared test password fixture

Change `validPassword` in `src/tests/api/testApp.ts` to include an uppercase letter (for example `Correct-horse-battery-staple-1`) so API tests using registration keep passing under the new policy; adjust any other fixtures that register accounts.

## Risks / Trade-offs

- **Existing accounts with passwords that do not meet the stronger policy** → Apply the strength policy only to registration; login only requires a present password, so existing users keep signing in.
- **Removing native validation worsens immediate feedback** → The API returns the precise rule message, which the form already renders; this is the intended single-source behavior.
- **Per-field messages could be used to enumerate accounts** → Only registration messages mention existing accounts, as today; sign-in stays uniform and non-disclosing.
- **Shared `passwordSchema` change ripples into fixtures** → Update the `validPassword` fixture and re-run `npm run check`.
- **`type="text"` loses mobile email keyboards** → Acceptable for this constraint; `autoComplete="email"` is retained for autofill.

## Migration Plan

1. Update `packages/contracts/src/auth.ts` (stronger password rules, login schema) and the test fixtures.
2. Update the API controller/parse helper and the frontend form together; behavior is backward compatible because account data and sessions are untouched.
3. Run `npm run check` (lint → test → build). No database migration is required.

## Open Questions

- None that affect the specs, approach, or task breakdown.
