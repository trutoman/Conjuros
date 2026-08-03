# Research: Top-Row Item Text Placement

## Decision 1: Reuse existing item contracts without schema changes

- Decision: Keep `CollectionItem` and related schemas unchanged in shared contracts.
- Rationale: The feature changes card layout and overflow behavior only; no API payload or persistence shape changes are needed.
- Alternatives considered: Introduce a new view-model contract for row layout metadata. Rejected because layout rules can be derived in web UI without contract expansion.

## Decision 2: Implement top-row composition inside existing item header

- Decision: Move visible item content text into the top-row segment between title and tags within `ItemCard`.
- Rationale: The existing header already contains type badge, title, tags, and actions. Extending this area minimizes component fragmentation and regression risk.
- Alternatives considered: Create a separate row component for header content. Rejected to avoid unnecessary abstraction and extra props plumbing for this scoped change.

## Decision 3: Apply deterministic compression order

- Decision: Use a fixed compression policy: content-text area shrinks first to an approximate minimum width of 2 rem; if still constrained, tags collapse to a `+N` indicator while title and actions stay visible.
- Rationale: This matches clarified requirements and protects primary actions and item identity while preserving dense layout behavior.
- Alternatives considered: Allow all segments to flex proportionally. Rejected because it can hide actions or distort key controls on narrow viewports.

## Decision 4: Hidden tags discoverability model

- Decision: Reveal hidden tags through tooltip/popover on pointer hover and keyboard focus. Do not require reveal behavior on touch-only collapsed rows.
- Rationale: Preserves accessibility on pointer/keyboard paths while honoring the explicit touch-device clarification.
- Alternatives considered: Tap-to-open reveal on touch devices. Rejected due to clarification decision for this feature scope.

## Decision 5: Preserve existing quick-action semantics and security behavior

- Decision: Keep copy/open/edit/delete/reorder flows unchanged and explicitly verify spell copy exactness and explicit web-link open action.
- Rationale: Constitution requires safe user actions and ownership boundaries; layout work must not alter behavior.
- Alternatives considered: Refactor action handlers during layout update. Rejected to reduce regression surface and avoid mixing concerns.

## Decision 6: Validation strategy centered on component and page behavior

- Decision: Add risk-proportionate tests focused on top-row placement, overflow policy, and action parity in web component tests.
- Rationale: Most risk is in rendering and interaction behavior, not API contracts.
- Alternatives considered: API contract tests only. Rejected because this feature is primarily UI behavior and requires DOM-level assertions.

## Decision 7: Add explicit ownership-boundary API regression checks

- Decision: Add targeted API tests for cross-user read/update/delete and reorder denial paths.
- Rationale: The constitution requires executable ownership-boundary verification, not documentation-only confidence notes.
- Alternatives considered: Rely on existing CRUD/reorder tests without explicit cross-user cases. Rejected to avoid blind spots in SC-008 and FR-010 coverage.
