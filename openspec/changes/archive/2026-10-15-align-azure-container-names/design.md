## Context

Production runs on Azure Container Apps with `conjuros-api` and `conjuros-web` containers in one replica (shared network, so the API is at `localhost:3000`). Locally, docker compose runs them as separate containers (API at `api:3000`). The Nginx config hard-coded `localhost:3000`.

## Goals / Non-Goals

**Goals:** make the deploy workflow match the renamed Azure container; make one web image work in both environments.

**Non-Goals:** changing Azure infrastructure, the API, or the CI pipeline structure.

## Decisions

- Use the official nginx image's template mechanism (`/etc/nginx/templates/*.template`, processed by `20-envsubst-on-templates.sh`) with a single `API_UPSTREAM` variable, rather than maintaining two Nginx configs. Only `API_UPSTREAM` appears as `${...}` in the template; Nginx runtime variables (`$host`, etc.) are left untouched because the entrypoint substitutes only defined environment variables.
- Default to the Azure value in the Dockerfile so production needs no extra configuration; Compose overrides it.
- Update the workflow's `--container-name` to `conjuros-api`, consistent with `conjuros-web`.

## Risks / Trade-offs

- The workflow change must land before the next push to `main`, otherwise the rollout fails with "container not found" (harmless to the live site). Mitigation: merge this change first.
- A missing override under Compose would make `/api` fail with 502; mitigated by the explicit `API_UPSTREAM` in `docker-compose.yml`.
