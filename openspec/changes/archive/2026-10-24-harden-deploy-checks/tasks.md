## 1. Deploy rollout gate

- [x] 1.1 In `.github/workflows/deploy-azure.yml`, add `--revision-suffix gh${{ github.run_id }}-api` and `--revision-suffix gh${{ github.run_id }}-web` to the two `az containerapp update` calls
- [x] 1.2 Add a `Verify rollout` step after the rollout step that polls the `gh<run-id>-web` revision's `properties.[provisioningState,healthState]` (60 attempts, 10 s apart) and exits successfully only on `Provisioned` + `Healthy`
- [x] 1.3 Make the poll tolerate a revision that does not exist yet (treat a failed `revision show` as pending) and fail fast when `provisioningState` is `Failed`
- [x] 1.4 On failure or timeout, print `az containerapp logs show --container conjuros-api --revision <revision> --tail 100` and exit non-zero
- [x] 1.5 Keep the attempts configurable (for example `ROLLOUT_ATTEMPTS`, default 60) so the failure branch can be exercised without waiting the full timeout

## 2. Environment URL validation

- [x] 2.1 Add an `httpUrlSchema` helper in `src/api/config/environment.ts` that parses with `new URL(...)` and requires the `http:` or `https:` protocol, following the existing `databaseUrlSchema`/`smtpUrlSchema` pattern
- [x] 2.2 Use it for `SUPABASE_URL`, `CORS_ORIGIN`, and `APP_BASE_URL`, keeping `blankToUndefined` so empty values behave as unset
- [x] 2.3 Confirm `parseApiEnvironment` still runs in `src/api/server.ts` before `createDatabase` and `runMigrations`, so a rejected URL prevents any migration

## 3. Tests

- [x] 3.1 Add cases to `src/tests/api/environment.test.ts` rejecting `SUPABASE_URL: 'ttps://project.supabase.co'`, `APP_BASE_URL: 'ftp://conjuros.example.com'`, and a scheme-less value, asserting the error names the variable and does not leak the value
- [x] 3.2 Add a case asserting valid `https:` values for `SUPABASE_URL`, `CORS_ORIGIN`, and `APP_BASE_URL` are accepted, and that unset values keep the current defaults
- [x] 3.3 Keep the existing half-configured Storage pair test passing

## 4. Documentation

- [x] 4.1 Update the README release routine: a deploy only succeeds once the `gh<run-id>-web` revision is healthy, and the job prints the API logs when it is not
- [x] 4.2 Document the manual rollback (`az containerapp revision activate --revision <previous>`) for an unhealthy rollout
- [x] 4.3 Note in the attachments/environment docs that service URLs must be absolute `http:` or `https:` URLs

## 5. Verification

- [x] 5.1 Run `npm run check`
- [x] 5.2 Run `openspec validate harden-deploy-checks --strict`
- [ ] 5.3 Trigger a `workflow_dispatch` deploy and confirm it creates `gh<run-id>-api`/`gh<run-id>-web` revisions, waits for health, and finishes green
- [x] 5.4 Exercise the failure branch with `ROLLOUT_ATTEMPTS=1` against a non-existent revision name and confirm the step exits non-zero and prints the diagnostic logs
