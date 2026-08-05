## Overview

This change does not alter product behavior. Its purpose is to reorganize planning artifacts so that SpecKit-era work becomes historical context while OpenSpec becomes the active planning workflow.

## Proposed Structure

- Keep the current `specs/` directory as the home for legacy artifacts during migration.
- Create `specs/legacy-speckit/` and move the existing SpecKit feature folders there.
- Create a new OpenSpec planning structure under `openspec/changes/` and `openspec/specs/` for future work.
- Use a small set of capability-oriented specs to represent the enduring product areas:
  - `collection-management`
  - `tag-management`
  - `item-card-experience`
  - `collection-layout-and-navigation`
  - `developer-environment`

## Migration Approach

1. Archive the existing SpecKit feature directories in `specs/legacy-speckit/`.
2. Preserve the original content without rewriting it unless a future change needs to refine it.
3. Introduce OpenSpec change artifacts for future work using the change-based workflow.
4. Keep the constitution and project conventions as the source of truth for new planning artifacts.

## Notes

- The migration should favor clarity over completeness. The goal is to preserve history and make the current planning approach understandable.
- The legacy features are still useful as context, but they should not be treated as the primary planning system going forward.
