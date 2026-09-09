## Purpose

Converts the legacy per-tag category strings into real TagCategory entities with stored membership and removes the legacy fields from tag documents, in a verifiable one-shot migration.

## ADDED Requirements

### Requirement: Legacy categories become entities

The migration SHALL group every tag by owner and normalized legacy category (`tagCategory`, falling back to `tagCategoryNormalized`, falling back to `general` for missing or blank values). For each distinct group it SHALL ensure exactly one `TagCategory` entity exists for that owner, creating it when missing. The `general` entity SHALL be ensured for every owner that owns at least one tag, even when no tag referenced it.

#### Scenario: Distinct legacy values become distinct entities

- **WHEN** an owner has tags with legacy categories `Work`, `work` and `Hobby`
- **THEN** exactly two entities exist afterwards: `work` and `hobby`

#### Scenario: Tags without a category land in general

- **WHEN** a tag has no `tagCategory` field or it is blank
- **THEN** the tag is assigned to the `general` entity of its owner

#### Scenario: Owners are migrated independently

- **WHEN** two owners each have a legacy category `work`
- **THEN** each owner gets their own `work` entity
- **AND** no tag is assigned across owners

### Requirement: Membership is stored on the category

For every migrated tag, the migration SHALL add the tag id to its category's `tagIds` set. After migration, every tag id SHALL appear in exactly one `TagCategory` of its owner, and `tagCount` SHALL equal the size of `tagIds`.

#### Scenario: Every tag ends up in exactly one category

- **WHEN** the migration finishes
- **THEN** each tag id is a member of exactly one category of its owner
- **AND** no tag id appears in two categories

### Requirement: Legacy fields are removed from tags

After membership is persisted, the migration SHALL remove `tagCategory` and `tagCategoryNormalized` from every tag document. No tag document SHALL contain either field afterwards.

#### Scenario: Tag documents carry no category fields

- **WHEN** the migration finishes
- **THEN** zero tag documents contain `tagCategory` or `tagCategoryNormalized`

### Requirement: Migration is idempotent

Re-running the migration over an already migrated database SHALL change nothing: it SHALL NOT create duplicate entities, duplicate member ids, or fail on the absence of legacy fields.

#### Scenario: Second run is a no-op

- **WHEN** the migration runs twice in a row
- **THEN** the second run reports zero entities created and zero tags modified
- **AND** it exits successfully

### Requirement: Dry-run mode

The migration SHALL support a `--dry-run` flag that reports what would change (entities to create, tags to assign, fields to remove) without writing anything to the database.

#### Scenario: Dry run writes nothing

- **WHEN** the migration runs with `--dry-run`
- **THEN** it prints the planned changes
- **AND** no document in the database is modified

### Requirement: Verification pass and rollback guidance

The migration SHALL finish with a verification pass that fails the run when any tag still carries legacy fields, any tag id is missing from all categories, or any tag id appears in more than one category. A backup of the database SHALL be required before any write; rollback SHALL be restore-from-backup, documented in the script header output.

#### Scenario: Verification catches incomplete membership

- **WHEN** a tag id is missing from every category after the write phase
- **THEN** the migration exits with a non-zero status
- **AND** reports the offending tag id

#### Scenario: Backup is required

- **WHEN** the migration runs without `--dry-run` and no backup confirmation is given
- **THEN** it refuses to write
- **AND** explains how to back up and confirm
