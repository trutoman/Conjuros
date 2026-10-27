## Why

The production origin (the Container App ingress) only accepts traffic from the IPv4 ranges that Cloudflare publishes, so the WAF, rate limiting and Bot Fight Mode cannot be bypassed by hitting the `azurecontainerapps.io` FQDN directly. That allowlist is a static copy of a list Cloudflare changes from time to time: when Cloudflare adds a range and the ingress does not allow it, the visitors routed through it receive `403 RBAC: Access Denied` while the site keeps working for everyone else, which looks like an intermittent outage. Nothing currently detects that drift, and the first manual copy of the list was already missing `131.0.72.0/22`.

## What Changes

- Add a check script that compares the ranges published at `https://www.cloudflare.com/ips-v4` with the ingress allow rules of a Container App and classifies the result: matching, missing ranges (action required), extra ranges (cleanup only), deny rules present (allowlist not in effect), or allowlist not configured at all.
- Add a weekly GitHub Actions workflow (plus manual dispatch) that runs the check against production, uploads the report as an artifact, and opens — or comments on — an `infra` issue whose body contains the exact `az containerapp ingress access-restriction set` / `remove` commands to run and the `curl` commands to verify the fix afterwards.
- Add a local entry point (`npm run infra:cloudflare-ips`) so the same check can be run by hand before or after applying a fix.
- Fail the workflow only when the allowlist needs action; extra rules are reported as a warning so the run stays green.
- Document the origin protection model and the runbook in the README.

## Capabilities

### New Capabilities

- `origin-allowlist-drift-check`: Scheduled verification that the Container App ingress still allows exactly the IPv4 ranges Cloudflare publishes, with a machine-generated remediation issue when it does not.

### Modified Capabilities

<!-- No existing capability changes requirements: the app, the API and the release workflow keep their behaviour. -->

## Impact

- `scripts/check-cloudflare-ips.mjs` (+ `.d.mts`): new drift check, exit codes and issue-body generation.
- `.github/workflows/cloudflare-ips.yml`: new scheduled workflow (OIDC login, artifact, issue upsert, red/green semantics).
- `package.json`: new `infra:cloudflare-ips` script.
- `src/tests/scripts/cloudflare-ips.test.ts`: unit tests for parsing, drift classification, remediation commands and error handling.
- `README.md`: origin protection section and runbook.
- Azure: reads `properties.configuration.ingress` of `conjuros-web`; the repository variables `CONTAINER_APP`, `RESOURCE_GROUP`, `AZURE_CLIENT_ID`, `AZURE_TENANT_ID` and `AZURE_SUBSCRIPTION_ID` are reused, and the existing federated credential (`repo:trutoman/Conjuros:ref:refs/heads/main`) authorises scheduled runs.
- GitHub: needs `issues: write` for the default token; the check does not modify Azure resources.
- Not in scope: applying the allowlist itself, IPv6 ranges (Container Apps IP restrictions accept IPv4 only and the ingress publishes no `AAAA`), and any change to the application code.
