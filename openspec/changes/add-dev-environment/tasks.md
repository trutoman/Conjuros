## 1. DEV database (manual, one time)

- [x] 1.1 Create a second Supabase project (`conjuros-dev`) with its own database password
- [x] 1.2 Copy its Session pooler connection string into the local `.env` as `DATABASE_URL` (keep `DATABASE_SSL=require`) and set a different `SESSION_SECRET` from production
- [x] 1.3 Start the stack (`docker compose up -d --build`) so migrations create the schema, register a test account and add sample items

## 2. Documentation

- [x] 2.1 Add a "Development environment" section to `README.md`: DEV vs production, where each set of secrets lives, DEV database setup
- [x] 2.2 Document the release routine (test on DEV including new migrations → PR → merge → automatic deploy) and the pre-release backup advice for destructive migrations
- [x] 2.3 Update the `DATABASE_URL` comment in `.env.example` to state it must point to the DEV project, never production

## 3. CI guardrails

- [x] 3.1 Add `.github/workflows/ci.yml` running `npm run check` on pull requests
- [x] 3.2 Add a `check` job to `.github/workflows/deploy-azure.yml` and make the `deploy` job depend on it with `needs: check`

## 4. Verification

- [x] 4.1 Confirm `npm run dev` and `docker compose up` work against the DEV database and production data is untouched
- [ ] 4.2 Open a test PR and confirm the CI workflow runs
- [x] 4.3 Run `npm run check`
