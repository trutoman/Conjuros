# Research: User Configurable Tags

## Decision: Replace static tag catalog with a user-owned tag entity

**Rationale**: The current shared `tagCatalog` enum cannot represent per-user configurable tags, color, description, and ownership. A dedicated tag entity allows strict owner scoping, CRUD operations, and compatibility with assignment checks required by the feature.

**Alternatives considered**:

- Keep static enum in shared contracts: rejected because it blocks per-user creation and editing.
- Store tags only embedded in each item: rejected because it cannot provide canonical user tag CRUD, global user tag search, or reliable cascade deletion.
- Use global shared tags across users: rejected because it violates private ownership boundaries.

## Decision: Enforce case-insensitive uniqueness with display-case preservation

**Rationale**: Users selected case-insensitive uniqueness while preserving the original display form. Persisting both display `tagName` and canonical comparison value (for example normalized lowercase) prevents duplicates like `Work.Tag` and `work.tag` for one owner while preserving UX.

**Alternatives considered**:

- Case-sensitive uniqueness: rejected by clarification and causes duplicate-like labels.
- Force lowercase display only: rejected because it removes user-intended formatting.

## Decision: Validate `tagName` and `color` at contract boundaries

**Rationale**: The feature requires `tagName` characters limited to alphanumeric and dot (`.`), plus `color` in `#RRGGBB`. Zod contract validation keeps HTTP handlers thin and ensures API and web share exactly one source of truth.

**Alternatives considered**:

- Validate only in UI: rejected because server-side safety is required.
- Validate only in service/repository: rejected because boundary validation must happen in contracts.

## Decision: Keep item-tag association as tag-name values, validated against owned tags

**Rationale**: Existing item model stores `tags` as strings and already supports search/index behavior around strings. Keeping this representation minimizes migration cost while enforcing ownership by validating all submitted tags against the authenticated user tag set during create/update.

**Alternatives considered**:

- Move items to tag IDs immediately: rejected for this increment because it requires broader migration and contract breakage.
- Allow free-form tags in items: rejected because feature requires tags to exist as owned tags before assignment.

## Decision: Support both tag filter modes with AND default

**Rationale**: Clarification selected dual behavior: AND default and optional OR mode. This supports both precise narrowing and broad discovery while staying explicit in contracts.

**Alternatives considered**:

- AND only: rejected by clarification requiring both modes.
- OR only: rejected because default should narrow results and preserve predictable drill-down.

## Decision: Cascade delete by removing tag references from all owned items

**Rationale**: Feature requires cascade cleanup when deleting a tag. The safest behavior is a single service operation that deletes the owned tag and removes that tag value from all of the same owner's items.

**Alternatives considered**:

- Block delete when tag is in use: rejected because requirement explicitly asks for cascade deletion.
- Background eventual cleanup: rejected because success criteria expect immediate consistency in operation outcome.

## Decision: Add explicit tag API surface and keep item API ownership rules

**Rationale**: A dedicated `/tags` API aligns with discoverability (CRUD/search/filterable tag list) while item routes keep current responsibilities. Controllers remain orchestration only; services enforce ownership and tag-association rules; repositories own MongoDB operations.

**Alternatives considered**:

- Hide tag CRUD inside `/items` only: rejected because tags must be independently searchable and manageable.
- Expose persistence-only fields in API: rejected by contract and architecture constraints.
