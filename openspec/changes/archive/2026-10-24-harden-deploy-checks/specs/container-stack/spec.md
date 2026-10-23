## ADDED Requirements

### Requirement: External URLs are validated before the API touches the database
The API SHALL validate `SUPABASE_URL`, `CORS_ORIGIN`, and `APP_BASE_URL` as absolute `http:` or `https:` URLs while parsing its environment. Values that lack a well-formed scheme or use another protocol SHALL be rejected with an error that names the invalid variable, and validation SHALL complete before the database client is created and before migrations are applied. Absent optional URLs SHALL keep their current defaults and behavior.

#### Scenario: Malformed scheme is rejected before migrations
- **WHEN** `SUPABASE_URL` is set to `ttps://project.supabase.co`
- **THEN** the API fails to start with an error naming `SUPABASE_URL` and no migration is applied

#### Scenario: Non-HTTP protocol is rejected
- **WHEN** `APP_BASE_URL` is set to `ftp://conjuros.app`
- **THEN** the API fails to start with an error naming `APP_BASE_URL`

#### Scenario: Valid URLs are accepted
- **WHEN** `SUPABASE_URL`, `CORS_ORIGIN`, and `APP_BASE_URL` are absolute `http:` or `https:` URLs
- **THEN** the API starts normally

#### Scenario: Unset optional URLs keep current behavior
- **WHEN** `SUPABASE_URL`, `CORS_ORIGIN`, and `APP_BASE_URL` are unset
- **THEN** the API starts with no Storage configuration and the existing CORS and base URL defaults
