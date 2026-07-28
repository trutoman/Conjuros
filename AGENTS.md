# Conjuros Instructions

All project documentation, code, and code comments must be written in English.

## Product
Conjuros lets authenticated users manage a private collection of items. An item is
either a `spell` with a `command` or a `web-link` with a `url`; both have an owner,
title, description, tags, order, and relationships.

## Domain Rules
- On private routes, verify that an item belongs to the authenticated user before reading, updating, reordering, or deleting it.
- A `spell` requires `command`; store and display its exact text, and never execute it.
- A `web-link` requires an absolute `https:` or `http:` URL; only open it after an explicit user action.
- `relatedItemIds` may only refer to items owned by the same user.
- Validate enumerated tags against their catalogs; normalize and validate free-form tags.

## Architecture
- Use strict TypeScript; do not use `any`.
- Validate all inputs at boundaries with Zod.
- The HTTP layer contains no business rules.
- Services do not depend on Fastify, React, or MongoDB.
- Only repositories access MongoDB.
- Share Zod schemas and types through `packages/contracts` when both web and API use them.
- Do not duplicate contracts or expose persistence-only fields in public contracts.

## Frontend
- Prioritize search, reading, and quick actions for collection items.
- Every visible `spell` has an accessible action to copy the exact `command` text and report success or failure.
- Every visible `web-link` has accessible actions to copy its URL and explicitly open it.
- The common ordering must work with pointer and keyboard input, and must persist.
- Include loading, empty, no-results, and error states.
- Do not add components, libraries, or animations without a specific need.

## Backend
- Async Operations: Use async MongoDB client calls (e.g., `Motor`). Never block the main thread.
- Consistent async/await: Use `async/await` instead of `.then().catch()` chains.
- Parallel operations: Use `Promise.all()` or `Promise.allSettled()` when database queries or external calls do not depend on each other.
- Connection reuse: Reuse the existing MongoDB connection pool; never open a new connection for each request.
- Dependency Injection: Use Express middleware and service factories for database sessions, current user authentication, and service instances.
- Clean controller layer: Controllers and routes handle only input validation, service calls, and HTTP response formatting. Put all business logic and database queries in services or repositories.
- Centralized error handling: Do not use empty or ignored `try/catch` blocks. Pass unhandled errors to global middleware with `next(error)` in Express, or raise custom exceptions such as `AppError` or `NotFoundError`.
- Error handling: Raise `HTTPException` with clear error detail structures.
- Semantic HTTP status codes: Return appropriate statuses, including `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, and `409 Conflict`.
- Required pagination: Never return complete collections (for example, `.find({})`). Every list endpoint must support pagination through `limit` and `skip` or cursor-based pagination, with a default maximum limit of `50`.

## Testing
- Add or update risk-proportionate tests for every feature, bug fix, and endpoint; keep test files near the code they cover or in a mirrored test directory.
- Structure unit and integration tests using Arrange-Act-Assert.
- Cover the successful path, relevant edge cases, input-validation failures, and ownership or authorization boundaries. Invalid inputs must return `400 Bad Request`; cross-user access must return `403 Forbidden` or `404 Not Found`.
- Never run tests against a production or shared database. Isolate persistence with a test database, in-memory database, or mocks appropriate to the test level, and reset state between tests.
- Keep tests deterministic: control time, randomness, and external network calls.
- Use descriptive `describe` and `it` names. In frontend tests, query accessible roles, visible text, or `data-testid`; do not rely on CSS classes or implementation details.
- Do not leave placeholder or empty tests unless explicitly requested.

## Security and Quality
- Do not store secrets or real `.env` values.
- Do not expose internal identifiers, other users' data, or sessions.
- Every feature includes risk-proportionate tests and updates contracts or OpenAPI when needed.
- Before finishing, run the most specific available validation and `npm run check` when it exists; report any unresolved failures.
