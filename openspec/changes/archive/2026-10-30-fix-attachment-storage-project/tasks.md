## 1. Startup guard

- [x] 1.1 Add a helper to `src/api/config/environment.ts` that resolves the Supabase project reference from `DATABASE_URL` (`postgres.<ref>`, `<ref>.supabase.co`, `<ref>.pooler.supabase.com`) and from `SUPABASE_URL` (`<ref>.supabase.co`).
- [x] 1.2 Reject a mismatch in `parseApiEnvironment` with `path: ['SUPABASE_URL']`, skipping the check when either value is not a Supabase reference.
- [x] 1.3 Cover the guard in `src/tests/api/environment.test.ts`: matching references pass, mismatched references fail naming `SUPABASE_URL` without leaking values, and a local PostgreSQL URL skips the check.

## 2. Bucket policies

- [x] 2.1 Create the private `attachments` bucket in the production project with the documented MIME list and a 52 428 800 byte limit.
- [x] 2.2 Align the dev `attachments` bucket to the same MIME list and limit (it accepted `image/*` with no limit).

## 3. Move the production attachment object

- [x] 3.1 Copy `8d8b9d26-1b08-4921-bd1d-2509282607e9/e5de719f-ab9d-405e-8549-bcce1e77971e.jpg` from the dev bucket to the production bucket and verify 136199 bytes and SHA-256 `a500b0a2…a321`.
- [x] 3.2 Remove the production object from the dev bucket after the production copy is verified; the `attachments` row stays unchanged.

## 4. Production environment

- [x] 4.1 Set the Container App `SUPABASE_URL` to `https://bzjdhpyjjmmucdoeajcg.supabase.co` and replace the `supabase-service-role-key` secret with the production project's key.
- [x] 4.2 Restart the revision and confirm `https://conjuros.app/api/health` answers `200`.
- [x] 4.3 Confirm no attachment object is split across projects: every production row resolves inside the production bucket and the dev bucket only holds dev rows.

## 5. Validation

- [x] 5.1 Run `npm run check` (lint, tests, build) with the guard in place.
- [x] 5.2 Download an existing attachment from production with a real session and confirm the bytes match the original file.
- [x] 5.3 Deploy the revision containing the guard and confirm it starts (the production references now match).
