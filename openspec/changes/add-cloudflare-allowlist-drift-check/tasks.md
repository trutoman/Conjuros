## 1. Drift check script

- [x] 1.1 Add `scripts/check-cloudflare-ips.mjs` that fetches the published IPv4 ranges, reads the ingress configuration with `az containerapp show`, and compares them by CIDR
- [x] 1.2 Classify the comparison as `ok`, `drift`, `cleanup`, `unconfigured`, `misconfigured` or `error`, with the documented exit-code contract
- [x] 1.3 Support `--container-app`, `--resource-group`, `--cloudflare-url`, `--json-out` and `--markdown-out`, falling back to `CONTAINER_APP` and `RESOURCE_GROUP`
- [x] 1.4 Add `scripts/check-cloudflare-ips.d.mts` with the types consumed by the tests

## 2. Reports

- [x] 2.1 Generate the markdown report with the differences, the `for cidr in …` remediation loop, the cleanup `remove` commands and the verification requests for both hostnames
- [x] 2.2 Emit a machine-readable JSON report with the status, counts, missing and extra ranges, and the deny rules
- [x] 2.3 Keep the remediation report empty for `ok` and `error` so no misleading issue can be produced

## 3. Tests

- [x] 3.1 Cover range parsing, rule-name derivation and drift classification (missing, extra, deny) in `src/tests/scripts/cloudflare-ips.test.ts`
- [x] 3.2 Cover the five observable outcomes, the remediation commands, the verification URLs and the Azure error path

## 4. Weekly workflow

- [x] 4.1 Add `.github/workflows/cloudflare-ips.yml` with a weekly schedule and `workflow_dispatch`, OIDC login, artifact upload and `id-token`/`issues` permissions
- [x] 4.2 Open the `infra` issue, or comment on the existing one, with the generated report
- [x] 4.3 Mark the run failed only for outcomes that require action, keeping cleanup as a warning

## 5. Documentation

- [x] 5.1 Add the `infra:cloudflare-ips` script to `package.json`
- [x] 5.2 Document the origin protection model, the weekly check and the runbook in the README

## 6. Rollout

- [ ] 6.1 Push the change and dispatch the workflow manually to confirm the Azure login and the issue upsert against production
- [x] 6.2 Apply the missing `131.0.72.0/22` rule from the generated report and re-run until the check reports `ok`
- [ ] 6.3 Confirm the first scheduled run after the fix stays green without creating a duplicate issue
