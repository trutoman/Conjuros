## Context

See proposal.md - Why. The tag management header currently renders the "Add tag" control as a plain text button placed after the search box inside `.tag-management-actions`, while the collection subheader's "Add item" button is an icon button (`.add-item-button`, `ThemeIcon name="add"`) positioned first in a flex row. See `src/web/pages/CollectionPage.tsx` (lines ~318-351) and `src/web/index.css` (`.tag-management-header`, `.tag-management-actions`).

## Goals / Non-Goals

**Goals:**
- Render the tag management "Add tag" control as an icon button using the same `ThemeIcon name="add"` as the Add item button.
- Reorder the tag management header so the button appears leftmost, followed by the "Manage tags" heading, then the tag search box.
- Keep the control keyboard-focusable and accessible (announced as the add-tag action).

**Non-Goals:**
- Changing the "Add theme" button in the theme management header (out of scope).
- Any backend/domain change; this is presentation only.
- Altering tag search behavior or validation.

## Decisions

- **Reuse the Add item icon button pattern**: Apply the `add-item-button` visual style and the `ThemeIcon name="add"` icon to the tag management "Add tag" control, keeping a single source of truth for the create action's look. Alternative (new dedicated class + new icon) rejected as duplicate work.
- **DOM order drives left alignment**: Instead of relying on `justify-content`, restructure the header DOM so the button comes first, then the heading, then the search field. The header remains a flex container; explicit DOM order means the leftmost position follows structure, not sorting. This is the same pattern used by `.collection-subheader` where the add button precedes the search field.
- **Accessible label**: The control keeps an `aria-label`/`title` naming the add-tag action since the visual `+` icon is not self-describing to assistive tech. The "Manage tags" heading remains the sole heading and the search box keeps its `aria-label="Search tags"`.

## Risks / Trade-offs

- [Moving the heading after the button changes reading order] → The spec (see specs delta) and a11y test assert the new order; the search box and heading keep explicit roles/labels so screen-reader navigation stays unambiguous.
- [Reusing `.add-item-button` styling inside the tag management header] → The existing rule is scoped to `.collection-subheader .add-item-button`; a matching rule (or a shared pattern) must be added for the tag management header so the icon sizing/aspect-ratio applies. Low risk, covered by a unit test.
