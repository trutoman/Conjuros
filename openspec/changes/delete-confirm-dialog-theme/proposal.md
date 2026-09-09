## Why

The delete confirmation dialog (e.g. "Delete azure.pipelines?" for tags and tag categories) renders with hardcoded light colors (`#fffefa` background, `#174f43` border) that ignore the active theme, looking out of place against the rest of the themed page.

## What Changes

- The delete confirmation dialog surface, border, and text use the shared theme CSS variables instead of hardcoded light colors, so the dialog matches the page in every theme.
- No behavior change: dialog structure, buttons, copy, dismissal, and error display stay exactly as they are.
- Scope is the delete confirmation only (`.confirm-dialog`); other hardcoded surfaces such as the auth panel are untouched.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `floating-modal-dialogs`: delete confirmations (which render through the shared modal pattern) SHALL follow the active theme instead of hardcoded light colors.

## Impact

- Affected code: `src/web/index.css` (`.confirm-dialog` rule), visual regression coverage in `src/web/components/__tests__/` (or page tests asserting computed styles).
- APIs: none. Contracts: none. No new dependencies.
- Theme system (`applyTheme` + CSS variables) is reused as-is; no new variables.
