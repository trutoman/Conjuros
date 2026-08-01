# Quickstart: Validate Tag Categories

Use this guide to validate the feature end-to-end against [contracts/tag-categories-api.md](contracts/tag-categories-api.md) and [data-model.md](data-model.md).

## Prerequisites

- Local environment is running (`docker compose up -d`, environment configured, `npm run dev`).
- Two test users are available (User A and User B) to validate ownership boundaries.
- The tags management page is reachable from the main collection flow.

## Scenario 1: Required category on create and edit

1. Sign in as User A and open the tags page.
2. Start creating a tag.
3. Enter a valid tag name and color but leave category empty.
   - Expected: validation prevents saving.
4. Enter category `Work` and save.
   - Expected: tag is created successfully and shows category `Work` in the tags list.
5. Edit the same tag and change category to `Operations`.
   - Expected: the updated category is shown after save.

## Scenario 2: Duplicate detection uses name plus category

1. As User A, create tag `deploy.todo` in category `Work`.
2. Create another tag `deploy.todo` in category `Personal`.
   - Expected: creation succeeds because the category differs.
3. Attempt to create or edit a tag to `Deploy.Todo` in category ` work `.
   - Expected: conflict because the normalized pair matches the existing `deploy.todo` + `Work` combination.

## Scenario 3: Categories stay implicit and disappear when unused

1. As User A, create two tags in category `Projects`.
2. Confirm there is no standalone control to create or manage categories outside tag create and edit flows.
3. Reassign one tag to category `Archive` and delete the other `Projects` tag.
   - Expected: no remaining tag is displayed with category `Projects`.
4. Create a new tag in category `Projects`.
   - Expected: the category is available again only through that new tag.

## Scenario 4: Ownership boundaries remain intact

1. Keep User A tags in place.
2. Sign in as User B.
3. Attempt to read, update, reorder, or delete User A tags through direct requests.
   - Expected: `403` or `404`; no cross-user category data is revealed.
4. Attempt to use User A tag names when creating or updating a User B item.
   - Expected: validation failure because tags must belong to the current user.

## Scenario 5: Legacy compatibility with default category

1. Prepare or identify an existing tag record created before categories were required.
2. Load the tags page or fetch the owned tag through the API after the migration/backfill step.
   - Expected: the tag appears with category `General`.
3. Edit and save that tag without changing the category.
   - Expected: the tag remains valid and keeps category `General` unless the user changes it.

## Scenario 6: Delete behavior and item cleanup

1. As User A, attach tag `deploy.todo` to at least two items.
2. Delete tag `deploy.todo`.
3. Reload the affected items.
   - Expected: the deleted tag name is removed from all affected items.
4. If that tag was the last member of its category, verify no remaining tag displays that category.

## Focused Validation Commands

```sh
npm test -- src/tests/api/tags.test.ts
npm test -- src/web/components/__tests__/TagForm.test.tsx
npm run check
```

Expected:
- API tests cover required category input, duplicate normalized name-category pairs, owner isolation, and delete behavior.
- Frontend tests cover required category input and visible category-related form behavior.
- Full check passes without unresolved lint, test, or build failures.
