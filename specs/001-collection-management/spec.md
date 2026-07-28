# Feature Specification: Private Collection Management

**Feature Branch**: `001-collection-management`

**Created**: 2026-07-28

**Status**: Draft

**Input**: User description: "Conjuros is a personal web application for saving, organizing, and finding command shortcuts and related web links..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and act on a personal collection (Priority: P1)

A signed-in user can sign in with email and password, open their collection, and quickly find the right spell or web link, review its details, and copy or open it without friction.

**Why this priority**: This is the core value of the product and the fastest path to a useful first experience.

**Independent Test**: A user can sign in, view their collection, find one item, and copy or open it successfully.

**Acceptance Scenarios**:

1. **Given** a signed-in user has one or more collection items, **When** they open the collection view, **Then** they see only their own items in a clear mixed list.
2. **Given** the user has items with different content types, **When** they select an item, **Then** they can copy the exact stored command or URL and receive clear feedback about success or failure.
3. **Given** the user wants to find a specific item, **When** they use search and filters, **Then** the list updates to show only matching items.

---

### User Story 2 - Create, edit, and remove collection items (Priority: P2)

A signed-in user can create a spell or web link, edit its content and tags, and remove it when it is no longer needed.

**Why this priority**: Item management is essential for keeping the collection accurate and useful over time.

**Independent Test**: A user can create a new item, edit it, and delete it without affecting other users' items.

**Acceptance Scenarios**:

1. **Given** a signed-in user is in edit mode, **When** they create a new spell with a title, command, description, and tags, **Then** the item is saved and appears in their collection.
2. **Given** a signed-in user has an existing item, **When** they edit its title, content, tags, or related information, **Then** the updated values are saved and shown in the collection.
3. **Given** a user attempts to delete an item, **When** they confirm the action, **Then** the item is removed from their collection and no longer appears in search results.

---

### User Story 3 - Reorder and organize the collection (Priority: P2)

A signed-in user can reorder items, keep the order persistent, and use filters to focus on a subset of the collection.

**Why this priority**: Reordering and filtering make the collection easier to maintain as it grows.

**Independent Test**: A user can move an item to a new position and later reload the view to see the same order.

**Acceptance Scenarios**:

1. **Given** a signed-in user has multiple items, **When** they reorder them using drag and drop or keyboard controls, **Then** the new order is saved and shown consistently.
2. **Given** a signed-in user has items with different tags and types, **When** they apply filters, **Then** the visible results match the selected criteria.
3. **Given** the user leaves and returns to the collection, **When** they reload the view, **Then** their current filters and the saved order remain available.

---

### Edge Cases

- What happens when a user tries to access another user's item by direct action or URL?
- How does the system handle invalid input such as missing command text, malformed URLs, or duplicate tag values?
- What happens when clipboard access is denied or a link cannot be opened?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow a user to sign in with email and password and maintain a secure authenticated session.
- **FR-002**: The system MUST allow a signed-in user to view a private collection containing only their own spells and web links.
- **FR-003**: The system MUST allow users to create, read, update, and delete spells and web links from their collection.
- **FR-004**: The system MUST preserve the exact stored text of a spell command and allow it to be copied to the clipboard with visible success or failure feedback.
- **FR-005**: The system MUST allow a user to copy a web-link URL and open it only after an explicit user action.
- **FR-006**: The system MUST support searching by title, description, tags, command text, and URL content.
- **FR-007**: The system MUST support filtering by item type, tags, and other meaningful collection dimensions in a predictable way.
- **FR-008**: The system MUST allow users to reorder items and persist the chosen order for later visits.
- **FR-009**: The system MUST provide an edit experience where users can modify item content, tags, and related information in a dedicated view or panel.
- **FR-010**: The system MUST validate item input and reject invalid values with clear feedback before saving.
- **FR-011**: The system MUST prevent a user from accessing or modifying another user's items.
- **FR-012**: The system MUST present items in a visual box layout and keep the primary actions easy to reach for frequent tasks.
- **FR-013**: The system MUST support keyboard-friendly interaction for ordering, navigation, and primary actions.

### Key Entities *(include if feature involves data)*

- **User**: The authenticated person who owns a private collection.
- **CollectionItem**: A spell or web link owned by a user, with title, description, tags, order, and related metadata.
- **Tag**: A visible label that helps users classify and filter items.
- **CollectionViewState**: The current search, filter, and ordering state used to present the collection.

## Constitution Alignment *(mandatory)*

- The feature MUST preserve private ownership boundaries and deny cross-user access.
- The feature MUST use or update shared contracts when request or response shapes change.
- The feature MUST define validation and error handling for invalid input and authorization failures.
- The feature MUST identify the relevant tests and user-visible success or failure states.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can find and act on a target item in less than 30 seconds on a typical collection of 50 items.
- **SC-002**: At least 90% of test users can create, edit, and delete an item without support.
- **SC-003**: Users can reorder items and see the new order preserved across reloads in the same session and on subsequent visits.
- **SC-004**: The collection supports successful copy or open actions for at least 95% of intended interactions without user confusion.

## Assumptions

- Users authenticate through email and password and keep a secure session while using the collection.
- The initial release focuses on a single-user private collection experience rather than multi-user collaboration.
- Tag catalogs and visible labels are available as part of the product experience and can be validated without introducing separate admin tools.
- The first release prioritizes reliable retrieval and quick actions over advanced sharing or import features.
