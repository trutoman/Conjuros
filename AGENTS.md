# Conjuros Instructions

All project documentation, code, and code comments must be written in English.

## Commands

**Development:**
```bash
npm run dev              # Start API (port 3000) + frontend (port 5173) concurrently
npm run dev:api          # API only via tsx watch
npm run dev:web          # Frontend only via Vite
```

**Validation (required before finishing):**
```bash
npm run check            # Runs lint → test → build (Docker-independent)
npm run lint             # ESLint
npm run test             # Vitest (excludes Docker integration test)
npm run test:watch       # Vitest watch mode
npm run test:docker      # Docker persistence test only (requires Docker daemon)
npm run build            # tsc --noEmit + vite build
```

**Setup:**
```bash
npm run docker:check     # Verify Docker CLI and daemon before docker compose up
docker compose up -d     # Start local MongoDB at localhost:27017
cp .env.example .env     # Create local config (set MONGODB_DATABASE and SESSION_SECRET ≥32 chars)
```

## Product

Conjuros lets authenticated users manage a private collection of items. An item is either a `spell` with a `command`, a `web-link` with a `url`, or a `markdown` note with `content`; all items have an owner, title, description, tags, order, and relationships.

## Architecture

**Monorepo structure:**
- `src/api/` — Express API server (entry: `server.ts`)
- `src/web/` — React frontend (entry: `main.tsx`, served by Vite from `src/web/`)
- `packages/contracts/` — Shared Zod schemas and types via `@conjuros/contracts`
- `src/tests/` — Test suite (mirrors `src/api/` and `src/web/` structure)

**Layer boundaries:**
- Controllers → Services → Repositories → MongoDB
- Only repositories access MongoDB; services are persistence-agnostic
- HTTP layer has no business logic
- Validate all inputs at boundaries with Zod; raise `AppError(status, code, message, details)` for domain errors
- Share contracts via `packages/contracts`; do not duplicate schemas or expose persistence-only fields (e.g., `ownerId`)

**TypeScript paths:**
- `@conjuros/contracts` resolves to `packages/contracts/src/index.ts` (configured in `tsconfig.json` and `vite.config.ts`)

**API:**
- Framework: Express (not Fastify)
- Auth: JWT in `conjuros_session` cookie; `requireAuth(sessionSecret)` middleware sets `request.currentUser`
- Error handling: `AppError` → `errorHandler` middleware; `ZodError` → 400; unhandled → 500
- Environment: Zod-validated via `parseApiEnvironment()`; invalid vars throw named error

**Frontend:**
- Vite dev server proxies `/api/*` → `http://localhost:3000`
- Build output: `dist/web/`

## Domain Rules

- Verify item ownership before read/update/reorder/delete
- `spell` requires `command`; store and display exact text, never execute
- `web-link` requires absolute `https:` or `http:` URL; open only after explicit user action
- `markdown` requires `content`; render and store the exact text, never execute or transform it
- `relatedItemIds` may only refer to items owned by the same user
- Validate enumerated tags against catalogs; normalize free-form tags

## Testing

**Setup:**
- Unit/integration tests use in-memory repositories (`InMemoryItemsRepository`, `InMemoryUsersRepository`, etc.)
- Helper: `createTestApp()` in `src/tests/api/testApp.ts` returns `{ app, items, tags, users }`
- Vitest config excludes `docker-compose.test.ts` from default suite; run separately via `npm run test:docker`

**Conventions:**
- Use `supertest` for API tests; `@testing-library/react` for frontend
- Structure: Arrange-Act-Assert
- Cover ownership boundaries: cross-user access must return 403 or 404
- Frontend: query accessible roles, visible text, or `data-testid`; avoid CSS classes

## Frontend

- Prioritize search, reading, and quick actions
- Every `spell` has an accessible action to copy `command` text
- Every `web-link` has actions to copy URL and open it
- `markdown` cards render a `content` slug inline and offer a "View markdown" action that opens a read-only sanitized viewer of the full note
- Ordering must work with pointer and keyboard; persist via API
- Include loading, empty, no-results, and error states
- Do not add components, libraries, or animations without a specific need

## Backend

- Use `async/await`, not `.then()/.catch()`
- Parallel operations: `Promise.all()` or `Promise.allSettled()`
- Dependency injection: `createApp(dependencies)` in `app.ts`
- Paginate all list endpoints (default max 50)
- Status codes: 200, 201, 400, 401, 403, 404, 409 (semantic, not generic)
- Error handling: raise `AppError`; never use empty `try/catch`

## Quality

- Run `npm run check` before finishing; report unresolved failures
- Do not store secrets or real `.env` values
- Do not expose internal identifiers or other users' data
- Update `packages/contracts` when adding/changing API shapes
