# Feature Specification: User Configurable Tags

**Feature Branch**: `[003-configurable-tags]`

**Created**: 2026-07-29

**Status**: Draft

**Input**: User description: "All tags must be user-configurable, searchable, filterable, assignable to spells and web-links, include configurable color and description, and support ownership-scoped CRUD with cascade removal from associated items."

## Clarifications

### Session 2026-07-29

- Q: Should tag name uniqueness be case-insensitive per user, so Work.Tag and work.tag are treated as the same tag? → A: Yes. Case-insensitive uniqueness and comparison; preserve original casing for display.
- Q: When filtering items by multiple selected tags, should results require matching all selected tags or any selected tag? → A: Support both modes, default to matching all selected tags (AND).
- Q: What color format should the system accept for a tag color value? → A: Hex color only (#RRGGBB).
- Q: When a user renames a tag, should existing spell and web-link associations stay linked automatically to the renamed tag? → A: Keep all existing associations linked automatically after rename.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Manage Personal Tags (Priority: P1)

As an authenticated user, I can create, view, edit, and delete my own tags so I can organize my private collection with labels that match my own vocabulary.

**Why this priority**: Without ownership-scoped tag CRUD, the feature has no usable foundation.

**Independent Test**: Can be fully tested by creating a new tag, reading it, updating its fields, and deleting it while logged in as one user, then verifying another user cannot access or manage that tag.

**Acceptance Scenarios**:

1. **Given** an authenticated user with no tag named `work.todo`, **When** the user creates a tag with name `work.todo`, description, and color, **Then** the tag is stored under that user and is retrievable in the user tag list.
2. **Given** an authenticated user with an existing tag, **When** the user edits the tag description or color, **Then** the updated values are shown on subsequent reads.
3. **Given** an authenticated user, **When** the user attempts to create or rename a tag with disallowed characters, **Then** the system rejects the request with a validation error.
4. **Given** two authenticated users, **When** one user requests the other user's tag, **Then** the system denies access and does not expose the tag details.

---

### User Story 2 - Use Tags in Collection Items (Priority: P2)

As an authenticated user, I can attach my existing tags to my spells and web-links so my items are categorized consistently.

**Why this priority**: Tag usefulness depends on being applicable to existing collection items.

**Independent Test**: Can be fully tested by creating tags and attaching them to spells and web-links, then trying to attach a tag that does not belong to the user.

**Acceptance Scenarios**:

1. **Given** an authenticated user with an existing spell and an existing owned tag, **When** the user assigns the tag to the spell, **Then** the spell stores the tag association.
2. **Given** an authenticated user with an existing web-link and an existing owned tag, **When** the user assigns the tag to the web-link, **Then** the web-link stores the tag association.
3. **Given** an authenticated user, **When** the user attempts to assign a non-existent or non-owned tag to an item, **Then** the system rejects the request.

---

### User Story 3 - Filter and Search by Tags (Priority: P3)

As an authenticated user, I can search and filter by my tags the same way I do with spells and web-links so I can quickly find relevant content.

**Why this priority**: Discovery workflows are a key user value once tags exist and are attached.

**Independent Test**: Can be fully tested by creating multiple tags and items, applying associations, then verifying search and filter results match only the current user's data.

**Acceptance Scenarios**:

1. **Given** an authenticated user with multiple tags, **When** the user searches tags by name, **Then** only matching tags owned by that user are returned.
2. **Given** an authenticated user with tagged and untagged items, **When** the user filters by one or more tags, **Then** only items with those tag associations are returned.
3. **Given** two authenticated users with overlapping tag names, **When** each user filters or searches, **Then** each user sees only their own tags and item results.

---

### Edge Cases

- Attempting to create or rename a tag to a name that already exists for the same user.
- Attempting to create a tag with only separators, leading/trailing spaces, or empty content.
- Deleting a tag that is currently associated with many spells and web-links.
- Simultaneous edits where one request deletes a tag while another request attempts to assign it.
- Filtering items by tags when none of the selected tags exist for the current user.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow each authenticated user to create, list, read, update, and delete only their own tags.
- **FR-002**: System MUST represent each tag with at least `tagName`, `description`, and `color`, where `tagName` is both the tag title and value.
- **FR-003**: System MUST validate `tagName` using only alphanumeric characters and the dot (`.`) character.
- **FR-004**: System MUST reject creation or update when the proposed `tagName` already exists for the same user using case-insensitive comparison, while preserving original casing for display.
- **FR-005**: System MUST allow users to configure `color` at creation time and modify it during updates.
- **FR-013**: System MUST validate tag color using only the hex format `#RRGGBB`.
- **FR-014**: System MUST keep existing spell and web-link tag associations linked to the same tag when the user renames that tag.
- **FR-006**: System MUST allow users to configure `description` at creation time and modify it during updates.
- **FR-007**: System MUST allow associating tags to spells and web-links only when the tag exists and belongs to the authenticated user.
- **FR-008**: System MUST reject item updates that reference tags that do not exist or do not belong to the authenticated user.
- **FR-009**: System MUST support searching tags by user-provided search text with case-insensitive comparison and return only tags owned by the authenticated user.
- **FR-010**: System MUST support filtering spells and web-links by selected tags in both modes: match all selected tags (AND, default) and match any selected tag (OR), and return only the authenticated user's matching items.
- **FR-011**: System MUST cascade tag deletion by removing the deleted tag association from all of the authenticated user's spells and web-links where it appears.
- **FR-012**: System MUST keep all tag operations private per user and deny cross-user read, update, delete, association, search, and filter access.

### Key Entities *(include if feature involves data)*

- **Tag**: A user-owned label defined by `tagName` (title/value), `description`, `color`, ownership metadata, and ordering metadata when applicable.
- **Collection Item**: A user-owned spell or web-link that can reference zero or more owned tags.
- **Tag Association**: The relationship linking one user-owned tag to one user-owned collection item.

## Constitution Alignment *(mandatory)*

- The feature MUST preserve strict ownership checks so tag and item operations never cross user boundaries.
- The feature MUST use shared contracts as the single source of truth when tag-related request/response shapes are introduced or changed.
- The feature MUST define validation and error responses for invalid tag formats, unauthorized access, and invalid tag associations.
- The feature MUST include risk-proportionate tests for success paths, validation failures, ownership boundaries, and cascade behavior.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of authenticated users can create, edit, and delete a personal tag in one attempt during acceptance testing.
- **SC-002**: 100% of attempts to assign non-owned or non-existent tags to items are rejected with a clear validation or authorization failure.
- **SC-003**: In test scenarios with at least 100 tagged items per user, users can locate matching items by tag filter within 3 seconds for at least 95% of queries.
- **SC-004**: After a tag deletion, 100% of the deleted tag associations are removed from the user's spells and web-links within the same operation outcome.
- **SC-005**: In multi-user test scenarios, 0 cross-user tag records or tag-based item results are exposed.

## Assumptions

- Authentication and current-user resolution already exist and continue to be required for all private collection operations.
- Existing spell and web-link item models can store tag associations without introducing a new item type.
- Tag filtering and searching follow the same pagination and private-scope conventions already used by collection endpoints.
- Color values use the validated hex format `#RRGGBB`.

