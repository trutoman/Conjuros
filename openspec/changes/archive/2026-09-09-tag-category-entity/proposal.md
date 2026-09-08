## Why

Tags currently store `tagCategory` as a free-form normalized string with no independent existence: a category only "exists" while at least one tag references it. This prevents showing empty categories, managing categories on their own, and guaranteeing that every tag belongs to exactly one category with a stable default.

## What Changes

- Introduce `TagCategory` as a first-class, owner-scoped data type (plain-text name + ordered set of member tags, possibly empty).
- Every tag MUST belong to exactly one tag category; creating a tag REQUIRES resolving a category.
- Creating a tag with an existing category name assigns the tag to that category; creating a tag with an unknown category name creates the category first and then assigns the tag.
- Creating a tag without a supplied category assigns it to the `general` category.
- The `general` category ALWAYS exists per user and acts as the default category; it is auto-created on demand and MUST NOT be deletable.
- Tag categories can exist empty (zero tags) and empty categories are still listed/shown in tag views.
- Deleting a category is only allowed when empty; deleting a tag removes it from its category set without deleting the category.

## Capabilities

### New Capabilities

- `tag-category`: TagCategory entity lifecycle, membership rules, default `general` category, and category listing including empty categories.

### Modified Capabilities

- `tag-management`: tag create/update validation now resolves a mandatory single category via the TagCategory entity; tag display, search, and sidebar grouping include empty categories.

## Impact

- Affected code: `packages/contracts` (new `tagCategory` schemas), `src/api/repositories` (new `tagCategories` collection/repository + migration of legacy string categories), `src/api/services` (TagsService category resolution, new TagCategoriesService), `src/api/controllers/routes` (new `/api/tag-categories` endpoints + changed tag payloads), `src/web` (tag form forces category choice, tag management shows empty categories).
- APIs: new CRUD/list endpoints for tag categories; `POST/PATCH /api/tags` semantics change to require/resolve exactly one category.
- Data: migration creates one `TagCategory` document per distinct normalized category plus a guaranteed `general` per user; tags keep `tagCategory` string as the source of truth for membership.
