## Why

The project already has a substantial body of SpecKit-era planning artifacts under `specs/`, but the OpenSpec workflow is now the active planning system. This change preserves the historical design intent while establishing a clear migration path into OpenSpec so future work can be planned and implemented in a consistent structure.

## What Changes

- Preserve the existing SpecKit feature documents as historical reference under `specs/legacy-speckit/`.
- Introduce a new OpenSpec planning structure for the capabilities that are still relevant to the product.
- Define a migration mapping for legacy features into a smaller set of durable capabilities.
- Establish a planning home and change-based workflow for future work without changing runtime behavior.

## Capabilities

### New Capabilities
- `migration-planning`: A planning capability for organizing and preserving legacy SpecKit artifacts while introducing OpenSpec-based change management.

### Modified Capabilities
- None.

## Impact

- Repository planning structure under `openspec/` and `specs/`.
- Documentation and change tracking workflow for future feature work.
- No runtime application behavior changes are introduced by this change.
