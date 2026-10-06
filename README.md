# Conjuros

Conjuros is a private collection for spells, web links, and markdown notes. Markdown notes can optionally carry a `filename` (a plain `.md` file name) shown in the markdown reader and editable in the item form. The stack runs in three Docker containers — `db`, `api`, and `web` — with the React frontend served by Nginx and the API proxied on a single origin.

## Local Development

### Prerequisites

- Docker Desktop or Docker Engine with its daemon running.
- Ports `5432` (PostgreSQL), `3000` (API), and `5173` (frontend) available.

### Start the Workspace (containers)

The application runs in three connected containers: `db` (PostgreSQL), `api` (Express),
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

   Set a required `POSTGRES_PASSWORD` (use only URL-safe characters — letters, digits, `- . _ ~`) and a unique `SESSION_SECRET` of at least 32 characters. `.env.example` also documents `POSTGRES_USER`, `POSTGRES_DB`, and `DATABASE_URL` for an API started on the host. `docker compose` reads these values from `.env`, so this file must exist before starting the stack. Keep `.env` private and never commit or share its contents.

3. Build and start all three containers:

   ```sh
   docker compose up -d
   ```

   The `api` container waits for PostgreSQL to become healthy, applies any pending database migrations, and the `web` container starts after the API is ready. Open [http://localhost:5173](http://localhost:5173) once startup completes. Stop the stack with `docker compose down`; do not run `docker compose down -v` unless you intend to delete local PostgreSQL data (stored in the `postgres_data` volume).

### From-scratch database

The database starts empty: there is no import of previously stored MongoDB data. On first start the API creates the schema through its committed migrations and seeds the default `light` and `dark` themes. Register accounts again after switching to PostgreSQL.

To reset the database, remove the volume and recreate the stack:

```sh
docker compose down
docker volume rm conjuros_postgres_data
docker compose up -d
```

The `ADMIN_EMAIL` account is granted the admin role at API startup, so register that account first and then restart the API container (`docker compose restart api`) for the role to take effect.

### Local Development (npm)

To develop frontend and API code with hot reload, run only the database in Docker and everything else via npm. `npm run dev` checks Docker availability, stops any full-stack `api`/`web` containers, verifies ports `3000` and `5173` are free (failing fast with the PID of a conflicting process), starts the `db` container and waits for it to become healthy, and then starts the API and Vite dev server:

```sh
npm install
npm run dev
```

The API reads its connection from `DATABASE_URL` (`postgres://…@localhost:5432/…`), so keep it consistent with the `POSTGRES_*` values in `.env`. When startup succeeds, open [http://localhost:5173](http://localhost:5173).

## Troubleshooting

- **Docker unavailable**: run `npm run docker:check`; install Docker or start its daemon before running Compose.
- **`Port 3000 or 5173 is already in use`**: when `npm run dev` fails fast, its message names the process holding the port — usually a leftover dev session. Stop it (`kill <pid>`) and rerun `npm run dev`.
- **`SESSION_SECRET` is required**: `docker compose up` fails before starting the `api` container when `.env` is missing or lacks `SESSION_SECRET`. Create `.env` from `.env.example` and set a value of at least 32 characters.
- **`POSTGRES_PASSWORD` is required**: `docker compose up` fails before starting the `db` container when `.env` is missing or lacks `POSTGRES_PASSWORD`. Set a URL-safe value, since the password is embedded in the API's `DATABASE_URL`.
- **Port 5432 already in use**: stop the conflicting service or choose another local development environment before running `docker compose up -d`; `npm run test:docker` also needs port `5432` free.
- **Invalid configuration**: API startup stops before serving requests and names the invalid environment variable. Update `.env` without placing real values in logs, issue reports, or source control.
- **Port 5173 unavailable**: the workspace has not reached the required frontend address. Stop the conflicting process, then rerun `docker compose up -d` and confirm [http://localhost:5173](http://localhost:5173) loads.

## Validation

Run the Docker-independent quality suite:

```sh
npm run check
```

On a Docker-capable machine with port `5432` free, verify local PostgreSQL data survives a normal service restart:

```sh
npm run test:docker
```

The persistence test starts the database in an isolated Compose project, exercises the production connection and migration wiring, and removes its test volume after completion. Repository behavior is also verified without Docker against an in-process PostgreSQL engine with the committed migrations applied.

## Database Schema Changes

Change the schema by editing `src/api/db/schema.ts` and generating a versioned SQL migration:

```sh
npm run db:generate
```

Generated migrations live in `drizzle/` and must be committed with the change. The API applies pending migrations at startup; to apply them explicitly against the database named by `DATABASE_URL`, run:

```sh
npm run db:migrate
```
