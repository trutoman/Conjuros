## Why

The Azure Container App was already renamed (its API container is now `conjuros-api`), but the deploy workflow on `main` still targets `--container-name api`, so the next push would fail with "container not found". In the same working tree, the Nginx proxy upstream is hard-coded to `localhost:3000`, which only works in Azure Container Apps (containers of one replica share a network) and breaks under docker compose, where the API is a separate container.

## What Changes

- `.github/workflows/deploy-azure.yml`: roll out the API image with `--container-name conjuros-api`.
- Rename `nginx.conf` to `nginx.conf.template` and proxy `/api/` to `http://${API_UPSTREAM}`, substituted at container start by the nginx image entrypoint.
- `Dockerfile.web`: copy the template to `/etc/nginx/templates/` and default `API_UPSTREAM=localhost:3000` (Azure).
- `docker-compose.yml`: set `API_UPSTREAM: api:3000` for the `web` service.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `container-stack`: the web container's API upstream becomes configurable per environment (default `localhost:3000`; Compose overrides with `api:3000`).

## Impact

- Files: `.github/workflows/deploy-azure.yml`, `Dockerfile.web`, `docker-compose.yml`, `nginx.conf.template` (renamed from `nginx.conf`).
- Deployment: Azure rollout must use the container name `conjuros-api`; the already-renamed Azure app requires this to be merged before the next push to `main`.
- No API, contract, or database changes.
