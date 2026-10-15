## MODIFIED Requirements

### Requirement: Frontend and API are served on a single origin
The `web` container SHALL serve the built single-page application and forward `/api/*` requests to the API upstream named by the `API_UPSTREAM` environment variable so the browser communicates with one host and port. The image SHALL default `API_UPSTREAM` to `localhost:3000` (Azure Container Apps, where containers of a replica share a network), and the Compose stack SHALL override it with `api:3000`.

#### Scenario: API proxying with SPA fallback
- **WHEN** a browser requests `/api/auth/me` or an application route at `http://localhost:5173`
- **THEN** API requests are proxied to the `api` container and unknown application routes are answered with `index.html`

#### Scenario: Session cookie continuity
- **WHEN** a user authenticates through the `web` origin
- **THEN** subsequent API requests carry the `conjuros_session` cookie without any cross-origin handling

#### Scenario: Default upstream for Azure
- **WHEN** the web image starts without `API_UPSTREAM` set
- **THEN** Nginx proxies `/api/*` to `localhost:3000`

#### Scenario: Compose upstream override
- **WHEN** the stack starts through `docker compose`
- **THEN** the `web` service runs with `API_UPSTREAM=api:3000`

## ADDED Requirements

### Requirement: Azure rollout targets the renamed API container
The deploy workflow SHALL update the API container of the Container App using the container name `conjuros-api` and the web container using `conjuros-web`.

#### Scenario: Rollout after rename
- **WHEN** the deploy workflow runs on a push to `main`
- **THEN** it updates the containers `conjuros-api` and `conjuros-web` with images tagged with the commit SHA
