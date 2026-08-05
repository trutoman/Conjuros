# Quickstart: Validate the Local Development Environment

Use this guide to validate the contributor workflow described by the [local development contract](contracts/local-development.md) and [data model](data-model.md).

## Prerequisites

- Node.js compatible with the repository's package scripts.
- Docker Desktop or Docker Engine with the daemon running.
- Port `27017` available for MongoDB and port `5173` available for Vite.

## Run the Local Workspace

1. Verify Docker is usable:

   ```sh
   npm run docker:check
   ```

   Expected: successful Docker availability confirmation. If it fails, install or start Docker before continuing.

2. Start the local database:

   ```sh
   docker compose up -d
   ```

   Expected: the `mongo-local` container starts and accepts connections at `mongodb://localhost:27017`.

3. Create local application configuration:

   ```sh
   cp .env.example .env
   ```

   Set a nonblank `MONGODB_DATABASE` and a unique `SESSION_SECRET` of at least 32 characters. Do not commit `.env`.

4. Install dependencies and start development:

   ```sh
   npm install
   npm run dev
   ```

   Expected: the API configuration validates before serving requests and Vite is reachable at `http://localhost:5173`.

## Validate Failure Feedback

1. Stop Docker or otherwise make its daemon unavailable, then run:

   ```sh
   npm run docker:check
   ```

   Expected: the command clearly says Docker must be installed or started and does not imply MongoDB started.

2. Remove, blank, or shorten one required value in `.env`, then run:

   ```sh
   npm run dev
   ```

   Expected: API startup stops before serving and identifies the invalid variable without showing its value.

3. If Docker reports that port `27017` is already allocated, stop the conflicting service before running `docker compose up -d` again. If port `5173` is unavailable, stop the conflicting process and rerun `npm run dev`; the required frontend address is not available until `http://localhost:5173` loads.

## Validate MongoDB Persistence

On a Docker-capable machine, run:

```sh
npm run test:docker
```

Expected: the test writes a record, restarts the Compose MongoDB service, and confirms the record remains. If Docker is unavailable, it reports that the optional verification was skipped and why.

## Routine Validation

Run the standard Docker-independent suite:

```sh
npm run check
```

Expected: linting, tests, typechecking, and the production web build pass without requiring Docker.