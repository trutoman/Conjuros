## ADDED Requirements

### Requirement: Deploy verifies the rolled-out revision is healthy
The deploy workflow SHALL identify the Container App revision produced by the current run and SHALL verify that it reaches a successful provisioning state and a healthy runtime state within a bounded time before the job reports success. When the revision does not become healthy, or its provisioning fails, the workflow SHALL fail and SHALL print the API container logs for that revision.

#### Scenario: Healthy rollout
- **WHEN** the deploy workflow rolls out new images and the resulting revision becomes provisioned and healthy
- **THEN** the deploy job succeeds

#### Scenario: Unhealthy rollout
- **WHEN** the new revision fails to start and does not become healthy within the configured timeout
- **THEN** the deploy job fails and prints the API container logs for that revision

#### Scenario: Failed provisioning fails fast
- **WHEN** the new revision provisioning state becomes failed
- **THEN** the deploy job fails without waiting for the full timeout

#### Scenario: Every deploy creates a verifiable revision
- **WHEN** a deploy runs with images already present in the Container App
- **THEN** the run still creates an identifiable revision and verifies its health before reporting success
