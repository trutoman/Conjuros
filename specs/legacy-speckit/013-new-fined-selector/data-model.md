# Data Model: Tag Match Mode Segmented Toggle

**Date**: 2026-08-02 | **Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Overview

This feature introduces no new data entities, fields, or persistence changes. The existing `tagFilterMode` field in the client-side `CollectionFilters` interface is the only domain value involved, and it remains unchanged.

## Existing Entities (No Changes)

### CollectionFilters (client-side state)

**Location**: `src/web/hooks/useCollectionFilters.ts`

| Field | Type | Description |
|-------|------|-------------|
| `search` | `string` | Free-text search query |
| `kind` | `ItemKind \| undefined` | Optional item type filter |
| `tags` | `string[]` | Selected tag names (lowercase) |
| `tagFilterMode` | `'all' \| 'any'` | Tag matching strategy — unchanged |

**Persistence**: Serialized to `sessionStorage` under key `conjuros:filters`. No database persistence.

**State transitions**: `tagFilterMode` toggles between `'all'` and `'any'` via user interaction. Default is `'all'`.

## New UI Component Interface

### TagMatchToggle Props

| Prop | Type | Description |
|------|------|-------------|
| `mode` | `'all' \| 'any'` | Currently active tag match mode |
| `onChange` | `(mode: 'all' \| 'any') => void` | Callback fired when mode is toggled |

**Mapping**:
- Button "OR" → `mode: 'any'`
- Button "AND" → `mode: 'all'`

## Validation Rules

- `mode` must be one of `'all'` or `'any'` — enforced by TypeScript union type (no runtime validation needed for a UI-only prop).
- No Zod schema changes required — `tagFilterMode` is already typed in `CollectionFilters` and validated at the API boundary via existing `CollectionQuery` schema in `packages/contracts`.
