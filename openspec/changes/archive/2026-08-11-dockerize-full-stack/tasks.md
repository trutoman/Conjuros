## 1. Container image definitions

- [x] 1.1 Create `Dockerfile.api` (node:22-alpine, copy manifests and `packages/`, `npm ci`, copy `src/`, expose 3000, run `npx tsx src/api/server.ts`)
- [x] 1.2 Create `Dockerfile.web` multi-stage (node:22-alpine build stage copying manifests, `packages/`, `tsconfig.json`, `vite.config.ts`, `scripts/`, `src/`, run `npm run build`; nginx:stable-alpine runtime stage copying the bundle and `nginx.conf`)
- [x] 1.3 Create `nginx.conf` proxying `/api/` to `http://api:3000` and serving the SPA with `try_files ... /index.html` fallback

## 2. Compose stack topology

- [x] 2.1 Replace the `mongo` service with a `db` service (image `conjuros-db`, `mongo_data` volume, `mongosh` healthcheck on `/data/db`, host port 27017)
- [x] 2.2 Add an `api` service (`Dockerfile.api`, `MONGODB_URI=mongodb://db:27017`, required `SESSION_SECRET` interpolation, healthcheck on `/api/health`, `depends_on: db` healthy, host port 3000)
- [x] 2.3 Add a `web` service (`Dockerfile.web`, `depends_on: api` healthy, host port bound as `5173:80`)
- [x] 2.4 Remove the `mongo-express` service so the stack is exactly `db`, `api`, `web`

## 3. API environment configuration

- [x] 3.1 Add validated optional `CORS_ORIGIN` to `parseApiEnvironment` with default `http://localhost:5173`
- [x] 3.2 Preprocess `ADMIN_EMAIL` so an empty value parses as absent
- [x] 3.3 Add optional `corsOrigin` to `createApp` dependencies (default `http://localhost:5173`) and pass `environment.corsOrigin` from `server.ts`
- [x] 3.4 Extend `src/tests/api/environment.test.ts` for `CORS_ORIGIN` and empty `ADMIN_EMAIL`

## 4. Validation and Docker test

- [x] 4.1 Update `docker-compose.test.ts` to target the renamed `db` service
- [x] 4.2 Verify the stack: `npm run check`, `docker compose up -d --build`, health checks, and `npm run test:docker`

## 5. Documentation

- [x] 5.1 Document `CORS_ORIGIN` in `.env.example`
- [x] 5.2 Update `README.md` with the container-first workflow, npm development variant, and troubleshooting
- [x] 5.3 Add the `docker compose up -d` command to `AGENTS.md`