## 1. Test File Setup

- [x] 1.1 Create `src/tests/api/auth.service.test.ts` file
- [x] 1.2 Add necessary imports (vitest, auth.service functions, AppError)

## 2. Implement readSession Tests

- [x] 2.1 Add test for valid token returning authenticated user
- [x] 2.2 Add test for invalid JWT signature throwing AppError 401
- [x] 2.3 Add test for expired JWT token throwing AppError 401
- [x] 2.4 Add test for malformed payload (missing id/email) throwing AppError 401

## 3. Verify

- [x] 3.1 Run `npm run test` to verify all tests pass
- [x] 3.2 Verify test coverage includes all readSession error paths
