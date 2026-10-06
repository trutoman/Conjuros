## Purpose

Allows a user to sign in to or register with Conjuros using their Google account through OAuth 2.0 / OpenID Connect, resolving the Google identity to a local account and issuing the same session used by email/password sign-in.

## ADDED Requirements

### Requirement: Start Google sign-in

The system SHALL expose a public endpoint that starts the Google OAuth 2.0 / OpenID Connect Authorization Code flow. The response MUST redirect the browser to Google's authorization endpoint with the configured client identifier, the requested `openid email profile` scopes, a one-time `state` value and PKCE parameters bound to the user's browser session.

#### Scenario: Signed-out user starts Google sign-in
- **WHEN** a signed-out user requests the Google sign-in start endpoint
- **THEN** the system responds with a redirect to Google's authorization endpoint
- **AND** the redirect includes the requested scopes, a `state` value and a PKCE challenge

#### Scenario: Start endpoint is public
- **WHEN** an unauthenticated client requests the Google sign-in start endpoint
- **THEN** the system does not require an existing session to begin the flow

### Requirement: Complete Google sign-in via callback

The system SHALL handle Google's redirect back with an authorization `code`. On success it MUST validate the returned `state`, exchange the code for tokens, validate the Google ID token, resolve the resulting identity to a local account, create a session, and redirect the browser back to the application. The issued session MUST be the same `conjuros_session` cookie used by email/password sign-in and MUST carry the same expiry semantics.

#### Scenario: Successful callback establishes a session
- **WHEN** Google redirects back with a valid `state` and authorization `code`
- **THEN** the system resolves the Google identity to a local account
- **AND** sets the `conjuros_session` cookie
- **AND** redirects the browser to the application as an authenticated user

#### Scenario: State does not match
- **WHEN** the callback `state` is missing or does not match the value bound to the browser session
- **THEN** the system does not create a session
- **AND** redirects the browser to the application with an authentication error indication

#### Scenario: Consent is denied or exchange fails
- **WHEN** Google reports an error (for example the user denies consent) or the code exchange or ID token validation fails
- **THEN** the system does not create a session
- **AND** redirects the browser to the application with an authentication error indication

### Requirement: Resolve Google identity to a local account

The system SHALL resolve a validated Google identity to exactly one local account. It MUST link the Google identity to an existing account whose email matches the Google account's verified email, and MUST create a new account when no such account exists. A newly created Google account MUST have no local password.

#### Scenario: Existing account with matching verified email is linked
- **WHEN** a validated Google identity has a verified email matching an existing local account
- **THEN** the system links the Google identity to that account
- **AND** signs the user into the existing account
- **AND** does not create a duplicate account

#### Scenario: Unknown verified email creates a new account
- **WHEN** a validated Google identity has a verified email with no matching local account
- **THEN** the system creates a new account for that email
- **AND** the new account has no local password

#### Scenario: Returning Google user signs in again
- **WHEN** a validated Google identity belongs to an account already linked to that Google identity
- **THEN** the system signs the user into that same account
- **AND** does not create a duplicate account

### Requirement: Require a verified Google email

The system SHALL accept a Google identity only when Google reports the email as verified. An identity without a verified email MUST be rejected and MUST NOT create or link an account.

#### Scenario: Unverified email is rejected
- **WHEN** a validated Google identity reports the email as unverified
- **THEN** the system does not create or link an account
- **AND** does not create a session
- **AND** redirects the browser to the application with an authentication error indication

### Requirement: Preserve email/password authentication

The system SHALL keep the existing email/password registration and sign-in behavior working. An account created or linked through Google that has no local password MUST NOT authenticate through the password endpoint, and password sign-in MUST fail with the existing invalid-credentials response rather than an internal error.

#### Scenario: Password sign-in still works for password accounts
- **WHEN** a user submits valid email/password credentials for a password account
- **THEN** the system signs the user in as before

#### Scenario: Password sign-in against a Google-only account fails safely
- **WHEN** a user submits a password for an account that has no local password
- **THEN** the system rejects the attempt with the existing invalid-credentials response
- **AND** does not raise an internal error

### Requirement: Google provider configuration

The system SHALL read the Google client identifier, client secret and callback/redirect base URL from validated configuration. When the Google credentials are not configured, Google sign-in MUST be unavailable and the system MUST still start and serve the remaining functionality, including email/password authentication.

#### Scenario: Configured provider enables Google sign-in
- **WHEN** the Google client identifier and secret are configured
- **THEN** the Google sign-in start endpoint begins the authorization flow

#### Scenario: Unconfigured provider disables Google sign-in
- **WHEN** the Google client identifier or secret is absent
- **THEN** the system starts successfully
- **AND** email/password authentication remains available
- **AND** the Google sign-in start endpoint does not begin an authorization flow

### Requirement: Do not expose Google identifiers in the public profile

The public authenticated-user profile returned by the API SHALL NOT include the stored Google subject identifier or any other persistence-only field.

#### Scenario: Profile omits Google identifier
- **WHEN** an authenticated user's profile is returned by the API
- **THEN** the response contains no Google subject identifier
