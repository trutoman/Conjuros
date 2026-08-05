# auth-service-unit-tests Specification

## Purpose
Ensures the authentication service layer functions correctly handle error cases and data validation through direct unit tests, independent of HTTP integration tests.
## Requirements
### Requirement: readSession validates JWT tokens correctly

The `readSession` function SHALL verify JWT tokens and convert all verification failures into AppError instances with status 401 and code 'AUTH_ERROR'.

#### Scenario: Valid token returns authenticated user

- **WHEN** a valid JWT token is provided with a valid secret
- **THEN** the function returns an AuthenticatedUser object with id and email

#### Scenario: Invalid JWT signature is rejected

- **WHEN** a JWT token with an invalid signature is provided
- **THEN** the function throws AppError with status 401, code 'AUTH_ERROR', and message 'Your session is invalid or expired'

#### Scenario: Expired JWT token is rejected

- **WHEN** a JWT token that has expired is provided
- **THEN** the function throws AppError with status 401, code 'AUTH_ERROR', and message 'Your session is invalid or expired'

#### Scenario: Malformed payload is rejected

- **WHEN** a JWT token with missing or invalid id/email fields is provided
- **THEN** the function throws AppError with status 401, code 'AUTH_ERROR', and message 'Your session is invalid or expired'

