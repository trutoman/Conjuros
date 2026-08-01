# Data Model: Tag Categories

## Tag

| Field                   | Type                  | Rules                                                                                    |
| ----------------------- | --------------------- | ---------------------------------------------------------------------------------------- |
| `id`                    | string                | Non-empty unique identifier                                                              |
| `ownerId`               | string                | Required, must match the authenticated user                                              |
| `tagName`               | string                | Required, trimmed, 1..120, alphanumeric and `.` only                                     |
| `tagNameNormalized`     | string                | Derived canonical lowercase value used for uniqueness and ownership-safe item validation |
| `tagCategory`           | string                | Required, trimmed, 1..120, preserved for display                                         |
| `tagCategoryNormalized` | string                | Derived canonical lowercase value used for uniqueness and implicit category lifecycle    |
| `description`           | string                | Required by contract, trimmed, max 2000                                                  |
| `color`                 | string                | Required, must match `#RRGGBB`                                                           |
| `order`                 | number                | Positive integer used for stable tag ordering                                            |
| `createdAt`             | string (ISO datetime) | Required                                                                                 |
| `updatedAt`             | string (ISO datetime) | Required                                                                                 |

### Tag invariants

- Uniqueness key is (`ownerId`, `tagNameNormalized`, `tagCategoryNormalized`).
- `tagName` and `tagCategory` preserve user-visible casing after trimming.
- A tag always belongs to exactly one category.
- Only the owner can read, update, reorder, or delete the tag.
- Existing legacy tags missing category data are backfilled to `General` and derive `tagCategoryNormalized` as `general`.

## Tag Category (derived concept)

| Field            | Type   | Rules                                                             |
| ---------------- | ------ | ----------------------------------------------------------------- |
| `name`           | string | User-visible category name derived from tags                      |
| `nameNormalized` | string | Canonical lowercase comparison value                              |
| `ownerId`        | string | Implicitly scoped to one authenticated user                       |
| `tagCount`       | number | Derived count of owned tags that currently reference the category |

### Tag category invariants

- A category exists for a user if and only if at least one owned tag currently references that normalized category.
- Categories are never created, updated, or deleted independently of tags.
- Reusing a category name on a new tag re-creates that category implicitly.

## Collection Item (existing, category-aware semantics)

| Field                     | Type           | Rules                                                                                     |
| ------------------------- | -------------- | ----------------------------------------------------------------------------------------- |
| `id`                      | string         | Existing                                                                                  |
| `ownerId`                 | string         | Existing, enforces ownership boundaries                                                   |
| `kind`                    | `spell         | web-link`                                                                                 | Existing |
| `title`                   | string         | Existing                                                                                  |
| `description`             | string         | Existing                                                                                  |
| `tags`                    | string[]       | Existing string tag references; every value must exist as an owned tag name at write time |
| `relatedItemIds`          | string[]       | Existing ownership validation                                                             |
| `command` / `url`         | string \| null | Existing kind-specific constraints                                                        |
| `order`                   | number         | Existing                                                                                  |
| `createdAt` / `updatedAt` | ISO datetime   | Existing                                                                                  |

### Item-tag association rules

- Items continue storing tag names, not category records.
- Category changes do not change the item `tags` array by themselves.
- Tag-name changes must keep item associations aligned with the renamed logical tag.
- Deleting a tag removes that tag name from all owned items where it is present.
- Item writes remain valid only when every supplied tag name belongs to the authenticated user.

## Query Models

## Tag List Query

| Field    | Type   | Rules                                                                         |
| -------- | ------ | ----------------------------------------------------------------------------- |
| `limit`  | number | 1..50, default 25                                                             |
| `skip`   | number | >= 0, default 0                                                               |
| `search` | string | Optional, case-insensitive over the existing tag-management searchable fields |
| `sort`   | enum   | `order`, `updatedAt`, `tagName`, `tagCategory`                                |

## Tag Mutations

| Operation | Input               | Rules                                                                                                      |
| --------- | ------------------- | ---------------------------------------------------------------------------------------------------------- |
| Create    | `TagInput`          | Requires `tagName`, `tagCategory`, `description`, `color`; rejects duplicate normalized name-category pair |
| Update    | `TagUpdate`         | Allows partial updates; duplicate pair checks apply to the final normalized name-category pair             |
| Delete    | Tag ID              | Removes the owned tag and cascades tag-name removal from owned items                                       |
| Reorder   | `{ order: number }` | Existing positive-order semantics                                                                          |

## State Transitions

## Tag lifecycle

1. `created` with required category
2. `updated` for name, category, description, color, or order
3. `deleted`

### Derived category lifecycle

1. Category is implicitly `created` when the first owned tag references a normalized category.
2. Category remains `active` while one or more owned tags reference that normalized category.
3. Category is implicitly `removed` when the last owned tag is deleted or moved to a different category.

## Error states

- Missing or blank category -> `400 Bad Request` (`VALIDATION_ERROR`)
- Category longer than 120 characters -> `400 Bad Request` (`VALIDATION_ERROR`)
- Duplicate normalized name-category pair for the same owner -> `409 Conflict`
- Cross-user tag read/update/delete/reorder -> `403 Forbidden` or `404 Not Found`
- Legacy tag without category not backfilled before strict reads -> data compatibility defect to address during migration rollout
