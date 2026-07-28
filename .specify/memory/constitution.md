<!--
Sync Impact Report
- Version change: 0.0.0 → 1.0.0
- Modified principles: none → Ownership and Private Data Boundaries, Contract-First Architecture, Test-First Quality and Verification, Security and Safe User Actions, Focused Product Experience
- Added sections: Architecture Constraints, Development Workflow
- Removed sections: none
- Templates requiring updates: ✅ .specify/templates/plan-template.md, ✅ .specify/templates/spec-template.md, ✅ .specify/templates/tasks-template.md
- Follow-up TODOs: none
-->

# Conjuros Constitution

## Core Principles

### I. Ownership and Private Data Boundaries
Every collection operation MUST verify the authenticated user owns the target item before reading, updating, reordering, or deleting it. Relationships, filters, and list results MUST remain scoped to the current user; cross-user access MUST return 403 or 404 and never expose another user's data.

### II. Contract-First Architecture
Shared contracts MUST live in packages/contracts and MUST be the single source of truth for API and web inputs, outputs, enums, and validation logic. The HTTP layer MUST validate boundary input with Zod and MUST NOT contain business rules; services and repositories MUST own domain logic and persistence access.

### III. Test-First Quality and Verification
Every feature, bug fix, or contract change MUST add or update risk-proportionate tests before implementation is considered complete. Unit, integration, and end-to-end tests MUST cover success paths, validation failures, ownership boundaries, and critical user flows, and the project MUST run the most specific available validation plus npm run check before completion.

### IV. Security and Safe User Actions
Secrets, real environment values, and session material MUST never be committed or exposed to the client. A spell MUST be stored and displayed as plain text without execution; a web-link MUST require a valid absolute http(s) URL and MUST open only after explicit user action. Destructive operations MUST require confirmation and authorization.

### V. Focused Product Experience
The product MUST prioritize fast retrieval, copy/open actions, and clear search and ordering over decorative UI. The collection experience MUST remain accessible, keyboard-friendly, and resilient across loading, empty, no-results, and error states.

## Logging and Monitoring

Application events SHOULD be logged with sufficient context.
Sensitive information MUST never appear in logs.
Unexpected failures MUST be traceable.
Logging levels SHOULD distinguish:
- debug
- information
- warning
- error

## User Experience

The interface SHOULD prioritize speed and simplicity.
Every action SHOULD provide immediate feedback.
Long-running operations SHOULD display loading states.
Failures SHOULD present actionable error messages.
The application SHOULD preserve user preferences whenever appropriate.

## Authentication

Every operation on user resources requires authentication.
Authentication MUST be stateless.
Authorization MUST always verify ownership of the requested resource.
Users MUST never be able to access another user's data, even by manually modifying identifiers.

Security has priority over convenience.

## Architecture Constraints
The repository MUST use a TypeScript monorepo structure with source code under src/ and shared contracts in packages/contracts. The web application MUST remain responsible for UI state and consumption of contracts; the API MUST remain responsible for authorization, business rules, and MongoDB access through repositories. Express MUST be the backend runtime for this project.

## Development Workflow
All work MUST be documented in English. Features MUST be implemented incrementally, with contracts and domain rules updated before endpoint or UI work. Before finishing, contributors MUST run the most specific available validation and npm run check when it exists, then report any unresolved failures and the exact commands used.

## Governance
This constitution supersedes conflicting local practices. Amendments MUST be proposed in a change review, documented with rationale, and merged only when the updated principles are reflected in the relevant templates, guidance, and implementation work. Compliance is verified by reviewing whether new work preserves ownership boundaries, contract-first design, tests, and security constraints. Versioning follows semantic versioning: MAJOR for backward-incompatible governance changes, MINOR for new principles or materially expanded guidance, and PATCH for clarifications or non-semantic refinements.

**Version**: 1.0.0 | **Ratified**: 2026-07-28 | **Last Amended**: 2026-07-28
