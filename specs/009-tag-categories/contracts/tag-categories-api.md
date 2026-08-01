# Tag Categories API Contracts

This document defines the contract-level behavior for required tag categories and duplicate detection by tag name plus category.

## Shared Types

## TagInput

```json
{
  "tagName": "string",
  "tagCategory": "string",
  "description": "string",
  "color": "#RRGGBB"
}
```

Validation rules:
- `tagName`: trimmed, alphanumeric and dot (`.`) only.
- `tagCategory`: trimmed, 1..120 characters.
- `color`: strict `#RRGGBB`.
- The normalized combination of `tagName` and `tagCategory` must be unique per user.

## TagUpdate

```json
{
  "tagName": "string (optional)",
  "tagCategory": "string (optional)",
  "description": "string (optional)",
  "color": "#RRGGBB (optional)"
}
```

Rules:
- At least one field must be present.
- Conflict detection applies to the final normalized name-category pair after merge with the current stored tag.

## Tag

```json
{
  "id": "string",
  "tagName": "string",
  "tagCategory": "string",
  "description": "string",
  "color": "#RRGGBB",
  "order": 1,
  "createdAt": "string",
  "updatedAt": "string"
}
```

## TagList

```json
{
  "items": ["Tag"],
  "total": 1
}
```

## Category Semantics

- Categories are implicit and exist only because at least one owned tag references them.
- There is no standalone category create, update, delete, or list contract in this feature.
- Empty categories cease to exist automatically when no owned tags still reference them.
- Existing stored tags without a category must be surfaced as category `General` after migration/backfill.

## Item Write Constraint

For item create and update payloads:

- Every value in `tags` must still resolve to a tag name owned by the authenticated user.
- Category membership does not change the item payload shape.
- Changing only a tag category must not require item payload updates.

## Endpoints

## GET /tags

- Auth required.
- Query parameters: `limit`, `skip`, `search`, `sort`.
- `sort` supports `order`, `updatedAt`, `tagName`, and `tagCategory`.
- Response: `200 OK` with `TagList`.

## POST /tags

- Auth required.
- Body: `TagInput`.
- Response: `201 Created` with `Tag`.
- Duplicate normalized `tagName` + normalized `tagCategory` for the same user: `409 Conflict`.

## GET /tags/:id

- Auth required.
- Returns the owned tag.
- Cross-user access: `403 Forbidden` or `404 Not Found`.

## PATCH /tags/:id

- Auth required.
- Body: `TagUpdate`.
- Response: `200 OK` with updated `Tag`.
- Changing only the category updates the tag metadata but does not independently rewrite item tag payloads.

## DELETE /tags/:id

- Auth required.
- Deletes the owned tag.
- Cascades removal of the deleted tag name from all owned items.
- If the deleted tag was the last member of its category, that category ceases to exist automatically.
- Response: `204 No Content`.

## PATCH /tags/:id/reorder

- Auth required.
- Body: `{ "order": number }`.
- Reorders owned tags using the existing tag ordering semantics.
- Response: `200 OK` with updated `Tag`.

## Error Shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR | AUTH_ERROR | NOT_FOUND | CONFLICT",
    "message": "string",
    "details": []
  }
}
```

## Notes

- Shared Zod schemas and exported types belong in `packages/contracts`.
- Controllers remain transport-only; services enforce ownership, duplicate detection, category rules, and item cascade behavior.
- Repositories are the only layer that accesses MongoDB.
