## Context

`Sidebar` receives `categories: string[]` already in `order` sequence and builds groups in an object, then sorts names alphabetically.

## Decisions

- Keep the `string[]` prop; derive the order from the array index of each (lowercased, de-duplicated) name. Names not in the array sort after, alphabetically. This avoids a prop/contract change.
- Tag sorting within groups is unchanged.

## Risks

- Relies on callers passing categories ordered; documented by a test and by the existing `sort: 'order'` query.
