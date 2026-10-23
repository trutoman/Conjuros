## Context

See `proposal.md` for the motivation. The relevant current state:

- `.github/workflows/deploy-azure.yml` has a `check` job (`pnpm run check`) and a `deploy` job that logs in to Azure, builds both images with `az acr build`, then calls `az containerapp update` twice (`conjuros-api`, then `conjuros-web`). `az containerapp update` returns once the template patch is accepted; nothing in the workflow reads the revision state.
- The Container App `conjuros-web` runs in single-revision mode with two containers (`conjuros-api` on `3000`, `conjuros-web` on `80`). Each container has a TCP startup probe: 5 s initial delay, then 30 attempts every 5 s (~155 s before an unhealthy verdict).
- The API validates its environment with `parseApiEnvironment(process.env)` at `src/api/server.ts:18`, creates the database client and runs migrations at lines 21–25, and only then builds the Storage client at line 32. `z.string().url()` is used for `SUPABASE_URL`, `CORS_ORIGIN`, and `APP_BASE_URL`; Zod 3's `.url()` accepts `ttps://…`, while `supabase-js` throws `Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.` when constructing the client, i.e. after migrations.

## Goals / Non-Goals

**Goals:**
- Make the deploy job fail when the rollout does not produce a healthy revision.
- Give every deploy run a deterministically identifiable revision, including `workflow_dispatch` runs where the image did not change.
- Reject malformed URL environment values before the database client is created and before migrations run.

**Non-Goals:**
- Adding an HTTP health endpoint or checking Storage connectivity from a probe.
- Automatic rollback of an unhealthy revision.
- Changing Azure infrastructure (probes, scaling, ingress) or the CI job structure.
- Changing how migrations are generated or applied.

## Decisions

- **Name the rollout with a run-scoped revision suffix.** Pass `--revision-suffix gh${{ github.run_id }}-api` and `--revision-suffix gh${{ github.run_id }}-web` to the two updates. This makes the revision name predictable (`<app>--gh<run-id>-web`) and forces Azure to create a revision even when the image tag is unchanged, which removes the "green but no revision" case. Alternative rejected: capturing `latestRevisionName` before and after the updates is ambiguous for a no-op and races with the two consecutive updates.

- **Gate the web revision (the second update).** The workflow updates the API container first and the web container second, so the `-web` revision contains both new images and is the final revision of the run. Alternative rejected: polling both revisions doubles the wait and the `-api` revision is superseded within seconds.

- **Poll `provisioningState` and `healthState` in a bounded loop.** A `Verify rollout` step runs up to 60 attempts, 10 s apart (10 min), reads `properties.[provisioningState,healthState]` with `az containerapp revision show`, exits successfully on `Provisioned` + `Healthy`, breaks early on `Failed`, and on timeout prints `az containerapp logs show --container conjuros-api --revision <rev> --tail 100` before exiting 1. The revision may not exist for the first seconds after the update, so a failed `revision show` is treated as "pending" rather than fatal. Alternative rejected: an HTTP `/api/health` endpoint; the existing TCP startup probe already fails when the process never listens, which is the failure class observed, and a Storage-aware health check is a separate feature.

- **Fail the job; do not roll back automatically.** A failed gate leaves the current revision state untouched, prints the cause from the API logs, and makes the problem visible in the Actions run. Automatic reactivation of the previous revision is an operational decision and is documented as a manual step instead. Alternative rejected: automatic rollback to the previous revision, which adds a second moving part to a job that is already interacting with production.

- **Validate `SUPABASE_URL`, `CORS_ORIGIN`, and `APP_BASE_URL` with a shared `httpUrlSchema`.** The schema refines with `new URL(value)` and requires `protocol` to be `http:` or `https:`, mirroring the existing `databaseUrlSchema` and `smtpUrlSchema` helpers. Because `parseApiEnvironment` already reports the paths of failing issues, a bad value surfaces as `Invalid environment configuration: SUPABASE_URL` (or the other variable) and aborts before the database client and migrations. `blankToUndefined` keeps empty values behaving as absent. Alternative rejected: keeping `z.string().url()`, which accepts `ttps://…` and `http:/…`.

## Risks / Trade-offs

- **Longer deploy job** → Normal runs wait only until the revision is healthy (typically under a minute); a broken rollout now takes up to 10 minutes before failing. Mitigation: fail fast on `provisioningState: Failed` and keep the timeout bounded.
- **A revision for every deploy** → `workflow_dispatch` re-runs with unchanged images now create a revision. Mitigation: accepted intentionally; Container Apps keeps a bounded revision history and deactivates old ones.
- **Revision suffix collisions** → `github.run_id` is unique and never reused; `gh<run-id>-api`/`-web` stays within Azure's 50-character suffix limit and ends with an alphanumeric character. A rejected suffix fails the update loudly.
- **Stricter URL validation rejects previously accepted values** → Values such as `ftp://…` now fail. This is intended; uppercase `HTTP://` normalizes and remains valid.
- **Gate depends on probe timing** → The 10-minute window covers image pull plus the 155 s startup probe; a revision that is `Provisioned` but still starting is polled, not failed.
- **Single-revision mode and unhealthy rollouts** → If the new revision never becomes ready, the app may serve errors until the previous revision is reactivated. Mitigation: the job fails immediately with logs, and the README documents `az containerapp revision activate` for rollback.

## Migration Plan

1. Merge the workflow and environment-validation changes together; the next deploy will create `gh<run-id>-api`/`-web` revisions and wait for health.
2. No data migration. Valid production values (`https://qinubembxpuzvfrjequz.supabase.co`, `https://conjuros.app`) already satisfy the stricter schema.
3. Rollback: revert the workflow commit to restore the non-blocking rollout. Reverting the environment change is safe for configurations that were already valid.
