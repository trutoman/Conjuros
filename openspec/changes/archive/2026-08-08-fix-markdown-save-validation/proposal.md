## Why

Saving a `markdown` item from the item form can appear to "do nothing" while showing the raw Zod message "String must contain at least 1 character(s)". This happens when the title is empty, the title is whitespace-only, or the content is whitespace-only: the submit handler's friendly-message fallback only catches an empty string (`!content`), so whitespace-only and title cases fall through to the first raw validation issue. Users cannot tell which field is invalid or how to fix it.

## What Changes

- The item form submit handler SHALL show a friendly, field-specific error message instead of the raw Zod message for every validation failure when saving a `markdown` item.
- Empty or whitespace-only `title` SHALL report "Title is required".
- Empty or whitespace-only `content` SHALL report "Content is required for a markdown note".
- The raw Zod issue message SHALL NOT be shown to the user for these cases; unknown validation failures MAY fall back to a generic message.
- Apply the same friendly validation behavior to `spell` (empty or whitespace-only `command` → "Command is required for a spell") and `web-link` (invalid URL → "URL must use the http or https protocol") so the fix is consistent across kinds.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `collection-management`: the item form validation behavior changes so markdown (and spell / web-link) saves report friendly field-specific errors instead of leaking the raw Zod message.

## Impact

- `src/web/components/ItemForm.tsx` — `submit()` validation error handling (currently `ItemForm.tsx:162-166`).
- `src/web/components/__tests__/ItemForm.test.tsx` — add/update tests for empty/whitespace title and whitespace-only content, plus the existing spell/markdown required-field tests.
- No contract changes in `packages/contracts` — schemas already enforce the rules; only the frontend message mapping changes.
