## Context

The ingress allowlist lives in Azure, not in the repository: the deploy workflow only updates container images, so the rules are applied by hand and nothing in git records them. Cloudflare's published list is the only source of truth available, and the origin publishes an IPv4-only address (no `AAAA`), which matches the Container Apps restriction model (IPv4 CIDR only). The repository already has the conventions this change needs: `scripts/*.mjs` with a neighbouring `.d.mts`, dependency injection for tests, `runCommand` as the process wrapper, and an OIDC-federated Azure login in the deploy workflow.

## Goals / Non-Goals

**Goals:**

- Detect drift between the published Cloudflare ranges and the ingress allow rules without a human comparing lists by hand.
- Produce a report that a maintainer can act on without opening the Azure portal: exact commands and verification steps in the issue body.
- Keep the workflow failure signal meaningful, so a red run always means "the allowlist needs action".
- Reuse the existing OIDC identity, repository variables and issue workflow; add no new secrets.

**Non-Goals:**

- Applying the allowlist, or any other write to Azure, from the scheduled job.
- Managing the ingress configuration as code (Bicep/Terraform) or moving it into the repository.
- Covering IPv6 ranges, per-tenant Cloudflare products, or Cloudflare Tunnel migration.
- Replacing the manual allowlist bootstrap: the check verifies configuration that must already exist.

## Decisions

**Read the ingress configuration with `az containerapp show --query properties.configuration.ingress`.** One call returns the restrictions, the origin FQDN and the custom domains, so the report can include real verification URLs. Alternative: `az containerapp ingress access-restriction list` plus a second `show` for the hostnames — two calls and the same data.

**Match ranges by CIDR, not by rule name.** Rules created by hand may use other names; comparing names would report false drift and duplicate rules. The canonical `cf-<cidr>` name is only used when generating a rule that does not exist yet.

**Express the outcome as an exit-code contract (`0` ok, `1` action required, `2` error, `3` not configured, `4` cleanup only) and let the script build the markdown.** The workflow stays a thin shell around `gh`, while classification and report rendering remain unit-testable and behave identically when run locally. Alternative: classify with `jq`/shell inside the workflow — untestable and duplicated for local runs.

**Upsert the issue by label plus title search.** `gh issue list --label infra --search 'in:title …'` is enough to find the open report; if it exists the new report is added as a comment. Alternative: an HTML marker comment inside the body — more robust to renames, but requires reading issue bodies and adds parsing code for a single-issue workflow.

**Treat cleanup as a warning, not a failure.** Extra rules only allow addresses Cloudflare no longer uses, so they cannot break availability; failing on them would train maintainers to ignore red runs. Missing ranges, deny rules and an unconfigured allowlist fail the run.

**Never write to Azure from the workflow.** The token has `Container Apps Contributor`, so the job *could* apply the fix; keeping it read-only means a compromised or buggy run cannot widen the allowlist. The issue carries the command instead.

**Keep the cadence weekly, on the default branch.** A Cloudflare range change is rare but takes effect immediately, so a weekly check bounds the exposure to at most seven days; `workflow_dispatch` covers "apply the fix and re-check now". Daily runs were rejected as noise for a list that changes a few times a year.

**Reuse the federated credential unchanged.** Its subject is `repo:trutoman/Conjuros:ref:refs/heads/main`, which is exactly what a `schedule` run presents, so no new identity or secret is needed. The workflow declares `id-token: write` and `issues: write` for the default token.

## Risks / Trade-offs

- **Drift window of up to seven days** → the failure mode is intermittent 403s, not a full outage; the README documents the manual `npm run infra:cloudflare-ips` command, and the cadence can be tightened without touching the script.
- **Cloudflare shared egress** → allowing the Cloudflare ranges also allows other traffic that exits from them (WARP, Workers). Accepted as residual; the definitive fix is a tunnel with no public ingress, tracked separately.
- **Cloudflare changes the list format or the endpoint disappears** → the parser discards non-CIDR lines and the check fails as `error` without opening a misleading remediation issue.
- **Silent drift if the workflow stops running** → GitHub disables scheduled workflows after long repository inactivity; the manual dispatch and the local command are the fallback.
- **The check verifies configuration, not reachability** → a correct allowlist can still serve broken pages. The report therefore includes `curl` checks against both hostnames, and application health remains covered by the container app probes.
- **Issue noise if the allowlist stays unconfigured** → the upsert keeps a single open issue with comments instead of opening a new one every week.

## Migration Plan

1. Merge the check script, workflow, tests and documentation.
2. Dispatch the workflow by hand and confirm the report matches the current state (allowlist configured, one range missing).
3. Apply the missing rule with the command from the issue, then re-run until the check reports `ok`.
4. Keep the weekly schedule; if Cloudflare starts announcing ranges more often, lower the cadence. Rollback is deleting the workflow file: the check performs no writes, so removing it leaves production untouched.
