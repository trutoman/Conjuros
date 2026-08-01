# Feature Specification: Tag Categories

**Feature Branch**: `009-tag-categories`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "Add tag categories so every tag belongs to one category, categories only exist through tags, and duplicate tag existence is determined by the combination of tag name and category."

## Clarifications

### Session 2026-08-01

- Q: Which category should existing tags without a category receive during migration? → A: General

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Assign Categories To Tags (Priority: P1)

As an authenticated user, I want to choose a category whenever I create or edit a tag so that I can keep similar tags organized together.

**Why this priority**: Category assignment is the core user-facing behavior. Without it, the feature provides no organizing value.

**Independent Test**: A user can create a tag with a category, edit that category later, and always see the saved category when the tag is listed.

**Acceptance Scenarios**:

1. **Given** a user is creating a tag, **When** they provide the required tag details, **Then** they must also provide a category name before the tag can be saved.
2. **Given** a user is editing an existing tag, **When** they change its category name, **Then** the updated category is saved and shown wherever that tag appears.
3. **Given** a user is viewing their tags, **When** they scan the list, **Then** each tag shows its category alongside the tag name.

---

### User Story 2 - Reuse Names Across Categories Safely (Priority: P2)

As an authenticated user, I want duplicate detection to consider both the tag name and the category so that I can reuse the same tag name in different contexts without creating ambiguous duplicates.

**Why this priority**: Users often need the same label in different organizational groups, but still need protection from accidental duplicates inside one group.

**Independent Test**: A user can save two tags with the same name under different categories, but cannot save two tags whose normalized name and normalized category are the same.

**Acceptance Scenarios**:

1. **Given** a user already has a tag named "work" in one category, **When** they create another tag named "work" in a different category, **Then** the second tag is accepted.
2. **Given** a user already has a tag whose name and category match another tag after trimming and case normalization, **When** they create or edit a tag to that same combination, **Then** the system rejects it as a conflict.

---

### User Story 3 - Keep Categories Accurate Automatically (Priority: P3)

As an authenticated user, I want categories to appear only when they contain tags so that my organization stays clean without separate category maintenance.

**Why this priority**: Automatic cleanup keeps the product focused and avoids introducing a second management flow for category records.

**Independent Test**: A user can move or delete the last tag in a category and confirm that the now-empty category no longer appears in later category usage.

**Acceptance Scenarios**:

1. **Given** a user assigns a tag to a new category name, **When** the tag is saved, **Then** that category becomes available through that tag association.
2. **Given** a category has only one remaining tag, **When** the user deletes that tag or moves it to another category, **Then** the emptied category no longer exists for that user.
3. **Given** a user looks for category management controls, **When** they use the product, **Then** they find no separate flow to create or maintain categories outside of tag create and edit actions.

### Edge Cases

- A user submits a missing, blank, or whitespace-only category and the tag is rejected.
- A user enters leading or trailing whitespace in a category name and the saved value is evaluated using the trimmed category.
- A user attempts to save a tag whose name-category pair matches another one after case normalization and surrounding whitespace removal.
- A user deletes or reassigns the only tag in a category and the category stops existing immediately after that change.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every tag MUST belong to exactly one category.
- **FR-002**: The system MUST require a category whenever a user creates a tag or updates a tag's category.
- **FR-003**: The system MUST treat category names as user-owned values and MUST not expose categories across users.
- **FR-004**: The system MUST display each tag's category wherever tags are listed for management.
- **FR-005**: The system MUST allow the same user to reuse a tag name in different categories.
- **FR-006**: The system MUST reject creation or updates when another tag owned by the same user already has the same normalized tag name and normalized category.
- **FR-007**: The system MUST not offer any standalone action to create or manage categories separately from tags.
- **FR-008**: The system MUST stop treating a category as existing for a user once no tags remain assigned to it.
- **FR-009**: The system MUST validate category input as a non-empty trimmed string with a maximum length of 120 characters.

### Key Entities *(include if feature involves data)*

- **Tag**: A user-owned label attached to items, including a required name, a required category, and display details such as description and color.
- **Tag Category**: A user-owned grouping label that exists only because one or more tags currently reference the same category name.

## Constitution Alignment *(mandatory)*

- The feature MUST preserve private ownership boundaries for tag creation, editing, listing, and duplicate detection.
- The feature MUST keep category validation and duplicate rules consistent anywhere users create or edit tags.
- The feature MUST keep category behavior focused on tag management rather than adding a separate category-management workflow.
- The feature MUST define success and failure outcomes for valid input, invalid input, and ownership-safe behavior.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of saved tags include a non-empty category value.
- **SC-002**: 100% of attempts to create or update a tag to a duplicate normalized name-category pair for the same user are rejected.
- **SC-003**: 100% of attempts to save the same normalized tag name under different categories for the same user are accepted.
- **SC-004**: In tag management views, 100% of listed tags display their category.
- **SC-005**: After a user removes or reassigns the last tag in a category, that category no longer appears in the user's subsequent category usage.

## Assumptions

- Existing authenticated users continue using the same private ownership rules already applied to tags.
- Category names are plain text labels and do not need separate user-managed metadata.
- Existing tags without a category will be assigned the `General` category during migration before users edit them.
- This feature does not add a dedicated category browser, category permissions model, or category-level actions beyond what happens through tag creation, editing, and deletion.
