# Configurable Tags API Contracts

This document defines contract-level additions and changes needed for user-configurable tags.

## Shared Types

## TagInput

```json
{
  "tagName": "string",
  "description": "string",
  "color": "#RRGGBB"
}
```

Validation rules:
- `tagName`: alphanumeric and dot (`.`) only.
- `tagName`: unique per user with case-insensitive comparison.
- `color`: strict `#RRGGBB`.

## TagUpdate

```json
{
  "tagName": "string (optional)",
  "description": "string (optional)",
  "color": "#RRGGBB (optional)"
}
```

## Tag

```json
{
  "id": "string",
  "tagName": "string",
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

## Collection Query Changes

Existing item listing query extends with:

- `tags`: repeated or array form of selected tag values.
- `tagFilterMode`: `all` (default, AND) or `any` (OR).

Behavior:
- `tagFilterMode=all`: item must contain all selected tags.
- `tagFilterMode=any`: item must contain at least one selected tag.
- All selected tags must belong to the authenticated user.

## Item Write Contract Constraint

For item create/update payloads:

- Every value in `tags` must exist as a tag owned by the authenticated user.
- Unknown or non-owned tags return validation failure.

## Endpoints

## GET /tags

- Auth required.
- Query parameters: `limit`, `skip`, `search`, `sort`.
- Search is case-insensitive over `tagName` and description.
- Response: `200 OK` with `TagList`.

## POST /tags

- Auth required.
- Body: `TagInput`.
- Response: `201 Created` with `Tag`.
- Duplicate case-insensitive `tagName` for same user: `409 Conflict`.

## GET /tags/:id

- Auth required.
- Returns the owned tag.
- Cross-user access: `403 Forbidden` or `404 Not Found`.

## PATCH /tags/:id

- Auth required.
- Body: `TagUpdate`.
- Renaming preserves existing item associations.
- Response: `200 OK` with updated `Tag`.

## DELETE /tags/:id

- Auth required.
- Deletes owned tag.
- Cascades removal of deleted tag from all owned items.
- Response: `204 No Content`.

## PATCH /tags/:id/reorder

- Auth required.
- Body: `{ "order": number }`.
- Reorders owned tags similarly to item reorder semantics.
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

- Shared Zod schemas and exported types must be defined in `packages/contracts` first.
- API controllers remain transport-only; services enforce ownership, uniqueness, association, and cascade rules.
- Repositories are the only layer that accesses MongoDB.
