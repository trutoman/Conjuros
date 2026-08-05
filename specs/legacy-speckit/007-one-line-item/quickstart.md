# Quickstart: Top-Row Item Text Placement

## Purpose

Validate end-to-end behavior for the item-card top-row layout update, including constrained-width rules and action parity.

## Prerequisites

- Node.js and npm installed.
- Project dependencies installed:
  - `npm install`
- Test environment configured as in repository defaults.

## Run Commands

1. Start local development services:

- `npm run dev`

2. Run focused automated tests (recommended during implementation):

- `npm run test -- ItemCard`
- `npm run test -- CollectionPage`
- `npm run test -- src/tests/api/items.test.ts src/tests/api/reorder.test.ts`

3. Run full validation before completion:

- `npm run check`

## Validation Scenarios

### Scenario 1: Top-row placement

1. Sign in and open collection page.
2. Confirm each item card shows content text in top row between title and tags.
3. Confirm row elements appear vertically centered.

Expected outcome:

- Top-row ordering and vertical alignment match spec requirements FR-001, FR-002, FR-003.

### Scenario 2: Compression order and minimum width behavior

1. Reduce viewport width or container width.
2. Observe content-text area shrinking first.
3. Continue reducing width and verify tags collapse to `+N` only after content-text minimum threshold is reached.

Expected outcome:

- Compression policy follows FR-004, FR-005, FR-006.

### Scenario 3: Hidden-tag discoverability

1. With collapsed tags (`+N` visible), hover pointer over `+N`.
2. Navigate to `+N` with keyboard focus.
3. On touch-only simulation, verify hidden-tag reveal is not required in collapsed row.

Expected outcome:

- Hidden tags are revealed on hover and focus (FR-013) and touch-only non-reveal behavior aligns with FR-014.

### Scenario 4: Action parity and safety behavior

1. Trigger copy on spell item; verify exact command is copied and feedback appears.
2. Trigger open on web-link; verify link opens only on explicit user action.
3. Trigger edit, delete, and reorder paths to verify they remain available and usable.

Expected outcome:

- Existing action semantics remain intact (FR-007, FR-008, FR-009).

### Scenario 5: Ownership and list states regression

1. Verify loading, empty, no-results, and error states still render correctly.
2. Validate unauthorized/cross-user access remains denied through existing backend enforcement.

Expected outcome:

- No regressions in ownership boundaries or collection state rendering (FR-010, FR-011).

### Scenario 6: Ownership-boundary API regression

1. Run `npm run test -- src/tests/api/items.test.ts src/tests/api/reorder.test.ts`.
2. Verify cross-user read, update, delete, and reorder attempts are denied.

Expected outcome:

- Ownership boundary API checks pass with denial status for unauthorized cross-user access attempts.

## Artifacts to Inspect

- Spec: [spec.md](spec.md)
- Plan: [plan.md](plan.md)
- Data model: [data-model.md](data-model.md)
- Contracts: [contracts/item-card-row-ui.md](contracts/item-card-row-ui.md)
