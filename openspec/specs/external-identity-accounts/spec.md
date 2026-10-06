# external-identity-accounts Specification

## Purpose

Defines the account model and authentication seam that lets a Conjuros user exist and sign in without a local password and be identified by an external provider identity, without committing to any specific provider.

## Requirements

### Requirement: Passwordless accounts

The system SHALL allow a user account to exist without a local password. Storing an account without a password MUST be a supported state rather than an error, and existing accounts with passwords MUST continue to store and verify them as before.

#### Scenario: Account is created without a password
- **WHEN** an account is created for an externally-identified user
- **THEN** the account is stored successfully with no password
- **AND** the account can be read back with no password

#### Scenario: Existing password accounts are unaffected
- **WHEN** an account with a password already exists
- **THEN** its password remains stored and usable for sign-in

### Requirement: Safe password sign-in for passwordless accounts

The system SHALL reject a password sign-in attempt for an account that has no local password using the same invalid-credentials response as a wrong password. A passwordless account MUST NOT cause an internal error during password sign-in.

#### Scenario: Password submitted for a passwordless account
- **WHEN** a user submits an email and password whose account has no local password
- **THEN** the system rejects the attempt as invalid credentials
- **AND** does not raise an internal error

#### Scenario: Password sign-in still works for password accounts
- **WHEN** a user submits valid credentials for an account that has a password
- **THEN** the system signs the user in

### Requirement: External provider identity on accounts

The system SHALL associate at most one external provider identity with an account, stored so it can be looked up directly. Multiple accounts MUST be allowed to have no external identity at the same time, and the same external identity MUST NOT be associated with more than one account.

#### Scenario: Many accounts have no external identity
- **WHEN** multiple accounts exist without an external identity
- **THEN** all of them are stored successfully

#### Scenario: External identity is unique
- **WHEN** an external identity is already associated with one account
- **THEN** associating the same external identity with another account is rejected

#### Scenario: Lookup by external identity
- **WHEN** an account has an associated external identity
- **THEN** the account can be retrieved by that external identity

### Requirement: Provider-agnostic account resolution

The system SHALL resolve a verified external identity to a local account without depending on the provider's transport. Resolution MUST sign in the account already linked to the external identity, otherwise link and sign in the existing account whose email matches the identity's verified email, otherwise create and sign in a new passwordless account. An identity whose email is not verified, or that carries no email, MUST be rejected and MUST NOT create or link an account.

#### Scenario: Identity already linked
- **WHEN** a verified external identity is already linked to an account
- **THEN** the system resolves to that same account
- **AND** does not create a duplicate account

#### Scenario: Verified email matches an existing account
- **WHEN** a verified external identity has an email matching an existing account
- **THEN** the system links the external identity to that account
- **AND** resolves to that account

#### Scenario: Verified email matches no account
- **WHEN** a verified external identity has an email matching no existing account
- **THEN** the system creates a new passwordless account
- **AND** resolves to the new account

#### Scenario: Unverified or absent email is rejected
- **WHEN** an external identity has an unverified email or no email
- **THEN** the system does not link or create an account
- **AND** does not resolve to any account

### Requirement: External identity is not publicly exposed

The public authenticated-user profile returned to clients SHALL NOT include the stored external provider identity or any other persistence-only field.

#### Scenario: Profile omits external identity
- **WHEN** an authenticated user's public profile is returned
- **THEN** the response contains no external provider identity
