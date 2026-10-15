## Why

Conjuros is live on Azure Container Apps with its data in a Supabase project, and every push to `main` deploys straight to production. There is no place to try changes first, and the API applies database migrations at startup, so a bad migration or a local run pointed at the production `DATABASE_URL` can damage real data. A simple, isolated DEV environment with its own database is needed before more changes ship.

## What Changes

- Adopt a "DEV = local stack + a second Supabase project" model: contributors run `docker compose` or `npm run dev` against a separate Supabase project (same schema through the committed migrations, different data). No new Azure resources and no new application code.
- Document the environment split (what lives in `.env` vs. in Azure), how to create and seed the DEV project, and a release routine: test on DEV, then merge to `main`.
- Add guardrails so production credentials never end up in local `.env` files and broken changes do not reach `main`: a CI check workflow on pull requests and a `check` job gating the deploy job.
- Out of scope (documented as a possible later step): a second "staging" Container App.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `developer-environment`: adds a requirement for an isolated DEV database (separate from production) and documentation of the DEV-to-production routine; adds a requirement that CI checks gate deployment.

## Impact

- Files: `README.md` (DEV environment and release routine), `.env.example` (note that `DATABASE_URL` must be the DEV project), `.github/workflows/deploy-azure.yml` (add `check` job and `needs`), new `.github/workflows/ci.yml` (PR checks).
- External: one additional free Supabase project (`conjuros-dev`); no Azure changes.
- No API, contract, schema, or runtime behavior changes.
