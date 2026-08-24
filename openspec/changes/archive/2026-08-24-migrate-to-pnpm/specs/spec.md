## Purpose

pnpm migration - tooling change only, no behavior changes.

## ADDED Requirements

### Requirement: pnpm lockfile determinism

The system SHALL use pnpm lockfile for deterministic dependency resolution across the monorepo.

#### Scenario: pnpm install produces consistent dependency tree

- **WHEN** running `pnpm install` on a fresh checkout
- **THEN** the dependency tree is identical across all developer machines and CI environments

### Requirement: Workspace configuration

The system SHALL maintain consistent workspace configuration via pnpm-workspace.yaml.

#### Scenario: Pnpm workspace handles monorepo packages

- **WHEN** adding a new package under `packages/`
- **THEN** it is automatically recognized and hoisted per pnpm rules