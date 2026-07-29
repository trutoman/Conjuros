# Feature Specification: Item Collection UI Refresh

**Feature Branch**: `004-mejora-ui`

**Created**: 2026-07-29

**Status**: Draft

**Input**: User description: "Improve the collection interface with a clear theme selector, consistent visual treatment for cards, code blocks, and tags, and subtle interaction feedback for copy, edit, delete, and open actions."

## Clarifications

### Session 2026-07-29

- Q: Should the selected theme be saved per authenticated user or only per browser profile? → A: Per authenticated user, synced across devices.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Use a consistent visual theme (Priority: P1)

As an authenticated user, I can choose a light or dark theme and keep using the interface in a visually consistent way, so the collection feels readable and intentional.

**Why this priority**: A clear theme is the base for the rest of the interface refresh.

**Independent Test**: A user switches themes, reloads the page, and sees the selected theme persist.

**Acceptance Scenarios**:

1. **Given** a user opens the collection for the first time, **When** the page loads, **Then** the interface uses the default theme.
2. **Given** a user changes the theme from light to dark or dark to light, **When** they navigate within the app, reload the page, or sign in on another device, **Then** the chosen theme remains active for that user.
3. **Given** a user views the collection in either theme, **When** they inspect cards, buttons, and text, **Then** the interface keeps a coherent contrast and hierarchy that supports reading and scanning.

---

### User Story 2 - Recognize and act on collection items quickly (Priority: P1)

As an authenticated user, I can immediately distinguish spells from web links and use clear actions for copy, open, edit, and delete, so I can work faster with less visual noise.

**Why this priority**: The core value of the collection is fast day-to-day item handling.

**Independent Test**: A user can identify the item type, copy the underlying value, open a web link, and access edit/delete actions without ambiguity.

**Acceptance Scenarios**:

1. **Given** a user sees a spell item, **When** they inspect the item card, **Then** the card clearly indicates that the item is a spell and presents its command in a readable code-style block.
2. **Given** a user sees a web-link item, **When** they inspect the item card, **Then** the card clearly indicates that the item is a web link and presents its URL in a readable code-style block.
3. **Given** a user wants to copy a command or URL, **When** they activate the copy action, **Then** the interface confirms whether the copy succeeded or failed.
4. **Given** a user views a web-link item, **When** they activate the open action, **Then** the link opens only after the explicit user action.
5. **Given** a user is not interacting with a card directly, **When** the collection is displayed, **Then** edit and delete actions are visually de-emphasized until the user hovers or focuses the card.

---

### User Story 3 - Use colors to understand tags (Priority: P2)

As an authenticated user, I can assign a color to each tag and see that color reflected wherever the tag appears, so tags are easier to recognize at a glance.

**Why this priority**: Tag colors improve scanning and recognition across the collection.

**Independent Test**: A user assigns a color to a tag, saves it, and later sees the same color in tag editing and item views.

**Acceptance Scenarios**:

1. **Given** a user edits a tag, **When** they choose a color, **Then** the selected color is visible next to the tag during editing.
2. **Given** a user views an item with tags, **When** the tags are displayed, **Then** each tag text appears in its assigned color.
3. **Given** a tag has no valid color available, **When** it is shown in the interface, **Then** the tag still remains visible with a safe fallback presentation.

---

### User Story 4 - Receive immediate interaction feedback (Priority: P2)

As an authenticated user, I get clear feedback when I interact with collection actions, so I know whether the interface accepted my request.

**Why this priority**: Subtle feedback prevents uncertainty during repetitive workflows.

**Independent Test**: A user performs copy, edit, delete, and theme actions and can tell from the interface whether the action was applied.

**Acceptance Scenarios**:

1. **Given** a user copies a value, **When** the action completes, **Then** the interface shows a brief success cue.
2. **Given** a user attempts a copy action and it fails, **When** the failure is detected, **Then** the interface shows a brief failure cue.
3. **Given** a user uses keyboard navigation, **When** they move through buttons and cards, **Then** the active controls are clearly visible and usable without a mouse.

### Edge Cases

- The user has a very long command or URL; the content remains readable and can still be copied in full.
- The user has many tags on an item; the tag presentation remains legible without overwhelming the card.
- The theme preference is missing or cannot be read; the interface still loads with a sensible default.
- A tag color is too close to the background in one theme; the interface still preserves sufficient readability.
- The user relies on keyboard navigation only; hover-dependent affordances remain discoverable through focus states.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The interface MUST provide a user-visible control for switching between light and dark themes.
- **FR-002**: The interface MUST remember the authenticated user's selected theme across page reloads and future visits, including when they sign in on another device.
- **FR-003**: The interface MUST use a sensible default theme when no preference has been saved.
- **FR-004**: Collection cards MUST present a clear visual hierarchy, including a distinct title area, item body, and actions area.
- **FR-005**: Each item card MUST visually distinguish spells from web links in a way that is easy to scan.
- **FR-006**: Commands and URLs MUST be shown in a code-style presentation that supports copying the full value.
- **FR-007**: Copy actions MUST provide immediate success or failure feedback.
- **FR-008**: Web links MUST only open after an explicit user action.
- **FR-009**: Secondary actions such as edit and delete MUST be visually de-emphasized until the user interacts with the card.
- **FR-010**: Tag editing MUST show the selected color alongside the tag.
- **FR-011**: Tags displayed on collection items MUST use their assigned color in the visible text treatment.
- **FR-012**: All interactive controls MUST provide clear hover, focus, and active states.
- **FR-013**: The interface MUST remain usable through keyboard navigation without relying on hover alone.
- **FR-014**: The interface MUST preserve readable contrast and spacing for cards, code blocks, and tags in both supported themes.

### Key Entities *(include if feature involves data)*

- **Theme Preference**: The saved visual mode selected by a user.
- **Collection Card**: The visual container that presents one spell or web link.
- **Tag Color**: The color associated with a tag and shown wherever the tag appears.
- **Interaction Feedback**: The short success or failure cue shown after user actions.

### Constitution Alignment *(mandatory)*

- The feature MUST preserve the app's focus on fast retrieval and quick actions for private collection items.
- The feature MUST keep accessibility and keyboard usability intact for all item actions.
- The feature MUST not weaken ownership or privacy boundaries already enforced elsewhere in the product.
- The feature MUST provide risk-proportionate tests for theme behavior, item actions, tag color visibility, and interaction feedback.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 95% of test users can identify whether an item is a spell or a web link within 2 seconds of viewing a card.
- **SC-002**: 100% of tested users can switch themes and see the selected theme remain active after a page reload.
- **SC-003**: 100% of successful copy actions produce a visible confirmation message or indicator.
- **SC-004**: 100% of failed copy actions produce a visible failure message or indicator.
- **SC-005**: At least 95% of tested users can locate edit and delete actions without confusion, including when using keyboard navigation.
- **SC-006**: In acceptance testing, 100% of tags shown on item cards display a visible color treatment that matches the saved tag color.
- **SC-007**: In acceptance testing, 100% of web-link actions require an explicit user interaction before opening a new page or tab.

## Assumptions

- The application already has authenticated users and an existing collection view to which the UI refresh applies.
- The light theme is the default when no saved preference exists.
- Theme preference is stored per authenticated user in the database as a new attribute for every user that survives reloads and sign-ins on other devices.
- Tag color values are already available when tags are edited or displayed.
- The UI refresh is limited to the collection experience and related actions; it does not change the underlying ownership, search, or persistence rules.
