# Conjuros Instructions

All project documentation, code, and code comments must be written in English.

## Commands

**Development:**
```bash
npm run dev              # Verify 3000/5173 are free, then start API + frontend against the Supabase database
npm run dev:api          # API only via tsx watch (requires a reachable `DATABASE_URL`)
npm run dev:ports        # Fail fast if 3000/5173 are busy
npm run dev:web          # Frontend only via Vite
docker compose up -d     # Build/start api + web containers (frontend on 5173); the database is remote Supabase
```

**Database:**
```bash
npm run db:generate      # Generate a versioned SQL migration from src/api/db/schema.ts
npm run db:migrate       # Apply pending migrations to the database named by DATABASE_URL
```

**Validation (required before finishing):**
```bash
npm run check            # Runs lint → test → build (Docker-independent)
npm run lint             # ESLint
npm run test             # Vitest
npm run test:watch       # Vitest watch mode
npm run build            # tsc --noEmit + vite build
```

**Setup:**
```bash
cp .env.example .env     # Create local config (set DATABASE_URL to the Supabase Session pooler string with a URL-encoded password, DATABASE_SSL=require and SESSION_SECRET ≥32 chars)
npm run docker:check     # Optional: verify Docker CLI and daemon before docker compose up
```

## Product

Conjuros lets authenticated users manage a private collection of items. An item is either a `command` item with command text, a `web-link` with a `url`, or a `markdown` note with `content`; all items have an owner, title, description, tags, order, and relationships. Markdown notes may optionally carry a `filename` (a plain `.md` file name, at most 64 characters, no path separators). Accounts are email/password based; the API also sends transactional email (a welcome message on registration and password reset links) through an optional SMTP sender.

## Architecture

**Monorepo structure:**
- `src/api/` — Express API server (entry: `server.ts`)
- `src/api/db/` — Drizzle schema, client, migration runner and SQLSTATE helper
- `src/api/email/` — Outbound email seam (sender interface, SMTP/console senders, message builders)
- `drizzle/` — Generated, committed SQL migrations
- `src/web/` — React frontend (entry: `main.tsx`, served by Vite from `src/web/`)
- `packages/contracts/` — Shared Zod schemas and types via `@conjuros/contracts`
- `src/tests/` — Test suite (mirrors `src/api/` and `src/web/` structure)

**Layer boundaries:**
- Controllers → Services → Repositories → PostgreSQL (via Drizzle ORM)
- Only repositories access PostgreSQL; services are persistence-agnostic
- HTTP layer has no business logic
- Validate all inputs at boundaries with Zod; raise `AppError(status, code, message, details)` for domain errors
- Share contracts via `packages/contracts`; do not duplicate schemas or expose persistence-only fields (e.g., `ownerId`); `packages/contracts` must not depend on Drizzle

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
- A `command` item requires command text; store and display exact text, never execute
- `web-link` requires absolute `https:` or `http:` URL; open only after explicit user action
- `markdown` requires `content`; render and store the exact text, never execute or transform it
- `markdown` items may carry an optional `filename`: a plain file name only (no path separators) of at most 64 characters, always ending in `.md`; an empty or absent `filename` is stored and returned as `null`
- `relatedItemIds` may only refer to items owned by the same user
- Validate enumerated tags against catalogs; normalize free-form tags
- Accounts may have no local password (external-identity-only) and may carry at most one external provider identity; a passwordless account must fail password sign-in with the standard invalid-credentials error
- Password reset is email-initiated: a request always answers with the same generic message (no account enumeration) and only sends a link for accounts with a local password; passwordless accounts are never reset targets
- Reset tokens are stored only as a hash, expire after a configured lifetime, are single-use, and issuing a new token invalidates the account's outstanding tokens; a completed reset never creates a session
- Transactional email is optional: when SMTP is not configured the API logs messages instead of delivering them, and an email failure must never fail the operation that triggered it

## Testing

**Setup:**
- Unit/integration tests use in-memory repositories (`InMemoryItemsRepository`, `InMemoryUsersRepository`, etc.)
- Repository behavior tests run the `Postgres*` repositories against an in-process PostgreSQL (PGlite) with the committed migrations applied, so `npm run test` stays Docker-independent
- Helper: `createTestApp()` in `src/tests/api/testApp.ts` returns `{ app, items, tags, users }`

**Conventions:**
- Use `supertest` for API tests; `@testing-library/react` for frontend
- Structure: Arrange-Act-Assert
- Cover ownership boundaries: cross-user access must return 403 or 404
- Frontend: query accessible roles, visible text, or `data-testid`; avoid CSS classes

## Frontend

- Prioritize search, reading, and quick actions
- Every command item has an accessible action to copy its `command` text
- Every `web-link` has actions to copy URL and open it
- `markdown` cards render a `content` slug inline and offer a "View markdown" action that opens a read-only sanitized viewer of the full note; the viewer also shows the note's optional `filename`
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
