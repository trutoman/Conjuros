# remote-database Specification

## Purpose

Defines how the API and migrations connect to a hosted Supabase PostgreSQL database over TLS and how application tables are kept private from Supabase's public Data API.

## Requirements

### Requirement: API uses a configurable remote PostgreSQL database
The API and the migration runner SHALL connect to the PostgreSQL database named by `DATABASE_URL`, which MAY point to a hosted Supabase project. The system SHALL NOT require a local database container to run.

#### Scenario: API starts against Supabase
- **WHEN** `DATABASE_URL` holds a valid Supabase connection string and the database is reachable
- **THEN** the API applies pending migrations and serves requests

#### Scenario: Invalid database URL
- **WHEN** `DATABASE_URL` is missing or does not use the `postgres:` or `postgresql:` protocol
- **THEN** startup fails with a named environment validation error

### Requirement: TLS for database connections is configurable
The system SHALL read an optional `DATABASE_SSL` setting with the values `disable` (default) and `require`. With `require` the connection SHALL be encrypted. When `DATABASE_SSL_CA` names a CA certificate file, the server certificate SHALL also be verified against it. Any other value SHALL fail environment validation.

#### Scenario: Default is unencrypted for local databases
- **WHEN** `DATABASE_SSL` is unset
- **THEN** the connection is opened without TLS

#### Scenario: Encrypted connection
- **WHEN** `DATABASE_SSL=require`
- **THEN** the connection uses TLS

#### Scenario: Verified connection
- **WHEN** `DATABASE_SSL=require` and `DATABASE_SSL_CA` points to a readable certificate
- **THEN** the server certificate is verified against that CA

#### Scenario: Unknown TLS mode
- **WHEN** `DATABASE_SSL` has a value other than `disable` or `require`
- **THEN** startup fails with a named environment validation error

### Requirement: Application tables are not exposed through Supabase's public API
Every application table SHALL have Row Level Security enabled, with no policies for the `anon` and `authenticated` roles, so the tables cannot be read or written through Supabase's Data API. The API's direct database role SHALL retain full access.

#### Scenario: Migration enables RLS
- **WHEN** all migrations have been applied
- **THEN** each table in the `public` schema created by the application has Row Level Security enabled

#### Scenario: API keeps working
- **WHEN** the API connects with the database owner role from `DATABASE_URL`
- **THEN** reads and writes on application tables succeed
