## Why

Production has been writing attachment objects into the **dev** Supabase project. The container app's `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` belong to `qinubembxpuzvfrjequz` (dev) while its `DATABASE_URL` points at `bzjdhpyjjmmucdoeajcg` (prod), so the only production attachment (`8d8b9d26-…/e5de719f-….jpg`) sits in the dev bucket. Nothing in the API prevented that mismatch, so any future deployment could silently split files from their metadata again.

## What Changes

- The API refuses to start when `SUPABASE_URL` resolves to a different Supabase project than `DATABASE_URL`, failing before the database client is created, before migrations run, and before it listens. The check is skipped when either value is not a Supabase project reference (local PostgreSQL, custom domain, self-hosted).
- The production container app is pointed at its own project's Storage (`https://bzjdhpyjjmmucdoeajcg.supabase.co`) and its service role key.
- The private `attachments` bucket is provisioned in the production project with the documented MIME filter and 50 MiB limit, and the dev bucket's policy is aligned with the same list.
- The one production attachment object is copied from the dev bucket to the prod bucket, verified by size and SHA-256, and removed from the dev bucket; its `attachments` row and `object_path` are unchanged.
- No attachment API shape, validation, or UI behavior changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `attachment-storage`: Storage is bound to the Supabase project of the configured database, and the API fails fast when the two project references differ.

## Impact

- API: `src/api/config/environment.ts` (project-reference derivation and startup validation).
- Tests: `src/tests/api/environment.test.ts` (matching refs, mismatched refs, non-Supabase database).
- Infrastructure: production Container App `SUPABASE_URL` and `supabase-service-role-key` secret; `attachments` bucket policies in both Supabase projects; one Storage object moved between projects.
- Operations: no database migration and no change to the `attachments` table.
