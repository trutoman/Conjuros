## Context

Previously Compose only provided MongoDB (`mongo` service, `mongo-local` container). The API and frontend were started manually with `npm run dev` (tsx watch / Vite). See proposal.md – Why. The implementation turns the whole product into three Compose services (`db`, `api`, `web`) that communicate over the default Compose network.

## Goals / Non-Goals

**Goals:**
- One command runs the full stack: `docker compose up -d --build`.
- Containers communicate by Compose service name; no host-port coupling for internal traffic.
- Browser traffic stays same-origin (frontend and `/api` on one host/port) so the existing relative `/api` fetches and the `conjuros_session` cookie work unchanged.
- Keep the pinned immutable MongoDB image and the `mongo_data` volume so existing local data survives the switch.

**Non-Goals:**
- Orchestrating for production deployment (multiple replicas, TLS termination via a real proxy) — out of scope.
- Building distributed images to a registry; only local `docker compose up --build`.
- Removing/shrinking the npm-based hot-reload path; `npm run dev` remains supported against a database-only `docker compose up -d db`.

## Decisions

**Three-service topology with health-gated startup.** `depends_on` uses `condition: service_healthy`: `api` waits for a healthy `db` (mongosh `db.adminCommand('ping')`), and `web` waits for a healthy `api` (Node fetch against `http://localhost:3000/api/health`). Healthchecks give real readiness signals instead of Compose's default start-order-only dependency. Alternative considered: the driver's connect retry inside the API — rejected because a failed connect currently crashes the API process; gating startup is simpler and fails loudly.

**Nginx as the frontend container** (Dockerfile.web): stage 1 builds the Vite bundle from source, stage 2 runs `nginx:stable-alpine` serving `dist/web` with `try_files ... /index.html` fallback and `location /api/` → `http://api:3000`. Chosen over (a) serving the bundle with a Node static server, and (b) making the browser call the API cross-origin at `localhost:3000`. Nginx is purpose-built for static + reverse proxy, and same-origin keeps CORS and cookies out of the request path. Direct API access stays available on host port 3000.

**API image runs source TypeScript via tsx** (Dockerfile.api): `npm ci` (includes dev dependencies), then `npx tsx src/api/server.ts`, exposing 3000. This mirrors the dev command and avoids adding a production tsc build/run step. Trade-off: the image keeps dev tooling; acceptable for this stage and consistent with how the app is run today.

**Environment handled at two levels.** Compose sets `api` env via interpolation from the project `.env`: `MONGODB_URI=mongodb://db:27017` (hardcoded for the stack), `MONGODB_DATABASE` (default `conjuros`), `SESSION_SECRET` required (`${SESSION_SECRET:?}` so a missing value fails before the container starts), `ADMIN_EMAIL` optional, `PORT=3000`. Config code was extended so an empty `ADMIN_EMAIL` parses as "absent" and `CORS_ORIGIN` is a validated optional URL defaulting to `http://localhost:5173`, then threaded through `createApp({ corsOrigin })`.

**Removed `mongo-express`.** The goal is exactly three containers; the admin UI was an extra service with no role in the stack.

## Risks / Trade-offs

- **Host port collisions** (`27017`, `3000`, `5173`) block `up` — the stack cannot bind its published ports. → Mitigation: README troubleshooting calls out each port; the persistence test needs `27017` free.
- **`SESSION_SECRET` interpolation failure** surfaces as a Compose-level error before containers start. → Mitigation: README documents that `.env` must exist first and shows the `SESSION_SECRET is required` failure mode.
- **Web build requires the full type-check surface.** The `Dockerfile.web` `npm run build` runs `tsc --noEmit` over `src` (including tests that import `scripts/*`), so the build context must copy `scripts/`; a missing copy breaks the image build. → Mitigation: handle it by copying `scripts` into the build stage, matching the host build inputs.
- **Larger API image** (runtime + tsx + dev dependencies). → Accepted; a compiled-build image can replace it later without changing the Compose contract.
- **Data continuity across the switch.** Old `mongo-local`/`mongo-express` containers can conflict until removed. → Mitigation: same `mongo_data` volume and `docker compose down --remove-orphans` (documented in README) clean up the old containers without deleting data.

## Migration Plan

1. Stop/remove legacy containers: `docker compose down --remove-orphans` (data lives in the unchanged `mongo_data` volume).
2. Create `.env` from `.env.example` with `MONGODB_DATABASE` and a 32+ char `SESSION_SECRET` before starting.
3. `docker compose up -d --build`; verify `http://localhost:5173`.
4. Rollback: bring up the previous single-Mongo model (`docker compose up -d db`) and `npm run dev`; no data migration either way.

## Open Questions

None.