## MODIFIED Requirements

### Requirement: Storage is server-side and optional by configuration

The API SHALL reach Storage only with a server-side service role key supplied through environment configuration (`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`), which SHALL NOT be sent to the browser, logged, or committed. The bucket name SHALL default to `attachments` and the maximum file size SHALL default to 50 MiB, both overridable by configuration. When the Storage configuration is absent, the upload, download, and removal endpoints SHALL answer service unavailable while all other item operations, including metadata-only attachments, continue to work.

Storage SHALL belong to the same Supabase project as the database the API is using. When `DATABASE_URL` and `SUPABASE_URL` both resolve to a Supabase project reference and those references differ, the API SHALL fail to start before creating the database client, before applying migrations, and before listening, with an error that names `SUPABASE_URL`. When either value does not resolve to a Supabase project reference (for example a local PostgreSQL database, a custom domain, or self-hosted Storage), the check SHALL be skipped and startup SHALL continue. Objects written by one environment SHALL never be readable through another environment's credentials.

#### Scenario: Missing configuration disables file endpoints only

- **WHEN** the API runs without `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY`
- **THEN** the attachment file endpoints answer with the `STORAGE_NOT_CONFIGURED` error code
- **AND** creating, listing, and editing attachment items still works

#### Scenario: The service key never reaches the client

- **WHEN** the web application runs
- **THEN** no response or bundled asset contains the service role key

#### Scenario: Storage points at a different project than the database

- **WHEN** `DATABASE_URL` uses the Supabase project `prod-ref` and `SUPABASE_URL` is `https://dev-ref.supabase.co`
- **THEN** the API exits before listening with an error naming `SUPABASE_URL`
- **AND** no migration is applied and no object is written

#### Scenario: Storage points at the database's own project

- **WHEN** `DATABASE_URL` and `SUPABASE_URL` resolve to the same Supabase project reference
- **THEN** the API starts normally

#### Scenario: A non-Supabase database skips the project check

- **WHEN** `DATABASE_URL` points at a local PostgreSQL server that has no Supabase project reference
- **THEN** the API starts normally with the configured Storage

#### Scenario: An attachment survives the move to its own project

- **WHEN** the production Storage configuration changes from the dev project to the production project and the existing object is copied to the production bucket
- **THEN** the existing `attachments` row still points at the same `object_path`
- **AND** downloading the attachment returns the same bytes as before the move
