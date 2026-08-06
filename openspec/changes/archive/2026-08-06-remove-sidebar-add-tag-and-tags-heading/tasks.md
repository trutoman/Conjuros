## 1. Remove the sidebar footer "Add tag" button

- [x] 1.1 Remove the `onAddTag` prop from the `Sidebar` props type in `src/web/components/Sidebar.tsx`
- [x] 1.2 Remove the `onAddTag` destructured prop and the conditional button block from the sidebar footer, leaving only the "Manage tags" button

## 2. Remove the inline tag creation flow in CollectionPage

- [x] 2.1 Remove the `onAddTag={() => openTagForm(null)}` prop pass to `Sidebar` in `src/web/pages/CollectionPage.tsx`
- [x] 2.2 Remove the now-unused `openTagForm` helper function (only served the sidebar button); keep `openTagFormInManage` used by the tag management header
- [x] 2.3 Remove the now-unreachable inline (non-manage) `formTag !== undefined` branch in the main content frame, so the tag form renders only inside the tag management view

## 3. Remove the "Tags" heading from the tags panel

- [x] 3.1 Remove the `<h2>Tags</h2>` heading from the `.tag-panel` section in `src/web/components/TagList.tsx`, leaving the "Manage tags" heading in the tag management header as the only title

## 4. Update tests

- [x] 4.1 Delete `src/web/pages/__tests__/CollectionPage.inlineTag.test.tsx`, which covers the removed sidebar add-tag inline flow
- [x] 4.2 Verify remaining tag-management and manage-view tests still query the "Add tag" button inside the tag management view only

## 5. Validation

- [x] 5.1 Run `npm run check` and confirm lint, tests, and build pass
