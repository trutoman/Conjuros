# Conjuros

Conjuros is a private collection for spells, web links, and markdown notes. Markdown notes can optionally carry a `filename` (a plain `.md` file name) shown in the markdown reader and editable in the item form. The stack runs in three Docker containers — `db`, `api`, and `web` — with the React frontend served by Nginx and the API proxied on a single origin.

## Local Development

### Prerequisites

- Docker Desktop or Docker Engine with its daemon running.
- Ports `27017` (MongoDB), `3000` (API), and `5173` (frontend) available.

### Start the Workspace (containers)

The application runs in three connected containers: `db` (MongoDB), `api` (Express),
and `web` (Nginx serving the built React app and proxying `/api` to the API container).

1. Verify Docker before building:

   ```sh
   npm run docker:check
   ```

   If the command says the Docker CLI is unavailable, install Docker. If it says Docker is installed but unavailable, start the Docker daemon.

2. Create local configuration:

   ```sh
   cp .env.example .env
   ```

   Set `MONGODB_DATABASE` and a unique `SESSION_SECRET` of at least 32 characters. `docker compose` reads these values from `.env`, so this file must exist before starting the stack. Keep `.env` private and never commit or share its contents.

3. Build and start all three containers:

   ```sh
   docker compose up -d
   ```

   The `api` container waits for Mongo to become healthy, and the `web` container starts after the API is ready. Open [http://localhost:5173](http://localhost:5173) once startup completes. Stop the stack with `docker compose down`; do not run `docker compose down -v` unless you intend to delete local MongoDB data (stored in the `mongo_data` volume).

### Local Development (npm)

To develop frontend and API code with hot reload, run only the database in Docker and everything else via npm. `npm run dev` checks Docker availability, stops any full-stack `api`/`web` containers, verifies ports `3000` and `5173` are free (failing fast with the PID of a conflicting process), starts the `db` container and waits for it to become healthy, and then starts the API and Vite dev server:

```sh
npm install
npm run dev
```

When startup succeeds, open [http://localhost:5173](http://localhost:5173).

## Troubleshooting

- **Docker unavailable**: run `npm run docker:check`; install Docker or start its daemon before running Compose.
- **`Port 3000 or 5173 is already in use`**: when `npm run dev` fails fast, its message names the process holding the port — usually a leftover dev session. Stop it (`kill <pid>`) and rerun `npm run dev`.
- **`SESSION_SECRET` is required**: `docker compose up` fails before starting the `api` container when `.env` is missing or lacks `SESSION_SECRET`. Create `.env` from `.env.example` and set a value of at least 32 characters.
- **Port 27017 already in use**: stop the conflicting service or choose another local development environment before running `docker compose up -d`.
- **Invalid configuration**: API startup stops before serving requests and names the invalid environment variable. Update `.env` without placing real values in logs, issue reports, or source control.
- **Port 5173 unavailable**: the workspace has not reached the required frontend address. Stop the conflicting process, then rerun `docker compose up -d` and confirm [http://localhost:5173](http://localhost:5173) loads.

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
