## Context

Production: one Azure Container App (`conjuros-api` + `conjuros-web` containers) deployed from `main` by `.github/workflows/deploy-azure.yml`, database in a Supabase project. The API runs Drizzle migrations at startup. Locally, `docker compose` and `npm run dev` already work against whatever `DATABASE_URL` is in `.env`. The older local PostgreSQL container was removed in favor of Supabase.

## Goals / Non-Goals

**Goals:** a safe place to test changes (including migrations) with its own data; minimal effort and cost; no way to hit production data by accident.

**Non-Goals:** a hosted staging copy in Azure, preview environments per PR, data anonymization pipelines.

## Decisions

Options considered:

| Option | Verdict |
|---|---|
| Local stack + **second Supabase project** | **Chosen.** Same engine, TLS and pooler behavior as production, zero Azure cost, no new code. |
| Local stack + local PostgreSQL container | Rejected. Not identical to Supabase (RLS, pooler, TLS), and the compose service was deliberately removed. |
| Second Container App in Azure + second Supabase project | Deferred. Useful for testing the Azure image/network setup, but adds cost, secrets and workflow complexity. Can be added later without redoing this change. |
| Azure sandbox | Rejected. Not needed; the difference from production that matters is the database. |

- **Data isolation**: DEV uses its own Supabase project; the schema is created by the committed migrations at API startup, so it stays identical to production. Data is created by hand or a small seed.
- **Secret separation**: `.env` (git-ignored) holds only DEV values. Production values live only in the Azure Container App configuration. The DEV project must use a different `SESSION_SECRET` and database password.
- **Release routine**: branch → run on DEV (`docker compose up -d --build`, plus any new migration) → PR with CI checks → merge to `main` → automatic deploy.
- **Deploy gate**: add a `check` job (`npm run check`) that the `deploy` job `needs`; add a `ci.yml` that runs the same on pull requests.

## Risks / Trade-offs

- Free Supabase projects pause when idle; restore from the dashboard before testing.
- Migrations still auto-apply on production startup. Mitigation: always test them on DEV first; take a manual backup/export before releasing destructive migrations.
- The local stack does not exercise the Azure-specific setup (shared replica network, `API_UPSTREAM=localhost:3000`). Mitigation: a staging Container App can be added later if this becomes a source of bugs.
