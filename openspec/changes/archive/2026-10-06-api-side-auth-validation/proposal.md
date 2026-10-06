## Why

Account creation and sign-in currently mix validation between the browser (native `required`, `minLength` and `type="email"` constraints) and the API, so users can be blocked by silent client-side rules and never see the API's explanation. The API must be the single source of truth for credential validation, and the password policy must be strong enough to require mixed character classes while the sign-in error stays generic so it never reveals whether the email or the password was wrong.

## What Changes

- The auth form performs no validation: remove the browser-native constraints (`required`, `minLength`, `type="email"`) and submit every entry to the API, then display the message the API returns (success or the specific problem found).
- The API validates credentials and returns a clear, human-readable message for the problem it found (for example "Password must include at least one uppercase letter"), or the authenticated user on success.
- Strengthen the password policy: at least 8 characters, at least one uppercase letter, at least one lowercase letter, at least one number, and at least one special character (still at most 128 characters).
- Keep the sign-in failure response generic: an unknown email, a wrong password and a passwordless account all return the same invalid-credentials message that does not disclose which field was wrong.
- Preserve registration conflict reporting: submitting an email that already has an account returns a message stating the account already exists.

## Capabilities

### New Capabilities
- `credential-validation`: API-owned validation of email/password credentials for registration and sign-in, covering the no-client-validation contract, the password strength policy, the response message shape, and the uniform invalid-credentials error.

### Modified Capabilities
<!-- No existing spec covers email/password credential validation, so the new capability describes the full behavior rather than a delta. `external-identity-accounts` is unaffected: it already requires the same invalid-credentials response for passwordless accounts, which this capability preserves. -->

## Impact

- **Contracts**: `packages/contracts/src/auth.ts` — `passwordSchema` regexes gain explicit uppercase/lowercase requirements with field-specific messages.
- **API**: `src/api/utils/http.ts` (`parseOrThrow` message surfacing) and/or `src/api/errors.ts` so credential validation failures carry a specific message; `src/api/services/auth.service.ts` keeps the generic invalid-credentials error.
- **Frontend**: `src/web/App.tsx` `AuthScreen` — remove native input constraints and read the API's specific validation message from the error response.
- **Tests**: contracts/API tests for the password policy boundaries and error shapes, and a frontend test asserting the form submits and renders the API message without client-side blocking.
