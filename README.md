# Conjuros

Conjuros is a private collection for commands, web links, markdown notes, plain-text files, and attachments. Markdown notes can optionally carry a `filename` (a plain `.md` file name) shown in the markdown reader and editable in the item form. Attachments store their file in a private Supabase Storage bucket, with metadata in PostgreSQL, and are downloaded through short-lived signed URLs. The data lives in a hosted Supabase PostgreSQL database; the stack runs in two Docker containers — `api` and `web` — with the React frontend served by Nginx and the API proxied on a single origin.

## Local Development

### Prerequisites

- A Supabase project for development, separate from production (the free plan works); see [Development environment and releases](#development-environment-and-releases).
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

When startup succeeds, open [http://localhost:5173](http://localhost:5173). The database is shared with every other run that uses the same `DATABASE_URL`; use the DEV project described below.

## Development environment and releases

Production runs on Azure Container Apps with its own Supabase project and is deployed automatically from every push to `main`. All local work (`docker compose` and `npm run dev`) must use a separate **DEV** Supabase project so that tests and migrations never touch production data.

| | DEV (your machine) | Production (Azure) |
|---|---|---|
| Database | Supabase project `conjuros-dev` | Production Supabase project |
| Where the secrets live | Local `.env` (git-ignored) | Azure Container App configuration |
| `SESSION_SECRET` / DB password | Its own values | Its own values |

### Set up the DEV database (once)

1. Create a second, free Supabase project (for example `conjuros-dev`) with its own database password.
2. Copy its **Session pooler** connection string into your local `.env` as `DATABASE_URL`, keep `DATABASE_SSL=require`, and set a `SESSION_SECRET` different from production.
3. Start the stack (`docker compose up -d --build` or `npm run dev`). The API applies the committed migrations, so the schema is identical to production; the data is only what you create, so register a test account and add sample items.

Never copy production credentials into a local `.env`.

### Release routine

1. Develop on a branch and run it against the DEV database. If the change adds a migration (`npm run db:generate`), apply it to DEV (it runs at API startup or with `npm run db:migrate`) and test with it.
2. Open a pull request; the `CI` workflow runs `npm run check`.
3. Merge to `main`. The deploy workflow runs the same checks, builds the images, rolls out a revision named `conjuros-web--gh<run-id>-web`, and then waits until that revision is provisioned and healthy. If it does not become healthy within the timeout, the job fails and prints the API container logs for that revision.

Migrations are applied automatically when the production API starts, so always test them on DEV first. Before releasing a destructive migration (dropping or rewriting columns or tables), export a backup of the production database.

If a rollout stays unhealthy, reactivate the previous revision while you investigate:

```bash
az containerapp revision list -n <container-app> -g <resource-group> -o table
az containerapp revision activate -n <container-app> -g <resource-group> --revision <previous-revision>
```

The container app and resource group are the `CONTAINER_APP` and `RESOURCE_GROUP` repository variables used by the workflow.

## Email

The API sends account emails — a welcome message when an account is created by registration and a link to reset a forgotten password — through SMTP. Email is optional: when `SMTP_URL` is not set, the API logs each message to the console instead of delivering it, so local development needs no mail server.

Set the following in `.env` to enable delivery:

- `SMTP_URL` — an `smtp:` or `smtps:` connection URL (for example `smtp://user:password@smtp.example.com:587`).
- `MAIL_FROM` — the sender address; required when `SMTP_URL` is set.
- `APP_BASE_URL` — the public base URL used to build password reset links (defaults to `CORS_ORIGIN`), as an absolute `http:` or `https:` URL.
- `PASSWORD_RESET_TTL_MINUTES` — how long a reset link stays valid, in minutes (default `60`).

## Attachments

Attachment items keep their file in a private Supabase Storage bucket and their metadata in the `attachments` table. The API is the only Storage client: it authenticates with the service role key, so no `storage.objects` policy is granted to `anon` or `authenticated` and the browser never talks to Storage directly. Uploads, downloads, and removals are owner-checked; a download returns a signed URL valid for five minutes.

Set the following in `.env` to enable file storage:

- `SUPABASE_URL` — the project URL, `https://<project-ref>.supabase.co` (the ref is the suffix of the pooler user, `postgres.<project-ref>`). It must be an absolute `http:` or `https:` URL; the API rejects a missing or malformed scheme before it starts.
- `SUPABASE_SERVICE_ROLE_KEY` — the `service_role` / `sb_secret_…` key (**Project Settings → API Keys**). It bypasses RLS, so it stays server-side: never add it to the web build or a `VITE_*` variable.
- `ATTACHMENT_BUCKET` — bucket name, default `attachments`.
- `ATTACHMENT_MAX_BYTES` — maximum file size, default `52428800` (50 MiB).

Both `SUPABASE_*` values are required together; with only one set, the API refuses to start. With neither set the file endpoints answer `503 STORAGE_NOT_CONFIGURED` and metadata-only attachments keep working.

The bucket must be **private** and its filters must match the app: allowed MIME types `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`, `text/plain`, `text/csv`, `application/zip`, `application/x-7z-compressed`, `application/gzip`, `application/x-tar`, and a file size limit of `52428800`. A mismatch (a typo such as `aplication/pdf`, or a narrower `image/*` list) rejects uploads that the API accepted.

Endpoints, all behind the session cookie:

| Method | Path | Result |
|---|---|---|
| `PUT` | `/api/items/:id/attachment` | Uploads or replaces the file, returns the item |
| `GET` | `/api/items/:id/attachment/download` | `{ url, expiresInSeconds: 300 }` |
| `DELETE` | `/api/items/:id/attachment` | Removes the file, keeps the item |

Uploads are capped by Nginx (`client_max_body_size 60m`), by the API, and by the bucket; the API also verifies size, MIME type, and the file signature. Removing an item deletes its object. Changing the kind of an item that still has a stored file is rejected with a conflict, so remove the file first.

## Troubleshooting

- **Docker unavailable**: run `npm run docker:check`; install Docker or start its daemon before running Compose.
- **`Port 3000 or 5173 is already in use`**: when `npm run dev` fails fast, its message names the process holding the port — usually a leftover dev session or the Compose stack. Stop it and rerun `npm run dev`.
- **`SESSION_SECRET` / `DATABASE_URL` is required**: `docker compose up` fails before starting the `api` container when `.env` is missing or lacks the value. Create `.env` from `.env.example`.
- **Database authentication fails**: check the password in `DATABASE_URL` and that special characters are URL-encoded (`+` → `%2B`).
- **Connection timeout or `ENETUNREACH`**: use the Session pooler string, not the direct connection, which is IPv6-only on the free plan.
- **Project paused**: free Supabase projects pause after inactivity; restore it from the dashboard and retry.
- **Invalid configuration**: API startup stops before serving requests and names the invalid environment variable. Update `.env` without placing real values in logs, issue reports, or source control.
- **Upload rejected with `415 UNSUPPORTED_FILE_TYPE` for a type the app allows**: the bucket's MIME filter does not match the list above (check for typos such as `aplication/pdf`). `docker compose logs api` shows the Storage message that was rejected.
- **Upload rejected with `413`**: one of the three limits is lower than the file — `ATTACHMENT_MAX_BYTES`, Nginx `client_max_body_size`, or the bucket file size limit.
- **Upload rejected with `503 STORAGE_UNAVAILABLE`**: Storage could not be reached or returned an unexpected error; the item keeps the file it already had. Check `docker compose logs api` for the Storage detail.

## Validation

Run the quality suite; it needs neither Docker nor access to Supabase:

```sh
npm run check
```
