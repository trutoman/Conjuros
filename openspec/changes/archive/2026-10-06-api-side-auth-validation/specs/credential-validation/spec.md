## Purpose

Defines how the API validates email/password credentials for account creation and sign-in, including the password strength policy and the error messages returned to the client, so validation lives in one place and sign-in failures never disclose which field was wrong.

## ADDED Requirements

### Requirement: API is the single validation authority for credentials

The system SHALL accept credential submissions from the account form without performing client-side validation, and the API SHALL validate the submitted email and password and respond with either a successful result or a message describing the problem found. Browser-native constraints (for example `required`, `minlength`, or email-type checks) MUST NOT block submission; the form MUST send every entry to the credentials endpoint and display the API's response.

#### Scenario: Form submits whatever the user entered

- **WHEN** a user submits the account form with any email and password values
- **THEN** the browser sends the request to the credentials endpoint without applying its own input constraints

#### Scenario: API returns success

- **WHEN** the submitted credentials satisfy the API rules
- **THEN** the API responds with the authenticated user
- **AND** the form treats the submission as successful

#### Scenario: API returns the problem found

- **WHEN** the submitted credentials violate an API rule
- **THEN** the API responds with an error whose message states the problem found
- **AND** the form displays that message

### Requirement: Password strength policy

The system SHALL require every password to be at least 8 and at most 128 characters long and to contain at least one uppercase letter, at least one lowercase letter, at least one number, and at least one special (non-alphanumeric) character. A password that fails any of these rules MUST be rejected with a message naming the unmet rule.

#### Scenario: Password meeting every rule is accepted

- **WHEN** a user submits a password that is 8 to 128 characters and includes an uppercase letter, a lowercase letter, a number, and a special character
- **THEN** the API accepts the password

#### Scenario: Password shorter than the minimum is rejected

- **WHEN** a submitted password has fewer than 8 characters
- **THEN** the API rejects it with a message stating the minimum length

#### Scenario: Password without an uppercase letter is rejected

- **WHEN** a submitted password contains no uppercase letter
- **THEN** the API rejects it with a message stating that an uppercase letter is required

#### Scenario: Password without a lowercase letter is rejected

- **WHEN** a submitted password contains no lowercase letter
- **THEN** the API rejects it with a message stating that a lowercase letter is required

#### Scenario: Password without a number is rejected

- **WHEN** a submitted password contains no number
- **THEN** the API rejects it with a message stating that a number is required

#### Scenario: Password without a special character is rejected

- **WHEN** a submitted password contains no special character
- **THEN** the API rejects it with a message stating that a special character is required

#### Scenario: Password longer than the maximum is rejected

- **WHEN** a submitted password has more than 128 characters
- **THEN** the API rejects it with a message stating the maximum length

### Requirement: Uniform invalid-credentials response

The system SHALL reject a sign-in attempt with an unknown email, an incorrect password, or an account that has no local password using the same generic invalid-credentials message. The response MUST NOT reveal whether the email exists or whether only the password was wrong.

#### Scenario: Unknown email returns the generic message

- **WHEN** a user signs in with an email that has no account
- **THEN** the API rejects the attempt with the generic invalid-credentials message

#### Scenario: Incorrect password returns the generic message

- **WHEN** a user signs in with an existing email and an incorrect password
- **THEN** the API rejects the attempt with the same generic invalid-credentials message

#### Scenario: Passwordless account returns the generic message

- **WHEN** a user signs in with the email of an account that has no local password
- **THEN** the API rejects the attempt with the same generic invalid-credentials message

### Requirement: Registration reports an existing account

The system SHALL reject a registration attempt whose email already belongs to an account, responding with a message stating that an account with that email already exists, without disclosing any other account data.

#### Scenario: Email already registered

- **WHEN** a user attempts to register with an email that already has an account
- **THEN** the API rejects the attempt with a message stating that an account with this email already exists
