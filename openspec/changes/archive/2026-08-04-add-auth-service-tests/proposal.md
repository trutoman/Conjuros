## Why

The `readSession` function in `auth.service.ts` contains critical error handling that converts all JWT verification failures into AppError instances, but this logic is not directly tested. Currently, only integration tests verify authentication through HTTP endpoints, leaving the service layer error handling unverified.

## What Changes

Add a dedicated test file for `auth.service.ts` that verifies the `readSession` function handles various failure scenarios correctly, ensuring that malformed tokens, invalid signatures, expired tokens, and invalid payloads all throw the expected AppError with status 401.

## Capabilities

### New Capabilities
- `auth-service-unit-tests`: Direct unit tests for auth service functions, starting with `readSession` error handling

### Modified Capabilities
<!-- No existing capabilities are being modified -->

## Impact

- `src/tests/api/auth.service.test.ts`: New test file covering `readSession` success and error cases
