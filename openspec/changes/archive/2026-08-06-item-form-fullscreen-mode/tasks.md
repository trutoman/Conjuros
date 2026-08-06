## 1. Refactor CollectionPage rendering structure

- [x] 1.1 Move ItemForm rendering from below `.app-shell-body` into `.main-content-frame`
- [x] 1.2 Update conditional rendering to show either full collection view (subheader + list) OR only form based on `formItem` state
- [x] 1.3 Ensure subheader is hidden when form is active (only visible in collection view mode)

## 2. Update CSS for full-frame form layout

- [x] 2.1 Remove or adjust `margin-top` from `.item-form` to eliminate spacing for inline layout
- [x] 2.2 Update `.item-form` styles to fill entire `.main-content-frame` space
- [x] 2.3 Verify form scrolling behavior on small viewports

## 3. Test all scenarios

- [x] 3.1 Test clicking Add Item button hides subheader and shows form occupying full frame
- [x] 3.2 Test clicking Edit on an item hides subheader and shows form with item data
- [x] 3.3 Test saving a new item returns to full collection view (subheader + list visible)
- [x] 3.4 Test saving an edited item returns to full collection view (subheader + list visible)
- [x] 3.5 Test canceling returns to full collection view without changes
- [x] 3.6 Verify subheader and collection list are both hidden when form is shown
- [x] 3.7 Run existing tests to ensure no regressions
