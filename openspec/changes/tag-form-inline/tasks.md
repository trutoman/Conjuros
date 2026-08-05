## 1. Add inline tag form state to CollectionPage

- [x] 1.1 Add `formTag` state (`undefined` | `null` | `Tag`) in `CollectionPage`, mirroring the existing `formItem` state
- [x] 1.2 Add a `saveTag(input)` handler using `tagsState.create` / `tagsState.update` that closes the form on success and surfaces errors on failure
- [x] 1.3 Update the `.main-content-frame` condition to render `TagForm` when `formTag !== undefined`, then `ItemForm` when `formItem !== undefined`, otherwise the collection view (subheader + list)
- [x] 1.4 Ensure opening the tag form resets `formItem` (and vice versa) so only one frame form is active at a time

## 2. Surface inline tag actions in the sidebar

- [x] 2.1 Add an inline "Add tag" entry in the sidebar that opens the tag form (`formTag = null`) in the main frame
- [x] 2.2 Add an explicit per-tag edit affordance in the sidebar (separate from the filter checkbox) that opens the tag edit form (`formTag = tag`)
- [x] 2.3 Keep the "Manage tags" button navigating to the standalone `TagsPage`

## 3. Verify layout

- [x] 3.1 Confirm `TagForm` fills the `.main-content-frame` (it already uses `.item-form` shared styles; adjust `CollectionPage.css` only if needed)
- [x] 3.2 Confirm the search box/filters return in their original position after Save or Cancel

## 4. Test all scenarios

- [x] 4.1 Test inline add tag hides subheader and collection list and shows the form as the sole frame content
- [x] 4.2 Test inline edit tag pre-fills the form with the tag's current values
- [x] 4.3 Test saving a new/edited tag returns to the full collection view (subheader + list visible)
- [x] 4.4 Test canceling the tag form returns to the collection view without saving
- [x] 4.5 Test opening the item form and the tag form are mutually exclusive (no overlap)
- [x] 4.6 Run existing frontend tests to ensure no regressions