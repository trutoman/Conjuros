# Data Model: Item Collection UI Refresh

## Theme Preference

- **Purpose**: Store the authenticated user's selected visual theme.
- **Fields**:
  - `userId`: unique owner reference.
  - `theme`: `light` or `dark`.
  - `updatedAt`: last change timestamp.
- **Relationships**: One theme preference per authenticated user.
- **Validation Rules**:
  - Only supported theme values are allowed.
  - A missing preference falls back to the default theme.
- **State Transitions**:
  - `unset` → `default applied`
  - `default applied` → `saved preference`
  - `saved preference` → `updated preference`

## Collection Card View State

- **Purpose**: Represent how an item appears on screen while the user scans and acts on it.
- **Fields**:
  - `itemId`
  - `kind` (`spell` or `web-link`)
  - `title`
  - `bodyValue` (command or URL)
  - `tags`
  - `hovered`
  - `focused`
  - `copyStatus` (`idle`, `success`, `failure`)
- **Relationships**: Each card view belongs to one collection item and may reference zero or more tags.
- **Validation Rules**:
  - The card must always show the correct item kind.
  - The body value must remain readable and copyable in full.
  - Web links must only open after direct user action.
- **State Transitions**:
  - `idle` → `hovered` or `focused`
  - `idle` → `copyStatus: success` or `copyStatus: failure`
  - `hovered`/`focused` → `idle`

## Tag Display State

- **Purpose**: Show the selected tag color consistently in edit and item views.
- **Fields**:
  - `tagId`
  - `label`
  - `color`
  - `swatchVisible`
  - `textColorApplied`
- **Relationships**: Each visible tag display maps to one saved tag record.
- **Validation Rules**:
  - Color must remain readable against the current theme.
  - A tag without a valid color must still render safely.
- **State Transitions**:
  - `editing` → `saved`
  - `saved` → `displayed in item`
  - `displayed in item` → `editing`

## Interaction Feedback

- **Purpose**: Capture short-lived user feedback after action completion.
- **Fields**:
  - `message`
  - `type` (`success` or `failure`)
  - `visibleForMs`
- **Relationships**: Feedback is attached to the active card or form context.
- **Validation Rules**:
  - Every copy attempt must resolve to success or failure feedback.
  - Failures must not be silent.
