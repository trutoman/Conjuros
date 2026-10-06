## Purpose

Defines how Conjuros persists its data in PostgreSQL: connection configuration, schema lifecycle, the from-scratch start, database-enforced integrity, and the preserved filtering, ordering and atomicity semantics of users, items, tags, tag categories and themes.

## ADDED Requirements

### Requirement: PostgreSQL is the only datastore

The system SHALL persist users, collection items, tags, tag categories and themes in a PostgreSQL database and SHALL NOT depend on MongoDB at runtime, in its Compose stack, or in its contributor scripts. Persisted data SHALL survive API restarts and database container restarts.

#### Scenario: Data survives an API restart

- **WHEN** a user registers and creates an item
- **AND** the API process is restarted
- **THEN** the user can sign in again
- **AND** the item is returned with the same field values

#### Scenario: No MongoDB dependency remains

- **WHEN** the runtime dependencies, the Compose services and the contributor scripts are inspected
- **THEN** none of them references MongoDB

### Requirement: Database connection is configured by DATABASE_URL

The API SHALL read its database connection from a single `DATABASE_URL` environment variable, which MUST be a `postgres:` or `postgresql:` URL. When the variable is missing, blank or uses another protocol, the API SHALL refuse to start with an error that names `DATABASE_URL` and SHALL NOT include the value, because it can contain credentials.

#### Scenario: Valid URL is accepted

- **WHEN** `DATABASE_URL` is `postgres://conjuros:secret@localhost:5432/conjuros`
- **THEN** the API accepts the configuration

#### Scenario: Other protocols are rejected

- **WHEN** `DATABASE_URL` is `mongodb://localhost:27017`
- **THEN** startup fails with an error naming `DATABASE_URL`
- **AND** the error message does not contain the URL

#### Scenario: Missing or blank URL is rejected

- **WHEN** `DATABASE_URL` is unset or contains only whitespace
- **THEN** startup fails with an error naming `DATABASE_URL`

### Requirement: The schema is created and upgraded by versioned migrations at startup

The database schema SHALL be defined by versioned migrations that are committed with the source code. On startup the API SHALL apply every pending migration before it accepts requests. Applying all migrations to an empty database SHALL produce the complete schema. Restarting the API against an up-to-date database SHALL NOT re-apply migrations or alter stored data. When the database is unreachable or a migration fails, the API SHALL exit with a non-zero status instead of serving requests.

#### Scenario: Empty database is bootstrapped

- **WHEN** the API starts against a PostgreSQL database that has no tables
- **THEN** all migrations are applied
- **AND** the API serves requests

#### Scenario: Restart keeps existing data

- **WHEN** the API restarts against an up-to-date database that already holds users and items
- **THEN** no migration is applied again
- **AND** the stored rows are unchanged

#### Scenario: Unreachable database prevents startup

- **WHEN** the API starts and the database cannot be reached
- **THEN** the process exits with a non-zero status
- **AND** it never listens for requests

### Requirement: The database starts from scratch without data migration

The system SHALL NOT provide or require any import of previously stored MongoDB data. The first start against an empty database SHALL create the schema, seed the default themes, and leave the database with no users, items, tags or tag categories.

#### Scenario: First start seeds default themes only

- **WHEN** the API starts for the first time against an empty database
- **THEN** the default `light` and `dark` themes exist
- **AND** exactly one theme is marked as the default
- **AND** no user, item, tag or tag category exists

### Requirement: Public API behavior is unchanged by the datastore

Replacing the datastore SHALL NOT change any API endpoint, status code, validation error or response shape. Responses SHALL NOT expose persistence-only data (owner identifiers, password hashes and normalized name values). Timestamps SHALL be ISO-8601 UTC date-time strings, and optional item fields that hold no value SHALL be returned as `null`.

#### Scenario: Timestamps are ISO-8601 strings

- **WHEN** a user creates an item
- **THEN** `createdAt` and `updatedAt` in the response are ISO-8601 UTC date-time strings

#### Scenario: Empty optional fields are null

- **WHEN** a user creates a `spell` item without a description
- **THEN** the response returns `description`, `url`, `content` and `filename` as `null`

#### Scenario: Persistence-only data is not exposed

- **WHEN** an item, tag, tag category or user response is inspected
- **THEN** it contains no owner identifier, no password hash and no normalized name value

### Requirement: Ownership isolation is enforced by every stored query and by referential integrity

Every read and write of owner-scoped data (items, tags and tag categories) SHALL be restricted to the requesting owner. The database SHALL reject owner-scoped data that references a user that does not exist.

#### Scenario: Cross-owner reads find nothing

- **WHEN** user B requests an item, tag or tag category that belongs to user A
- **THEN** the request is answered as not found

#### Scenario: Cross-owner writes change nothing

- **WHEN** user B updates, reorders or deletes an item that belongs to user A
- **THEN** the request is answered as not found
- **AND** user A's item is unchanged

#### Scenario: Owner-scoped data requires an existing user

- **WHEN** a write stores an item, tag or tag category for an owner that has no user account
- **THEN** the database rejects the write

### Requirement: The database enforces domain integrity rules

The database SHALL reject writes that violate the following rules regardless of the application code path that issued them: account emails are unique; tag category names are unique per owner; theme names are unique; at most one theme is the default; an item's kind determines which value fields it holds (`spell` holds only a command, `web-link` holds only a URL, `markdown` and `file` hold content and an optional filename); and item kinds, user roles and theme preferences only accept their defined values. Concurrent requests that hit these rules SHALL be resolved as their sequential equivalents.

#### Scenario: Duplicate email is a conflict

- **WHEN** two registrations with the same email are submitted at the same time
- **THEN** exactly one account is created
- **AND** the other request is answered with a `409` conflict

#### Scenario: Concurrent category creation yields one category

- **WHEN** two tags that both introduce the unknown category `work` are created at the same time
- **THEN** both requests succeed
- **AND** exactly one `work` category exists for that owner and contains both tags

#### Scenario: A single default theme

- **WHEN** an admin activates a different theme
- **THEN** exactly one theme is the default afterwards

#### Scenario: Item kind and value fields must agree

- **WHEN** a write stores a `spell` item without a command, or a `web-link` item that also holds content
- **THEN** the database rejects the write

### Requirement: Listings keep their filtering, search, sorting and pagination semantics

Item, tag category and theme listings SHALL behave exactly as before. Item listings SHALL filter by kind and by tags (all selected tags, or any selected tag) and SHALL support free-text search as a case-insensitive substring match over title, description, command, URL, content and tags, in which the characters `%`, `_` and `\` in the search text are matched literally. Items SHALL sort by order (ascending), title (ascending) or last update (newest first); tag categories and themes keep their own sort options. Pagination SHALL use `limit` and `skip`, and `total` SHALL count every match regardless of pagination. Ties on the chosen sort key SHALL be ordered consistently so that paging never repeats or skips a row.

#### Scenario: Search is case-insensitive and spans fields

- **WHEN** an item has the command `Docker Compose Up` and a user searches for `compose`
- **THEN** the item is included in the results

#### Scenario: Search wildcards are literal

- **WHEN** one item contains the text `100% done`, another contains `1000 items`, and a user searches for `100%`
- **THEN** only the item containing `100%` is returned

#### Scenario: Tag filter modes

- **WHEN** a user filters by tags `a` and `b` with mode `all`
- **THEN** only items carrying both tags are returned
- **AND WHEN** the mode is `any`
- **THEN** items carrying at least one of the tags are returned

#### Scenario: Pagination reports the full total

- **WHEN** a user has 7 matching items and requests `limit` 3 and `skip` 3
- **THEN** 3 items are returned
- **AND** `total` is 7

#### Scenario: Ties do not break paging

- **WHEN** several items share the same last-update time and the user pages through them sorted by last update with `limit` 2
- **THEN** every item appears exactly once across the pages

### Requirement: Reordering and tag cascades are atomic

Reordering an item, a tag or a tag category SHALL leave the owner's list with contiguous positions `1` to `n` and no duplicates, with the moved entry at the requested position (a position past the end places it last). The whole reorder SHALL succeed or fail as one operation. Renaming a tag SHALL update every affected item of the owner as one operation and SHALL NOT leave the same tag twice on an item. Deleting a tag SHALL remove it from every item of the owner as one operation and SHALL NOT touch other owners' items. Activating a theme as the default SHALL never expose zero or two default themes to readers.

#### Scenario: Moving an item renumbers the list

- **WHEN** the third of five items is moved to position 1
- **THEN** the five items have positions 1 to 5 with no duplicates
- **AND** the moved item is first

#### Scenario: A position past the end places the item last

- **WHEN** an item is moved to position 99 in a list of five items
- **THEN** it is the last item with position 5

#### Scenario: Renaming a tag does not duplicate it on an item

- **WHEN** tag `a` is renamed to `b` and an item already carries both `a` and `b`
- **THEN** the item carries `b` exactly once

#### Scenario: Deleting a tag removes it from the owner's items only

- **WHEN** user A deletes tag `docs` that is used by items of user A
- **AND** user B has items carrying their own `docs` tag
- **THEN** none of user A's items carries `docs` afterwards
- **AND** user B's items are unchanged
