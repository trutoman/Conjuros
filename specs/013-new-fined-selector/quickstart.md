# Quickstart Validation Guide: Tag Match Mode Segmented Toggle

**Date**: 2026-08-02 | **Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Prerequisites

- Node.js 22+ and npm installed
- Repository cloned and dependencies installed (`npm install`)
- MongoDB running (for full app validation; not needed for unit tests)

## Automated Validation

### Unit Tests

Run the component tests to verify `TagMatchToggle` and updated `Sidebar` behavior:

```bash
# Run all tests
npm run test

# Run only the relevant component tests
npx vitest run src/web/components/__tests__/TagMatchToggle.test.tsx src/web/components/__tests__/Sidebar.test.tsx
```

**Expected outcome**: All tests pass. Specifically:
- `TagMatchToggle` tests verify ARIA attributes, active state rendering, and click handler callbacks
- `Sidebar` tests verify the toggle replaces the legacy select dropdown and correctly propagates `tagFilterMode` changes

### Lint and Type Check

```bash
npm run check
```

**Expected outcome**: Zero lint errors, zero TypeScript errors, all tests pass, build succeeds.

## Manual Validation

### Scenario 1: Toggle renders correctly

1. Start the development server: `npm run dev`
2. Log in and navigate to the collection page
3. Open the tags sidebar by clicking the "Tags" button in the topbar
4. **Verify**: The sidebar header contains an 'OR' / 'AND' segmented toggle (not a select dropdown)
5. **Verify**: The toggle visually matches the theme toggle (same border radius, padding, button style)
6. **Verify**: 'AND' is highlighted as active by default (matching the default `tagFilterMode: 'all'`)

### Scenario 2: Toggle switches modes

1. With the sidebar open and tags visible, select two or more tags
2. Click 'OR' — **Verify**: Items matching any selected tag appear
3. Click 'AND' — **Verify**: Only items matching all selected tags appear
4. **Verify**: The active button highlight switches instantly on each click

### Scenario 3: Accessibility

1. Using keyboard only (Tab + Enter/Space), navigate to the tag match toggle
2. **Verify**: Both 'OR' and 'AND' buttons are focusable
3. **Verify**: Pressing Enter or Space on a button toggles the active mode
4. Using a screen reader (or browser dev tools accessibility inspector):
5. **Verify**: The container reports `role="group"` with label "Tag match mode"
6. **Verify**: Each button reports its `aria-label` and `aria-pressed` state

### Scenario 4: Legacy elements removed

1. Open browser dev tools and inspect the sidebar header
2. **Verify**: No `<span>Match</span>` text label exists
3. **Verify**: No `<select>` dropdown exists within the sidebar header
4. **Verify**: No `.match-mode-selector` CSS class is applied to any element
