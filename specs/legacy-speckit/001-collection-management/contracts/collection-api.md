# Collection API Contracts

## Shared Types

### CollectionItemInput

```json
{
  "kind": "spell | web-link",
  "title": "string",
  "description": "string",
  "tags": ["string"],
  "relatedItemIds": ["string"],
  "command": "string (required for spell)",
  "url": "string (required for web-link, absolute http/https)"
}
```

### CollectionItem

```json
{
  "id": "string",
  "ownerId": "string",
  "kind": "spell | web-link",
  "title": "string",
  "description": "string",
  "tags": ["string"],
  "order": 1,
  "relatedItemIds": ["string"],
  "command": "string | null",
  "url": "string | null",
  "createdAt": "string",
  "updatedAt": "string"
}
```

## Endpoints

### GET /items

- Auth required.
- Returns a paginated list of the authenticated user’s items.
- Query parameters: `limit`, `skip`, `search`, `kind`, `tag`, `sort`.
- Response: `200 OK` with `{ "items": [CollectionItem], "total": 1 }`.

### POST /items

- Auth required.
- Accepts a `CollectionItemInput`.
- Validates ownership-safe payloads and returns `201 Created` on success.
- Validation failures return `400 Bad Request`.

### GET /items/:id

- Auth required.
- Returns one specific item if it belongs to the authenticated user.
- Cross-user access returns `403 Forbidden` or `404 Not Found`.

### PATCH /items/:id

- Auth required.
- Updates an existing item owned by the authenticated user.
- Returns `200 OK` with the updated item.
- Invalid data returns `400 Bad Request`; unauthorized access returns `403 Forbidden` or `404 Not Found`.

### DELETE /items/:id

- Auth required.
- Removes an owned item.
- Returns `204 No Content` on success.

### PATCH /items/:id/reorder

- Auth required.
- Accepts `{ "order": number }` or a reorder payload that updates the item position.
- Returns `200 OK` with the updated item.

## Error Shapes

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

- The API must validate inputs with Zod at the boundary.
- The web client should consume these shared schemas through `packages/contracts`.
- All list endpoints must support pagination and not expose another user’s data.