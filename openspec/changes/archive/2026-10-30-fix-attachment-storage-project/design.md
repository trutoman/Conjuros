## Context

See `proposal.md` for motivation. Current state that shapes the approach:

- `parseApiEnvironment` already validates every variable and reports failing variable names before `createDatabase` and `runMigrations` run (`src/api/server.ts`).
- `DATABASE_URL` for a Supabase project is a pooler string whose username is `postgres.<project-ref>`; the Storage project URL is `https://<project-ref>.supabase.co`. Both encode the same reference.
- The production Container App `conjuros-web` (`conjuros-rg`) runs the API as the `conjuros-api` container, with `SUPABASE_URL` as a plain env value and `SUPABASE_SERVICE_ROLE_KEY` as a secret reference.
- The production `attachments` table holds one row pointing at `8d8b9d26-1b08-4921-bd1d-2509282607e9/e5de719f-ab9d-405e-8549-bcce1e77971e.jpg` (136199 bytes), and that object exists only in the dev bucket.

## Goals / Non-Goals

**Goals:**

- One environment can never read or write another environment's Storage objects.
- The existing production attachment keeps working with no row change.
- The check costs nothing at request time and cannot be bypassed by a later deployment.

**Non-Goals:**

- Enforcing a project match when the database or Storage is not Supabase (local PostgreSQL, custom domains, self-hosted).
- Changing the `attachments` schema, the upload validation, or the download flow.
- Automating object migration between projects in application code; the one-off move is an operational step.

## Decisions

### 1. Derive the project reference from the existing values and fail during environment parsing

A helper resolves the reference from `DATABASE_URL` (username `postgres.<ref>`, or host `<ref>.supabase.co` / `<ref>.pooler.supabase.com`) and from `SUPABASE_URL` (`<ref>.supabase.co`). A schema-level refinement rejects a mismatch with `path: ['SUPABASE_URL']`, so `parseApiEnvironment` throws `Invalid environment configuration: SUPABASE_URL` — the same shape as every other startup validation.

Rationale: validation already runs before the database client and migrations, so a misconfigured deployment cannot write objects or touch the schema. No new variable is needed because both values already carry the reference.

Alternatives rejected: a log-only warning (the exact failure that caused this incident would still ship); a required `SUPABASE_PROJECT_REF` variable (more configuration for the same information); checking on each request (too late, after migrations).

### 2. Skip the check when either side is not a Supabase reference

The refinement only compares when both values resolve to a reference. A local `postgres://…@localhost` database, a custom Supabase domain, or self-hosted Storage therefore keeps working unchanged.

Rationale: the invariant is "the environment's own project", which is only meaningful for hosted Supabase. Rejecting everything else would break local development and tests.

### 3. Move the object before switching the environment; never rewrite the row

The operational sequence is: create the `attachments` bucket in the production project, copy the object from the dev bucket, verify size and SHA-256, then update the Container App `SUPABASE_URL` and service-role secret and restart. The `attachments` row is untouched because `object_path` is relative to the bucket.

Rationale: the row is the source of truth for the file's identity; changing only the bucket keeps the path, the owner check, and the signed-URL flow identical. Copy-then-switch guarantees the file exists in the new location before the API starts reading from it.

Alternatives rejected: re-uploading through the API (requires a user session and rewrites metadata); switching first and copying after (a window where downloads return `404`).

### 4. Align both buckets to the documented policy

`attachments` in both projects is private, limited to the documented MIME list, and capped at 52 428 800 bytes. The dev bucket previously accepted `image/*` with no size limit, which did not match the API's validation.

Rationale: a bucket that accepts more than the API is harmless but hides misconfiguration; a bucket that accepts less produces `415`/`413` that are hard to diagnose. Matching the documented policy makes the three limits (API, nginx, bucket) consistent.

## Risks / Trade-offs

- **A custom Supabase domain (for example `storage.example.com`) would not resolve to a reference** → the check is skipped, so the deployment is not blocked; the trade-off is that the guard does not protect that setup.
- **Applying the guard before fixing production would crash the prod revision** → the migration plan fixes the environment first, verifies the object, then lands the guard.
- **The object move can lose the only production file** → copy and hash-verify before switching; the dev copy is deleted only after the production bucket is confirmed.
- **A future deployment could reintroduce a mismatch through a secret override** → the guard runs on every boot, so the revision fails to start instead of silently writing to the wrong bucket.

## Migration Plan

1. Create the `attachments` bucket in the production project and align both projects' bucket policies (private, documented MIME list, 50 MiB).
2. Copy `8d8b9d26-1b08-4921-bd1d-2509282607e9/e5de719f-ab9d-405e-8549-bcce1e77971e.jpg` from the dev bucket to the production bucket; verify 136199 bytes and SHA-256 `a500b0a22723c70d823e12be5ab79e2cae2e25148e5bd89df5ff85fc29a1a321`.
3. Update the Container App: `SUPABASE_URL=https://bzjdhpyjjmmucdoeajcg.supabase.co` and the `supabase-service-role-key` secret to the production project's key; restart and confirm `/api/health`.
4. Remove the production object from the dev bucket once the production copy is verified.
5. Deploy the code with the project-reference guard; the running revision must resolve the same reference on both sides.

Rollback: point `SUPABASE_URL` and the secret back at the dev project and restart. The object still exists in the production bucket, so no data is lost either way; the guard would then block startup, so a rollback must also revert the code.
