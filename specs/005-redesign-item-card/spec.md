# Feature Specification: Redesigned Item Card Layout

**Feature Branch**: `005-redesign-item-card`

**Created**: 2026-07-29

**Status**: Draft

**Input**: User description: "Refine the item card layout so it uses a compact two-row presentation, makes item type and title clearer, keeps tags compact and aligned, and improves the placement and clarity of copy, edit, delete, reorder, and theme controls."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Scan collection items quickly (Priority: P1)

As an authenticated user, I can understand what each collection item is and what it contains at a glance, so I can move through my collection without visual clutter.

**Why this priority**: The card layout is the primary way users interact with the collection and needs to be clear immediately.

**Independent Test**: A user can view a spell and a web link side by side and tell what each item is, what its value is, and where its actions are.

**Acceptance Scenarios**:

1. **Given** a user views a spell item, **When** they inspect the card, **Then** the card clearly shows that the item is a spell and presents its value in a readable, distinct area.
2. **Given** a user views a web link item, **When** they inspect the card, **Then** the card clearly shows that the item is a web link and presents its URL in a readable, distinct area.
3. **Given** a user views a card with multiple tags, **When** they scan the header row, **Then** the title and tags remain legible and visually balanced while keeping the tag row on a single line with overflow handling.

---

### User Story 2 - Use item actions confidently (Priority: P1)

As an authenticated user, I can copy, edit, delete, and reorder items without confusion, so I can manage my collection efficiently.

**Why this priority**: Core collection workflows depend on these actions being easy to find and understand.

**Independent Test**: A user can locate the primary actions on a card and successfully perform copy, edit, delete, and reorder tasks.

**Acceptance Scenarios**:

1. **Given** a user is viewing an item card, **When** they look for actions, **Then** the relevant controls are visible, aligned, and easy to identify.
2. **Given** a user copies an item value, **When** the action completes, **Then** the interface provides a clear success or failure indication.
3. **Given** a user chooses to open a web link, **When** they trigger the action, **Then** the link opens only after explicit user interaction.
4. **Given** a user wants to reorder items, **When** they use the dedicated controls, **Then** the controls are available in a predictable location outside the item card.

---

### User Story 3 - Adjust appearance and tags without losing clarity (Priority: P2)

As an authenticated user, I can switch between light and dark appearance modes and see tags presented in a compact, readable way, so the interface stays comfortable and easy to scan.

**Why this priority**: Visual comfort and tag readability improve the overall experience, but the core collection value still depends on the two-row card layout and actions.

**Independent Test**: A user changes the appearance mode and sees the tag area remain compact and clear without breaking the card layout.

**Acceptance Scenarios**:

1. **Given** a user opens the collection, **When** they use the theme selector, **Then** they can switch between light and dark modes from the current location in the interface.
2. **Given** a user views tags on an item, **When** they inspect the tag area, **Then** the tags appear in a compact row with clear spacing and visible selection state.
3. **Given** a user switches themes, **When** they continue using the collection, **Then** the layout remains readable and consistent in both supported modes.

### Edge Cases

- The user has a very long command or URL; the content stays readable and can still be copied in full.
- The user has many tags on a single item; the tag area remains compact and does not overwhelm the card, using single-line overflow handling rather than wrapping to a new line.
- The user relies on keyboard navigation; controls remain discoverable and usable without relying on hover alone.
- The appearance preference is missing or unavailable; the interface still loads with a sensible default.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The collection MUST present each item in a compact two-row card layout.
- **FR-002**: The first row MUST show the item type indicator, the item title, and the associated tags in a clear and aligned arrangement.
- **FR-003**: The second row MUST show the item value in a code-style presentation while keeping the action buttons aligned on the right.
- **FR-004**: The interface MUST visually distinguish spells from web links in a way that is easy to scan.
- **FR-005**: The interface MUST provide visible copy, edit, delete, and reorder controls for each item.
- **FR-006**: Copy actions MUST provide clear success or failure feedback.
- **FR-007**: Web-link actions MUST require explicit user interaction before opening a link.
- **FR-008**: Tag controls MUST appear in a compact horizontal arrangement on a single line with clear spacing, visible selection state, and overflow handling that preserves the two-row card layout.
- **FR-009**: The appearance selector MUST provide accessible light and dark mode controls in the current interface position.
- **FR-010**: The interface MUST preserve readable contrast, spacing, and hierarchy in both light and dark modes.
- **FR-011**: All interactive controls MUST remain usable through keyboard navigation and provide clear focus states.

### Key Entities _(include if feature involves data)_

- **Collection Item**: A spell or web link shown in the collection with a title, value, tags, and actions.
- **Item Type**: The category of an item, such as spell or web link, used to present the appropriate visual treatment.
- **Tag**: A label associated with an item, shown in a compact horizontal arrangement with visible state.
- **Theme Preference**: The selected light or dark appearance mode for the current user.
- **Interaction Feedback**: The visible confirmation or failure state shown after an action completes.

## Constitution Alignment _(mandatory)_

- The feature MUST preserve the product's focus on fast retrieval, copy/open actions, and clear search and ordering.
- The feature MUST keep the collection accessible and keyboard-friendly for all item actions.
- The feature MUST not weaken ownership or privacy boundaries already enforced elsewhere in the product.
- The feature MUST include risk-proportionate tests for card layout, item actions, theme selection, tag presentation, and interaction feedback.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: At least 95% of test users can identify whether an item is a spell or a web link within 2 seconds of viewing the card.
- **SC-002**: At least 95% of test users can find the primary item value and action controls within 3 seconds of viewing the card.
- **SC-003**: 100% of successful copy actions produce a visible confirmation state.
- **SC-004**: 100% of failed copy actions produce a visible failure state.
- **SC-005**: 100% of web-link actions require explicit user interaction before the link opens.
- **SC-006**: In acceptance testing, 100% of tags shown on item cards remain visible and readable in both supported themes.

## Assumptions

- The collection view already contains items of both supported types and existing actions for copy, edit, delete, and reorder.
- The product already has an authenticated user context and a visible place for appearance controls in the current interface.
- The UI refresh is scoped to the collection experience and related actions; it does not change the underlying ownership or persistence rules.
- Tag metadata and theme preference data are already available to the interface when rendering the collection.
