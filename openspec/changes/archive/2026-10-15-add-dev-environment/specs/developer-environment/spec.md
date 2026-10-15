## ADDED Requirements

### Requirement: Development uses a database isolated from production
The documented development workflow SHALL run the API against a dedicated DEV PostgreSQL database (a separate Supabase project) that has the same schema as production through the committed migrations and contains no production data. Production credentials SHALL exist only in the production deployment configuration and SHALL NOT be placed in a local `.env`.

#### Scenario: DEV database is separate
- **WHEN** a contributor follows the documented setup
- **THEN** `DATABASE_URL` in `.env` points to the DEV Supabase project and not to the production project

#### Scenario: Same schema as production
- **WHEN** the API starts against an empty DEV database
- **THEN** the committed migrations are applied and the schema matches production

#### Scenario: Migrations are tried on DEV first
- **WHEN** a change includes a new migration
- **THEN** the documented release routine requires applying it to the DEV database and testing before merging to `main`

### Requirement: Checks gate deployment
The repository SHALL run lint, tests, and build (`npm run check`) on pull requests, and the production deploy workflow SHALL NOT build or roll out images unless the same checks pass.

#### Scenario: Pull request checks
- **WHEN** a pull request is opened or updated
- **THEN** a workflow runs `npm run check` and reports the result

#### Scenario: Failing checks block deployment
- **WHEN** a push to `main` fails `npm run check`
- **THEN** the deploy job does not run and no new revision is rolled out
