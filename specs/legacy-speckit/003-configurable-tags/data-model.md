# Data Model: User Configurable Tags

## Tag

| Field | Type | Rules |
|---|---|---|
| `id` | string | Non-empty, unique identifier |
| `ownerId` | string | Required, must match authenticated user |
| `tagName` | string | Required, 1..120, characters limited to alphanumeric and `.` |
| `tagNameNormalized` | string | Derived canonical lowercase value for case-insensitive uniqueness/search |
| `description` | string | Required by contract, trimmed, max 2000 |
| `color` | string | Required, must match `#RRGGBB` |
| `order` | number | Positive integer for stable display ordering |
| `createdAt` | string (ISO datetime) | Required |
| `updatedAt` | string (ISO datetime) | Required |

### Tag invariants

- Uniqueness key is (`ownerId`, `tagNameNormalized`).
- `tagName` preserves original casing for display.
- Only the owner can read/update/delete/reorder the tag.

## Collection Item (existing, updated semantics)

| Field | Type | Rules |
|---|---|---|
| `id` | string | Existing |
| `ownerId` | string | Existing, ownership boundary |
| `kind` | `spell | web-link` | Existing |
| `title` | string | Existing |
| `description` | string | Existing |
| `tags` | string[] | Values must exist as owned tags at write time |
| `relatedItemIds` | string[] | Existing ownership validation |
| `command` / `url` | string \| null | Existing kind-specific constraints |
| `order` | number | Existing |
| `createdAt` / `updatedAt` | ISO datetime | Existing |

### Item-tag association rules

- Tags may be attached only if each tag value exists as a tag owned by the same authenticated user.
- Association validation occurs on item create/update.
- Renaming a tag keeps existing associations linked to the same logical tag.
- Deleting a tag removes that tag value from all owned items where present (cascade cleanup).

## Query Models

## Tag List Query

| Field | Type | Rules |
|---|---|---|
| `limit` | number | 1..50, default 25 |
| `skip` | number | >= 0, default 0 |
| `search` | string | Optional, case-insensitive against `tagName` and description |
| `sort` | enum | `order`, `updatedAt`, `tagName` |

## Collection Query (extended)

| Field | Type | Rules |
|---|---|---|
| `limit` | number | Existing 1..50 |
| `skip` | number | Existing >= 0 |
| `search` | string | Existing behavior |
| `kind` | enum | Existing behavior |
| `tags` | string[] | Optional list of selected tags owned by current user |
| `tagFilterMode` | enum | `all` (AND, default) or `any` (OR) |
| `sort` | enum | Existing behavior |

## State Transitions

## Tag lifecycle

1. `created` -> 2. `updated` (name, description, color, order) -> 3. `deleted`

On `deleted`, a cascade transition updates owned items by removing the deleted tag value from each item's `tags` array.

## Error states

- Invalid tag name format -> `400 Bad Request` (`VALIDATION_ERROR`)
- Invalid color format -> `400 Bad Request` (`VALIDATION_ERROR`)
- Duplicate tag name (case-insensitive, same owner) -> `409 Conflict`
- Assigning non-existent/non-owned tag to item -> `400 Bad Request` (`VALIDATION_ERROR`)
- Cross-user tag read/update/delete -> `403 Forbidden` or `404 Not Found`
