## Context

The project already has a test suite using Vitest and supertest. The `src/tests/api/` directory contains integration tests that verify behavior through HTTP endpoints, plus a `testApp.ts` helper that provides in-memory repository instances. The `auth.service.ts` module exports pure functions that can be tested directly without HTTP overhead.

## Goals / Non-Goals

**Goals:**
- Test `readSession` function directly with various JWT failure modes
- Use the same test patterns as existing tests (Vitest, describe/it structure)
- Cover all error paths in the try-catch block

**Non-Goals:**
- Testing other auth service functions (registerUser, authenticateUser, etc.) - can be added later if needed
- Replacing existing integration tests - these complement, not replace them

## Decisions

### Decision 1: Direct function testing vs HTTP testing

**Approach:** Test `readSession` and `createSession` functions directly rather than through HTTP endpoints.

**Rationale:** 
- The function is exported and pure (no hidden dependencies)
- Direct testing is faster and easier to set up edge cases (expired tokens, malformed payloads)
- Integration tests already verify the full HTTP auth flow
- Unit tests make it easier to verify the specific error handling logic

**Alternative considered:** Only use HTTP integration tests. Rejected because creating expired tokens and specific malformed payloads is more complex through the HTTP layer.

### Decision 2: Test file location

**Approach:** Create `src/tests/api/auth.service.test.ts` to mirror the structure of `src/api/services/auth.service.ts`.

**Rationale:**
- Matches existing test structure (tests mirror source directory structure)
- Easy to locate related tests
- Follows project conventions

## Risks / Trade-offs

- **Risk:** Tests depend on JWT library implementation details → **Mitigation:** Test observable behavior (thrown errors) rather than internal JWT validation logic
- **Trade-off:** Adding unit tests increases test suite size → Acceptable because the tests are fast and target critical security logic
