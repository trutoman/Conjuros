## Why

The tags sidebar sorts category groups alphabetically, ignoring the order users set in Manage tags. The two views disagree, which makes the category ordering feature feel broken.

## What Changes

- The sidebar lists category groups in the persisted tag category `order` (lowest first), matching the Manage tags panel.
- Categories derived only from tags (no category record) are listed after ordered categories, alphabetically.
- Tags inside each category stay sorted alphabetically.
- No API or contract changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `collection-layout-and-navigation`: the tags sidebar orders category groups by the persisted category order.

## Impact

- `src/web/components/Sidebar.tsx` (grouping/sort logic) and `src/web/components/__tests__/Sidebar.test.tsx`.
- `CollectionPage` already passes categories in `order` sequence (`useTagCategories` requests `sort: 'order'`), so no wiring change is expected.
