## Purpose

Lets a user who forgot their password recover access by email: they request a link, open a reset screen from that link, choose a new password under the existing strength policy, and are returned to sign-in.

## ADDED Requirements

### Requirement: Request password reset by email

The system SHALL expose a public endpoint that accepts an email address. When an account with a local password matches the address, the system SHALL create a one-time reset token and send a reset email to that address. The endpoint SHALL respond with the same generic confirmation message whether or not a matching account exists, so the response cannot be used to discover which emails have accounts.

#### Scenario: Existing password account receives a reset email

- **WHEN** a user requests a reset for an email that belongs to an account with a local password
- **THEN** the system creates a one-time reset token for that account
- **AND** sends a reset email containing the token to that address
- **AND** responds with the generic confirmation message

#### Scenario: Unknown email gets the same confirmation

- **WHEN** a user requests a reset for an email that has no account
- **THEN** the system sends no email
- **AND** responds with the same generic confirmation message as for an existing account

#### Scenario: Passwordless account gets the same confirmation

- **WHEN** a user requests a reset for an account that has no local password
- **THEN** the system sends no reset email
- **AND** responds with the same generic confirmation message

### Requirement: One-time reset token lifecycle

The system SHALL generate each reset token with sufficient randomness and SHALL store only a hash of it, never the plaintext token. A token SHALL expire after a configured lifetime and SHALL be usable at most once. Issuing a new token for an account SHALL invalidate that account's outstanding unused tokens. A token's plaintext value MUST NOT be returned by any API response.

#### Scenario: A token can be used only once

- **WHEN** a valid reset token has already been used to change a password
- **THEN** a later attempt to use the same token is rejected

#### Scenario: An expired token is rejected

- **WHEN** a reset token is presented after its lifetime has passed
- **THEN** the system rejects it with an invalid-or-expired message

#### Scenario: A new request invalidates the previous token

- **WHEN** a user requests a reset a second time while an earlier token is still unused
- **THEN** the earlier token is no longer accepted

#### Scenario: Stored tokens are not exposed

- **WHEN** any password reset response is returned
- **THEN** the response contains no reset token value

### Requirement: Complete password reset with a new password

The system SHALL expose a public endpoint that accepts a reset token and a new password. It SHALL validate the password against the account password strength policy and reject a non-conforming password with a message naming the unmet rule without consuming the token. When the token is valid and the password conforms, the system SHALL replace the account's stored password, mark the token used, and respond with a success message. The reset MUST NOT create a session; the user returns to sign-in.

#### Scenario: Valid token and conforming password change the password

- **WHEN** a user submits a valid unused token with a password that meets the policy
- **THEN** the system replaces the stored password with the new one
- **AND** marks the token used
- **AND** responds with a success message
- **AND** does not sign the user in

#### Scenario: The new password becomes the sign-in password

- **WHEN** a password has been reset successfully
- **THEN** signing in with the new password succeeds
- **AND** signing in with the previous password fails with the generic invalid-credentials message

#### Scenario: A weak password is rejected without consuming the token

- **WHEN** a user submits a valid token with a password that violates the strength policy
- **THEN** the system rejects it with a message naming the unmet rule
- **AND** leaves the token unused so a conforming password can still be submitted

#### Scenario: An unknown, expired, or used token is rejected

- **WHEN** a user submits a token that is unknown, expired, or already used
- **THEN** the system rejects it with an invalid-or-expired message
- **AND** changes no password

### Requirement: Reset email link targets the reset screen

The reset email SHALL contain a link to the application's password reset screen that carries the one-time token, built from configured application base configuration, so the recipient can open the screen and set a new password.

#### Scenario: Email link opens the reset screen

- **WHEN** a reset email is sent
- **THEN** its body contains a link to the reset screen
- **AND** the link carries the one-time token
