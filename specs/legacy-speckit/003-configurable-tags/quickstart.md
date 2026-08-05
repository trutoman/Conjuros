# Quickstart: Validate User Configurable Tags

Use this guide to validate the feature end-to-end against [contracts/configurable-tags-api.md](contracts/configurable-tags-api.md) and [data-model.md](data-model.md).

## Prerequisites

- Local environment is running (`docker compose up -d`, `.env` configured, `npm run dev`).
- Two test users available (User A and User B) to verify ownership boundaries.
- Browser session can sign in and switch between users.

## Scenario 1: Tag CRUD and validation

1. Sign in as User A.
2. Create a tag with:
   - `tagName`: `work.todo`
   - `description`: `Tasks for current sprint`
   - `color`: `#1A73E8`
3. Verify tag appears in User A tag list.
4. Attempt to create `Work.Todo` for User A.
   - Expected: conflict due to case-insensitive uniqueness.
5. Attempt to create `work-tag` or `work todo`.
   - Expected: validation error because only alphanumeric and `.` are allowed.
6. Attempt to create with `color: blue`.
   - Expected: validation error because only `#RRGGBB` is accepted.

## Scenario 2: Ownership boundaries

1. Keep tag created by User A.
2. Sign in as User B.
3. Attempt to read, update, or delete User A tag via direct API path.
   - Expected: `403` or `404`; no tag details leaked.
4. Attempt to use User A tag value when creating/updating User B item.
   - Expected: validation failure because tag is not owned by User B.

## Scenario 3: Item association and rename stability

1. As User A, create one spell and one web-link.
2. Assign `work.todo` to both items.
3. Rename tag display name to `Work.Todo` (same logical normalized value) or another valid unique name.
4. Reload collection list.
   - Expected: both items remain associated to the same logical tag after rename.

## Scenario 4: Filter and search behavior

1. Create at least 3 tags and attach combinations across at least 6 items.
2. Search tags by partial text with different letter casing.
   - Expected: case-insensitive matches only for User A tags.
3. Filter items with two selected tags in default mode.
   - Expected: only items containing all selected tags (AND).
4. Switch to `any` mode.
   - Expected: items containing any selected tag (OR).

## Scenario 5: Cascade delete

1. As User A, ensure at least 3 items contain tag `work.todo`.
2. Delete tag `work.todo`.
3. Reload items list and inspect each previously tagged item.
   - Expected: tag removed from all affected items in operation outcome.
4. Verify other tags on those items remain unchanged.

## Validation Commands

```sh
npm run test
npm run check
```

Expected:
- Tests include tag CRUD, validation errors, ownership boundaries, filter modes, and cascade deletion behavior.
- Full check passes without unresolved TypeScript, lint, or test failures.
