## Why

The application previously ran only partially in containers: `docker compose up -d` started a single MongoDB container, and the API and frontend had to be started manually with `npm run dev`. Starting the whole product required two extra manual steps and two different runtimes (Node via `tsx`/Vite), so the stack was not reproducible as one command, and the API/frontend had no defined production-style packaging.

## What Changes

- Run the application in **three connected containers**: `db` (MongoDB), `api` (Express), and `web` (Nginx serving the built React app). `docker compose up -d --build` now builds and starts the entire stack, and `docker compose up -d` serves the frontend at `http://localhost:5173`.
- Add two image definitions: `Dockerfile.api` (Node 22 Alpine, `npm ci`, runs the API via `tsx`) and `Dockerfile.web` (multi-stage: Node 22 Alpine build of the Vite bundle → `nginx:stable-alpine` runtime).
- Add `nginx.conf`: Nginx serves the built SPA with `index.html` fallback and proxies `/api/*` to the `api` container on port 3000, keeping the frontend and API on a single origin so existing relative `/api` fetches and the session cookie continue to work unchanged.
- Replace the single `mongo` service with `db`, `api`, `web` services. The `db` service keeps the pinned immutable MongoDB 7.0.39 digest, the `mongo_data` volume, and adds a `mongosh` healthcheck. The `api` service connects to Mongo through the Compose network at `mongodb://db:27017`, waits for `db` healthy, and is itself healthchecked against `/api/health`; the `web` service starts after `api` is healthy. The `mongo-express` service is removed.
- Make API configuration container-aware: `CORS_ORIGIN` becomes a validated, optional environment variable (default `http://localhost:5173`) passed from the environment into the app, and an empty `ADMIN_EMAIL` is treated as absent so Compose's `ADMIN_EMAIL: ${ADMIN_EMAIL:-}` interpolation never fails validation.
- Make the Docker persistence test target the renamed compose service (`mongo` → `db`).
- Reorder local setup: `.env` must exist before `docker compose up` because `SESSION_SECRET` is required at Compose-interpolation time; `docker compose up -d db` remains the way to get only MongoDB for `npm`-based hot-reload development.

## Capabilities

### New Capabilities
- `container-stack`: The application runs as a Compose stack of three containers (`db`, `api`, `web`) that communicate over a shared network: the API reaches MongoDB internally at `mongodb://db:27017`, and Nginx serves the built frontend and proxies `/api` to the API on the same origin.

### Modified Capabilities
- `developer-environment`: Contributor onboarding now describes building and running all three containers with one command, requiring `.env` before Compose start, and running the Docker persistence test against the `db` service.

## Impact

- `docker-compose.yml` rewritten: `db`/`api`/`web` services with `container_name`, `restart`, healthchecks, `depends_on` (`api` waits for healthy `db`, `web` waits for healthy `api`), and host ports `27017`, `3000`, `5173`; `mongo-express` removed; `mongo_data` volume unchanged. The former `mongo-local`/`mongo-express` containers are gone.
- `Dockerfile.api` and `Dockerfile.web` (new), `nginx.conf` (new; copied into the `web` image).
- `src/api/config/environment.ts`: added validated `CORS_ORIGIN` (optional, default `http://localhost:5173`) and empty-string handling for `ADMIN_EMAIL`; `src/api/app.ts` consumes an optional `corsOrigin` dependency with the same default; `src/api/server.ts` passes the parsed origin.
- `src/tests/integration/docker-compose.test.ts`: references the `db` service.
- Docs: `.env.example` documents `CORS_ORIGIN`; `README.md` documents the container-first workflow and a npm/hot-reload variant; `AGENTS.md` lists `docker compose up -d`.