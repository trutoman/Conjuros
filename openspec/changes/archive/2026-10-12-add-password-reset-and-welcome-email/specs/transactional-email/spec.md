## Purpose

Provides the outbound email seam used to send account messages, starting with the welcome email sent when an account is created by registration, and defines how the system behaves when email is configured, absent, or failing.

## ADDED Requirements

### Requirement: Outbound email delivery seam

The system SHALL send outbound email through a single configurable sender. When SMTP is configured the sender SHALL deliver through it; when it is not configured the system SHALL use a non-delivering fallback that records the message and MUST NOT fail application operations. The sender SHALL be injectable so tests can substitute an in-memory implementation without network access.

#### Scenario: Configured SMTP delivers the message

- **WHEN** email is configured and the system sends a message
- **THEN** the message is delivered through the configured SMTP transport

#### Scenario: Unconfigured email keeps the app working

- **WHEN** email is not configured
- **THEN** the system starts and serves its features
- **AND** sending a message uses the non-delivering fallback instead of failing

#### Scenario: A delivery failure does not break the triggering operation

- **WHEN** the sender raises an error while sending a message
- **THEN** the operation that triggered the email still completes successfully

### Requirement: Welcome email on registration

The system SHALL send a welcome email to the account's address when an account is created through registration. A failure to send the welcome email MUST NOT fail or roll back the registration, and the user SHALL still be registered and signed in.

#### Scenario: Successful registration sends a welcome email

- **WHEN** a user registers a new account successfully
- **THEN** the system sends a welcome email to that account's address

#### Scenario: Welcome email failure does not fail registration

- **WHEN** the welcome email cannot be sent
- **THEN** registration still succeeds and the user is signed in

### Requirement: Email configuration

The system SHALL read email delivery and application base configuration from validated configuration. Email settings SHALL be optional so the system starts without them, and an invalid value SHALL stop startup while naming the invalid variable.

#### Scenario: Email settings are optional

- **WHEN** no email settings are provided
- **THEN** the system starts successfully

#### Scenario: Invalid email settings stop startup

- **WHEN** an email setting is present but malformed
- **THEN** startup fails and the error names the invalid variable
