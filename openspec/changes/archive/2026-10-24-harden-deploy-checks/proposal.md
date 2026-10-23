## Why

The production deploy workflow reports success as soon as `az containerapp update` patches the Container App template: it never checks that the new revision actually starts. A deployment can therefore be green while the API crash-loops (for example with a malformed `SUPABASE_URL`), and a `workflow_dispatch` re-run with an unchanged image is green without creating any revision at all. In addition, `z.string().url()` accepts `ttps://…`, so an invalid Storage URL passes environment validation and is only rejected by `supabase-js` at startup, after migrations have already been applied to production.

## What Changes

- `.github/workflows/deploy-azure.yml`: give the API and web rollouts a run-scoped `--revision-suffix`, then poll the resulting revision's `provisioningState`/`healthState` until it is `Provisioned` and `Healthy`, failing the job after a bounded timeout and printing the API container logs on failure.
- `src/api/config/environment.ts`: validate `SUPABASE_URL`, `CORS_ORIGIN`, and `APP_BASE_URL` as absolute `http:`/`https:` URLs using the WHATWG `URL` parser, so a value without a proper scheme fails `parseApiEnvironment` before the database client is created and before `runMigrations` runs.
- `src/tests/api/environment.test.ts`: cover accepted and rejected URL forms, including the missing-scheme-character case and the "fails before migrations" contract.
- `README.md`: document that a deploy is only successful once the revision is healthy.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `developer-environment`: the deploy gate now also requires the rolled-out revision to become healthy, not just the pre-deploy checks to pass.
- `container-stack`: API environment URL configuration is validated strictly at startup, before any database work.

## Impact

- Files: `.github/workflows/deploy-azure.yml`, `src/api/config/environment.ts`, `src/tests/api/environment.test.ts`, `README.md`.
- Deployment: revisions are named `conjuros-web--gh<run-number>-api` / `conjuros-web--gh<run-number>-web`; every deploy (including `workflow_dispatch`) forces a new revision; a failing rollout turns the job red instead of green.
- No API contracts, database schema, or frontend changes.
