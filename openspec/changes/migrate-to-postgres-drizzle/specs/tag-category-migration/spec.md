## REMOVED Requirements

### Requirement: Legacy categories become entities

**Reason**: The one-shot MongoDB storage migration is deleted together with the MongoDB datastore. The application moves to a new PostgreSQL database that starts from scratch with category entities as the only category model, so there are no legacy per-tag category strings left to convert.

**Migration**: None. New databases create the `general` category and every other category through the normal tag and tag category flows (see the `tag-category` capability).

### Requirement: Membership is stored on the category

**Reason**: Membership storage on the category is still how the application works, but it is now guaranteed by the normal tag and tag category flows and the `tag-category` capability instead of a migration step.

**Migration**: None. Category membership is maintained by the tag create, update and delete flows.

### Requirement: Legacy fields are removed from tags

**Reason**: The new PostgreSQL schema never contained the legacy `tagCategory` and `tagCategoryNormalized` fields, so there is nothing to remove.

**Migration**: None. The tag storage carries no category fields from the first migration onward.

### Requirement: Migration is idempotent

**Reason**: There is no migration script left to re-run.

**Migration**: None. Database schema upgrades are handled by the versioned migrations described in the `postgres-persistence` capability.

### Requirement: Dry-run mode

**Reason**: There is no migration script left to preview.

**Migration**: None.

### Requirement: Verification pass and rollback guidance

**Reason**: There is no destructive one-shot migration left to verify or roll back, and the MongoDB backup workflow it referenced no longer applies.

**Migration**: None. The old `backup-*/` MongoDB dump stays untouched on disk for reference and is not read by any code.
