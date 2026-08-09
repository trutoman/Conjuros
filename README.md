# Conjuros

Conjuros is a private collection for spells, web links, and markdown notes. Markdown notes can optionally carry a `filename` (a plain `.md` file name) shown in the markdown reader and editable in the item form. This repository includes a contributor-owned MongoDB service for local development.

## Local Development

### Prerequisites

- Node.js and npm.
- Docker Desktop or Docker Engine with its daemon running.
- Port `27017` available for MongoDB.
- Port `5173` available for the Vite frontend.

### Start the Workspace

1. Verify Docker before starting MongoDB:

   ```sh
   npm run docker:check
   ```

   If the command says the Docker CLI is unavailable, install Docker. If it says Docker is installed but unavailable, start the Docker daemon.

2. Start the local MongoDB service:

   ```sh
   docker compose up -d
   ```

   This starts the `mongo-local` container at `mongodb://localhost:27017` and stores development data in the `mongo_data` volume. Do not run `docker compose down -v` unless you intend to delete local MongoDB data.

3. Create local configuration:

   ```sh
   cp .env.example .env
   ```

   Set `MONGODB_DATABASE` and a unique `SESSION_SECRET` of at least 32 characters. Keep `.env` private and never commit or share its contents.

4. Install dependencies and start the application:

   ```sh
   npm install
   npm run dev
   ```

   When startup succeeds, open [http://localhost:5173](http://localhost:5173).

## Troubleshooting

- **Docker unavailable**: run `npm run docker:check`; install Docker or start its daemon before running Compose.
- **Port 27017 already in use**: stop the conflicting service or choose another local development environment before running `docker compose up -d`. Docker will report that `mongo-local` could not bind the port; do not assume it connected to an existing MongoDB instance.
- **Invalid configuration**: API startup stops before serving requests and names the invalid environment variable. Update `.env` without placing real values in logs, issue reports, or source control.
- **Port 5173 unavailable**: the workspace has not reached the required frontend address. Stop the conflicting process, then rerun `npm run dev` and confirm [http://localhost:5173](http://localhost:5173) loads.

## Validation

Run the Docker-independent quality suite:

```sh
npm run check
```

On a Docker-capable machine, verify local MongoDB data survives a normal service restart:

```sh
npm run test:docker
```

The Docker persistence test uses an isolated Compose project and removes its test volume after completion.

## Data Migration

After upgrading an existing database to support markdown items, run the backfill so every stored item carries the `content` field (as `null` for non-markdown items). Without it, reads of pre-existing items fail validation because the nullable `content` field is missing rather than `null`.

```sh
npm run migrate:backfill-content
```

The script is idempotent: it only touches documents that are missing the `content` field.

No migration is required for the optional markdown `filename`: reads normalize a missing `filename` to `null`.
