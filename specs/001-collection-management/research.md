# Research Notes: Collection Management

## Decision: Use a single discriminated item model

**Decision**: Represent collection items as a single `CollectionItem` entity with a `kind` field that is either `spell` or `web-link`.

**Rationale**: This keeps the UI and API consistent while allowing each item type to carry its own required payload (`command` vs. `url`) and shared metadata (`title`, `description`, `tags`, `order`, `relatedItemIds`).

**Alternatives considered**: Maintaining separate entity types for spells and links would simplify some validation rules but would split logic across the API, UI, and contracts and increase duplication.

## Decision: Enforce ownership at the service and repository boundaries

**Decision**: Every read, update, reorder, and delete operation must verify the current user owns the target item before persistence or response generation.

**Rationale**: The constitution requires private boundaries, and this prevents cross-user access even if a caller manipulates identifiers.

**Alternatives considered**: UI-only gating or route-level checks alone would not be sufficient because the backend must remain the authority.

## Decision: Use shared Zod schemas and generated types from `packages/contracts`

**Decision**: Define request/response schemas, enums, and validation helpers once in `packages/contracts` and import them from both the API and web layers.

**Rationale**: This keeps request and response shapes consistent and ensures validation happens at the boundary without duplicating rules.

**Alternatives considered**: Keeping independent schemas in frontend and backend packages would risk drift and inconsistent validation.

## Decision: Support pagination and server-side filtering for list endpoints

**Decision**: List endpoints will accept `limit`, `skip`, `search`, `tag`, `kind`, and `sort` parameters, defaulting to a maximum limit of 50.

**Rationale**: The spec requires predictable filtering and the constitution requires pagination for every list endpoint.

**Alternatives considered**: Returning the full collection would be simpler but violates the repository constraints and would not scale well.

## Decision: Keep copy/open actions explicit and accessible

**Decision**: The web experience will expose copy actions for commands and URLs and open links only after explicit user activation, with visible success or failure feedback.

**Rationale**: The feature spec and constitution both require safe, explicit user actions and clear feedback.

**Alternatives considered**: Automatically opening links or silently copying content would be less safe and would not meet the explicit-action requirement.