# Conjuros

Conjuros is a private collection for spells, web links, and markdown notes. Markdown notes can optionally carry a `filename` (a plain `.md` file name) shown in the markdown reader and editable in the item form. The data lives in a hosted Supabase PostgreSQL database; the stack runs in two Docker containers — `api` and `web` — with the React frontend served by Nginx and the API proxied on a single origin.

## Local Development

### Prerequisites

- A Supabase project (the free plan works).
- Docker Desktop or Docker Engine with its daemon running (only for the container stack).
- Ports `3000` (API) and `5173` (frontend) available.

### Configure Supabase

1. In the Supabase dashboard open **Connect** and choose **Session pooler**. Copy the connection string:
   `postgresql://postgres.<project-ref>:[YOUR-PASSWORD]@aws-0-<region>.pooler.supabase.com:5432/postgres`.
   Use the Session pooler: the direct connection is IPv6-only on the free plan and the Transaction pooler (port `6543`) does not support prepared statements.
2. Replace `[YOUR-PASSWORD]` with the database password (**Project Settings → Database**, where it can be reset). URL-encode special characters: `+` becomes `%2B`, `@` becomes `%40`, `/` becomes `%2F`, `#` becomes `%23`, `%` becomes `%25`.
3. Create the local configuration and fill it in:

   ```sh
   cp .env.example .env
   ```

   Set `DATABASE_URL` to the string above, keep `DATABASE_SSL=require`, and set a unique `SESSION_SECRET` of at least 32 characters. Optionally set `DATABASE_SSL_CA` to Supabase's CA certificate (**Project Settings → Database → SSL Configuration**) so host runs verify the server certificate; the Docker `api` container uses `require` without verification. Keep `.env` private and never commit or share its contents.

The API applies pending migrations on startup. They can also be applied manually with `npm run db:migrate`. All tables have Row Level Security enabled without policies, so they are not reachable through Supabase's public Data API; the API connects with the `postgres` role from `DATABASE_URL`, which bypasses RLS.

### Start the Workspace (containers)

1. Verify Docker before building:

   ```sh
   npm run docker:check
   ```

2. Build and start both containers:

   ```sh
   docker compose up -d
   ```

   Compose fails with `DATABASE_URL is required` or `SESSION_SECRET is required` when `.env` is incomplete. The `api` container applies migrations, and the `web` container starts after the API is ready. Open [http://localhost:5173](http://localhost:5173). Stop the stack with `docker compose down`.

### From-scratch database

The database starts empty: on first start the API creates the schema through its committed migrations and seeds the default `light` and `dark` themes. Data previously stored in a local PostgreSQL container is not migrated; register accounts again. The `ADMIN_EMAIL` account is granted the admin role at API startup, so register that account first and then restart the API (`docker compose restart api`).

### Local Development (npm)

To develop frontend and API code with hot reload run everything via npm. `npm run dev` verifies ports `3000` and `5173` are free (failing fast with the PID of a conflicting process) and starts the API and Vite dev server against Supabase:

```sh
npm install
npm run dev
```

When startup succeeds, open [http://localhost:5173](http://localhost:5173). The database is shared with every other run that uses the same `DATABASE_URL`; use a separate Supabase project for experiments.

## Email

The API sends account emails — a welcome message when an account is created by registration and a link to reset a forgotten password — through SMTP. Email is optional: when `SMTP_URL` is not set, the API logs each message to the console instead of delivering it, so local development needs no mail server.

Set the following in `.env` to enable delivery:

- `SMTP_URL` — an `smtp:` or `smtps:` connection URL (for example `smtp://user:password@smtp.example.com:587`).
- `MAIL_FROM` — the sender address; required when `SMTP_URL` is set.
- `APP_BASE_URL` — the public base URL used to build password reset links (defaults to `CORS_ORIGIN`).
- `PASSWORD_RESET_TTL_MINUTES` — how long a reset link stays valid, in minutes (default `60`).

## Troubleshooting

- **Docker unavailable**: run `npm run docker:check`; install Docker or start its daemon before running Compose.
- **`Port 3000 or 5173 is already in use`**: when `npm run dev` fails fast, its message names the process holding the port — usually a leftover dev session or the Compose stack. Stop it and rerun `npm run dev`.
- **`SESSION_SECRET` / `DATABASE_URL` is required**: `docker compose up` fails before starting the `api` container when `.env` is missing or lacks the value. Create `.env` from `.env.example`.
- **Database authentication fails**: check the password in `DATABASE_URL` and that special characters are URL-encoded (`+` → `%2B`).
- **Connection timeout or `ENETUNREACH`**: use the Session pooler string, not the direct connection, which is IPv6-only on the free plan.
- **Project paused**: free Supabase projects pause after inactivity; restore it from the dashboard and retry.
- **Invalid configuration**: API startup stops before serving requests and names the invalid environment variable. Update `.env` without placing real values in logs, issue reports, or source control.

## Validation

Run the quality suite; it needs neither Docker nor access to Supabase:

```sh
npm run check
```
