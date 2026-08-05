# Research: Local Development Environment Setup

## Decision: Pin the official MongoDB image to `mongo:7.0.39@sha256:9bdaeb6dac6e7e762e84e2f84103d1f9bb078fa1ba6bde8bb9d2274f655ad173`

**Rationale**: The official Docker Hub library currently provides `7.0.39`. Its OCI manifest-list digest is immutable, allowing the same multi-platform MongoDB 7.0 image to be retrieved for every contributor while preserving Docker's platform selection.

**Alternatives considered**:

- `mongo:7.0`: rejected because it is mutable and does not satisfy FR-001.
- `mongo:latest`: rejected because it may select a different major version.
- A platform-specific image manifest digest: rejected because contributors may use different CPU architectures.

## Decision: Load `.env` with `dotenv` and parse configuration in an API-only module

**Rationale**: `dotenv` tolerates an absent `.env` file, allowing the API configuration module to issue one actionable validation error rather than a runtime argument failure. A Zod-backed parser can validate nonblank MongoDB values, accepted MongoDB URI schemes, and the 32-character secret minimum without returning or logging their values. The server imports and invokes the parser before connecting to MongoDB or binding Express.

**Alternatives considered**:

- `tsx --env-file=.env`: rejected because a missing file fails before the API can explain which required variables are invalid.
- `tsx --env-file-if-exists=.env`: rejected because it depends on newer Node CLI support than the project's Node 20 LTS compatibility target.
- Parsing `.env` manually: rejected because a maintained configuration loader is less error-prone.

## Decision: Use a root Docker Compose file with one local service and one named volume

**Rationale**: A root `docker-compose.yml` gives contributors a standard `docker compose up -d` command. Declaring `container_name: mongo-local`, `27017:27017`, and `mongo_data:/data/db` directly fulfills the operational contract and makes the host connection target explicit.

**Alternatives considered**:

- Running `docker run` manually: rejected because flags are harder to reproduce and document.
- An in-memory MongoDB substitute: rejected because the feature specifically requires Docker Compose and restart persistence.

## Decision: Separate deterministic Docker checks from opt-in persistence verification

**Rationale**: An injectable process-command function makes unavailable Docker and stopped-daemon outcomes testable without changing the host daemon. A separate `npm run test:docker` command can start a uniquely named Compose project, write data, restart MongoDB, and verify persistence when Docker is available; it reports a clear skip when Docker cannot run.

**Alternatives considered**:

- Require Docker for `npm test`: rejected because local and CI test reliability must not depend on Docker.
- Mock persistence verification: rejected because FR-010 requires an actual Docker Compose integration check when Docker is available.
- Assume `docker compose` succeeds from documentation alone: rejected because unavailable Docker must have actionable feedback and test coverage.