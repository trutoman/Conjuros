# Quickstart & Validation Guide: Sidebar Collapse & Expand Mechanics

**Feature**: 016-sidebar-collapse
**Date**: 2026-08-02

## Prerequisites

- Local development environment running Node.js / Vite
- Browser with local storage enabled

## Verification Scenarios

### Scenario 1: Toggle Sidebar Width & Visibility

1. Open `http://localhost:5173/` in your browser.
2. Locate the sidebar "Tags" toggle button.
3. Click the "Tags" toggle button:
   - **Expected**: Sidebar smoothly collapses to the reduced toggle button width. Inner tag list and match toggle disappear (`display: none`).
4. Click the "Tags" toggle button again:
   - **Expected**: Sidebar expands back to full width, showing all tag categories and controls.

### Scenario 2: Verify LocalStorage Persistence

1. Click the "Tags" button to reduce the sidebar width.
2. Refresh the browser page (`F5` or `Cmd+R`).
3. **Expected**: Sidebar initializes in the reduced state upon page reload.

### Scenario 3: Verify Keyboard Escape & Accessibility

1. Expand the sidebar.
2. Focus inside the sidebar panel and press `Escape`.
3. **Expected**: Sidebar reduces to compact toggle button mode.
4. Inspect the toggle button using browser DevTools:
   - **Expected**: `aria-expanded="true"` when expanded, `aria-expanded="false"` when reduced.

## Automated Verification Command

```bash
npm run check
```
