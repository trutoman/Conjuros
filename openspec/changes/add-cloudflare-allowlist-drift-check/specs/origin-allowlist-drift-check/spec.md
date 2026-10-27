## Purpose

Keeps the Container App ingress restricted to the IPv4 ranges Cloudflare publishes, by detecting when the allowlist and the published ranges drift apart and producing a ready-to-run remediation report before visitors start seeing `403` responses.

## ADDED Requirements

### Requirement: Check compares published ranges with the ingress allowlist

The system SHALL provide a check that reads the IPv4 ranges published by Cloudflare and the IP access restrictions configured on the Container App ingress, and compares them by range. The comparison SHALL consider only `Allow` rules as evidence that a range is permitted, and SHALL ignore malformed entries and ranges that are not valid IPv4 CIDR blocks.

#### Scenario: Matching allowlist

- **WHEN** every range published by Cloudflare has a matching `Allow` rule on the ingress and no other rule exists
- **THEN** the check reports that the allowlist matches
- **AND** the check reports no action required

#### Scenario: Invalid published entries are ignored

- **WHEN** the published list contains blank lines, comments or values that are not IPv4 CIDR blocks
- **THEN** those entries are discarded instead of being reported as missing

### Requirement: Check classifies the outcome

The check SHALL classify the comparison into exactly one outcome: `ok` (ranges match), `cleanup` (ranges match but extra `Allow` rules remain), `unconfigured` (the ingress has no IP access restrictions), `misconfigured` (the ingress has `Deny` rules, which cannot be combined with `Allow` rules) or `error` (the published list or the ingress configuration could not be read). Every outcome that requires action SHALL be distinguishable from `ok` by the command exit status, and `cleanup` SHALL be distinguishable from the outcomes that require action.

#### Scenario: Cleanup only

- **WHEN** all published ranges are allowed and at least one `Allow` rule covers a range Cloudflare no longer publishes
- **THEN** the check reports `cleanup`
- **AND** the check reports that no outage risk exists

#### Scenario: Allowlist not configured

- **WHEN** the ingress has no IP access restrictions at all
- **THEN** the check reports `unconfigured`
- **AND** the report states that any client can currently reach the origin directly

#### Scenario: Deny rules present

- **WHEN** the ingress contains at least one `Deny` rule
- **THEN** the check reports `misconfigured`
- **AND** the report states that the allowlist is not in effect

#### Scenario: Unreadable inputs

- **WHEN** the published list cannot be read or the ingress configuration cannot be queried
- **THEN** the check reports `error`
- **AND** the check produces no remediation report and makes no claim about drift

### Requirement: Missing ranges are reported with an exact remediation command

For every published range that the ingress does not allow, the report SHALL name the range and the rule name derived from it, and SHALL include a copy-pasteable command that adds the missing `Allow` rule to the container app and resource group being checked.

#### Scenario: One range missing

- **WHEN** Cloudflare publishes a range that has no matching `Allow` rule
- **THEN** the report lists that range and its expected rule name
- **AND** the report contains a command that adds an `Allow` rule for that range to the checked container app

#### Scenario: Several ranges missing

- **WHEN** more than one published range is missing
- **THEN** the report contains a single loop that adds every missing range

### Requirement: Extra rules are reported as cleanup

For every `Allow` rule that does not match a published range, the report SHALL name the rule and its range and SHALL include a copy-pasteable command that removes it, explicitly marked as cleanup that does not affect availability.

#### Scenario: Extra rule reported without blocking

- **WHEN** the only difference is an `Allow` rule for a range Cloudflare no longer publishes
- **THEN** the report lists the rule and a command that removes it
- **AND** the run is not treated as a failure

### Requirement: The check runs on a schedule and on demand

The system SHALL run the check automatically at least once per week on the default branch and SHALL allow maintainers to trigger it manually.

#### Scenario: Weekly run

- **WHEN** the scheduled time arrives
- **THEN** the check runs against the production container app without any manual step

#### Scenario: Manual run

- **WHEN** a maintainer dispatches the workflow by hand
- **THEN** the check runs immediately with the same behaviour as the scheduled run

### Requirement: Actionable results open or update a single issue

When the outcome requires action or only cleanup, the system SHALL open an issue labelled for infrastructure work, and SHALL comment on the existing open issue with the same purpose instead of opening a duplicate. The issue body SHALL contain the checked timestamp, the container app and resource group, the published range count, the current allow rule count, the differences found, the remediation commands and the commands to verify the fix afterwards.

#### Scenario: First detection

- **WHEN** a run detects an outcome that requires action and no matching issue is open
- **THEN** a new issue is created with the full remediation report

#### Scenario: Repeated detection

- **WHEN** a later run detects an outcome that requires action and a matching issue is already open
- **THEN** the report is added as a comment on that issue and no new issue is created

#### Scenario: Verification steps included

- **WHEN** the issue body is generated for a container app that has a public hostname and an origin hostname
- **THEN** the body includes a request expected to succeed through Cloudflare and a request expected to be rejected when sent directly to the origin

### Requirement: The run status reflects whether action is needed

A run SHALL be reported as failed when the allowlist requires action, and SHALL be reported as successful when the ranges match or when only extra rules remain. A run that cannot read its inputs SHALL be reported as failed without creating a remediation issue.

#### Scenario: Missing range fails the run

- **WHEN** at least one published range is missing from the allowlist
- **THEN** the run is marked as failed

#### Scenario: Cleanup keeps the run green

- **WHEN** only extra rules remain
- **THEN** the run is marked as successful with a warning that cleanup is available

#### Scenario: Input error fails without an issue

- **WHEN** the published list or the ingress configuration cannot be read
- **THEN** the run is marked as failed
- **AND** no remediation issue is created

### Requirement: The check is runnable from the repository

The repository SHALL expose a documented command that runs the same check locally and prints the outcome, without requiring a workflow run.

#### Scenario: Local run

- **WHEN** a maintainer runs the documented command with valid cloud credentials
- **THEN** the command prints the outcome and points to the generated remediation report when action is required
