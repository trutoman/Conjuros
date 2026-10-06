## 1. Contracts

- [x] 1.1 Strengthen `passwordSchema` in `packages/contracts/src/auth.ts`: keep `min(8)`/`max(128)` and replace the letter rule with explicit `/[A-Z]/`, `/[a-z]/`, `/[0-9]/` and `/[^A-Za-z0-9]/` rules, each with a message naming the unmet rule
- [x] 1.2 Add a login credentials schema (email plus a present password, no strength rules) and export its inferred type, keeping the strong `passwordSchema` for registration
- [x] 1.3 Confirm the public auth contracts still expose no persistence-only fields

## 2. API validation and messaging

- [x] 2.1 Add a credentials-specific parse helper in `src/api/utils/http.ts` that throws `AppError(400, 'VALIDATION_ERROR', <first issue message>, <issues>)`, leaving the generic `parseOrThrow` unchanged
- [x] 2.2 Update `src/api/controllers/auth.controller.ts` to validate registration with the strong schema and sign-in with the login schema, using the new helper so `error.message` states the problem found
- [x] 2.3 Verify `authenticateUser` still returns the generic `Invalid email or password` for unknown email, wrong password and passwordless accounts
- [x] 2.4 Verify `registerUser` still returns the existing-account message for a duplicate email without exposing account data

## 3. Frontend

- [x] 3.1 Remove the browser-native constraints from `AuthScreen` in `src/web/App.tsx` (`required`, `minLength={8}`, and `type="email"` → `type="text"`), keeping labels, `autoComplete` and accessibility
- [x] 3.2 Ensure the submit handler always posts to `/api/auth/{mode}` and renders the API's message from `error.message` on failure and calls `onAuthenticated` on success

## 4. Tests

- [x] 4.1 Update the `validPassword` fixture in `src/tests/api/testApp.ts` to include an uppercase letter, and adjust any other account-registration fixtures
- [x] 4.2 Add contract/API tests covering each password rule boundary: accepted conforming password, and rejection with the matching message for too short, too long, missing uppercase, missing lowercase, missing number and missing special character
- [x] 4.3 Add API route tests asserting registration with an invalid password returns a message naming the unmet rule and that a duplicate email returns the existing-account message
- [x] 4.4 Add API route tests asserting unknown email, wrong password and passwordless-account sign-ins all return the same generic invalid-credentials message
- [x] 4.5 Add a frontend test asserting `AuthScreen` submits without applying native constraints and displays the API's validation message

## 5. Verification

- [x] 5.1 Run `npm run check` (lint → test → build) and resolve any failures
- [x] 5.2 Manually verify registration and sign-in: a weak password shows the specific rule message, a valid password signs in, and a wrong password shows the generic message
