## 1. Menu entry

- [x] 1.1 Add an optional `onThemeEditor` callback to `UserWidget` and render a "Theme editor" menu item between "Theme selector" and "Sign out" only when the callback is provided
- [x] 1.2 Close the menu when "Theme editor" is activated, then call the callback
- [x] 1.3 In `CollectionPage`, pass `onThemeEditor={role === 'admin' ? openManageThemes : undefined}` to `UserWidget`

## 2. Sidebar cleanup

- [x] 2.1 Remove the `onManageThemes` prop and the "Themes" button from `Sidebar`
- [x] 2.2 Remove the `onManageThemes` prop passed from `CollectionPage`

## 3. Theme list simplification

- [x] 3.1 In `ThemeListView`, remove the color swatch span and the internal theme name line, keeping the label
- [x] 3.2 Move the default marker into its own element next to the label so it stays visible
- [x] 3.3 Keep the Activate, Edit, Delete actions and the "Add theme" control unchanged
- [x] 3.4 Remove the unused `.theme-list-preview` and `.theme-list-name` styles from `index.css` if nothing else uses them

## 4. Tests

- [x] 4.1 Update `UserWidget` tests: "Theme editor" appears when the callback is provided, is absent otherwise, and activation closes the menu and calls the callback
- [x] 4.2 Update `CollectionPage.themes.test.tsx` so the modal opens through the user menu as an administrator instead of the sidebar button
- [x] 4.3 Assert the sidebar footer no longer shows a theme control for either role
- [x] 4.4 Assert the theme list shows the label and the default marker, and no color swatch or internal name

## 5. Verification

- [x] 5.1 Run `npm run check` and resolve all failures
