# Data Model: Redesigned Item Card Layout

## Entities

### Collection Item

- Represents a spell or web-link displayed in the collection.
- Existing fields remain sufficient for the redesign: `id`, `kind`, `title`, `description`, `tags`, `command`, `url`, `order`, `relatedItemIds`, and timestamps.
- No new persisted fields are required for the visual refresh.

### Tag

- Represents the user-owned tag metadata already available to the UI.
- Existing fields remain sufficient: `id`, `tagName`, `description`, `color`, `order`, and timestamps.
- The redesign will make the tag presentation more compact and consistent but will not change the tag domain model.

### Theme Preference

- Represents the current light/dark appearance selection for the authenticated user.
- Already supported by the existing `useThemePreference` hook and the `data-theme` root attribute.
- The redesign will preserve and visually reinforce the existing preference state.

## Relationships

- A collection item may have zero or more tag references.
- Each tag is displayed in the item card header and remains associated with the same item data model.
- Theme preference is independent of item content and is applied globally to the page shell.

## Validation Rules

- Item cards must continue to render valid spells and web links without changing the underlying data validation behavior.
- Tags must remain visible even when the item has many tags; the new layout must keep them in a single line with overflow handling.
- Theme selection must continue to use the existing `light` and `dark` values.
