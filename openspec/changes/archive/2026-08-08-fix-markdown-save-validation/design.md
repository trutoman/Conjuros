# Design: Friendly item form validation messages

## Context

See proposal.md — Why. The item form's `submit()` (`src/web/components/ItemForm.tsx`) builds a payload, runs `collectionItemInputSchema.safeParse(payload)`, and on failure maps the error to a message shown in the form. The current mapping only special-cases `kind === 'spell' && !content` and `kind === 'markdown' && !content`; every other failure falls through to `result.error.issues[0]?.message`, which leaks the raw Zod text (e.g. "String must contain at least 1 character(s)"). The `!content` checks also fail to catch whitespace-only values, which are truthy.

## Goals / Non-Goals

- Goals: friendly, field-specific messages for markdown title/content, spell command, web-link URL; never show raw Zod text; keep the contract schemas as the single source of validation truth.
- Non-Goals: changing server-side validation or the Zod schemas in `packages/contracts`; adding per-field inline error placement (a single form-level error line stays as today).

## Decisions

### 1. Map known validation failures by field path, not by message text
Derive the error from `result.error.issues[0]`, reading the failing field from `issue.path[0]` and, for `web-link`, `issue.code` (`invalid_url`) or the existing `refinement` message. Rationale: mapping by field/kind is stable and robust to Zod message wording changes; matching on the message string ("String must contain at least 1 character(s)") is fragile. This also lets the same handler cover empty and whitespace-only values uniformly.

### 2. Normalize empty/whitespace checks with `.trim()`
Before choosing the message, treat a value as missing when `value.trim() === ''` rather than `!value`. Rationale: whitespace-only strings are truthy and slipped past the old `!content` guard; trimming matches how the schemas validate (`z.string().trim().min(1)`).

### 3. Unknown failures fall back to a generic message
When the first issue is not one of the known fields (or is unexpected), show "Check the item details" instead of `issue.message`. Rationale: guarantees the raw Zod text can never surface, satisfying the spec's "never shown" scenario.

### 4. Validate against the submitted payload, keeping schema as source of truth
Keep calling `collectionItemInputSchema.safeParse(payload)`; the message mapping only interprets the failure. Rationale: preserves existing validation semantics (title length, tag normalization, kind-specific field rules) without duplicating rules in the UI.

## Risks / Trade-offs

- [Message mapping grows if more fields become required] → Mitigation: keep mapping in a small pure helper (`messageForInputError`) that is unit-testable and lists field → message explicitly.
- [Relying on `issue.path[0]` couples the UI to Zod's issue shape] → Mitigation: `collectionItemInputSchema` is a shared contract already imported by the UI; the helper reads only `path`, `code`, and the schema's own refinement messages, and unknown paths degrade to the generic message.

## Migration Plan

- No data migration. Frontend-only change; deploy with the app. Rollback is reverting `ItemForm.tsx` (and its test changes).

## Open Questions

None.
