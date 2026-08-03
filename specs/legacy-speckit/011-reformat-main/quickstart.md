# Quickstart & Validation Guide: Boxed Application Shell & Layout Reformat

## Overview
This guide provides manual and automated validation procedures for verifying the Boxed Application Shell layout and sidebar collapse behavior.

## Prerequisites
- Node.js (v18+)
- Local environment running the Vite web server (`npm run dev`)

## Setup Commands

```bash
# Install dependencies (if not already installed)
npm install

# Start local development server
npm run dev
```

## Manual Verification Scenarios

### Scenario 1: Centered Boxed Shell Verification
1. Open the application in a desktop browser at `http://localhost:5173`.
2. Expand the browser window to ultra-wide width (> 1600px).
3. Inspect `.app-shell` using developer tools.
4. **Expected Result**: 
   - `.app-shell` is horizontally centered (`margin: 0 auto`).
   - Max-width is constrained to `1440px`.
   - Content does not stretch out to outer screen edges.

---

### Scenario 2: Mobile Viewport Adaptation
1. Resize the browser viewport down to `<= 650px` width (or enable mobile emulation in DevTools).
2. Inspect `.app-shell`.
3. **Expected Result**:
   - Shell width updates to `min(100% - 1rem, 1120px)`.
   - Top padding applies `1rem`.

---

### Scenario 3: Sidebar Expansion and Collapse Stability
1. Open the home/collection page on a desktop viewport.
2. Locate the sidebar toggle button for the search/tags panel.
3. Toggle the sidebar between expanded and collapsed states.
4. **Expected Result**:
   - Sidebar collapses with a smooth 200ms ease transition.
   - Main collection card grid expands fluidly to fill space.
   - Cards in `.collection-grid` maintain grid column alignment without element jumps or layout breaks.

---

### Scenario 4: In-Bounds Log Panel Rendering
1. Toggle the log panel visibility.
2. Verify its position within the layout.
3. **Expected Result**:
   - Log panel renders inside `.app-shell-body` within the centered `1440px` app-shell bounds.

## Automated Verification

Run unit & UI tests with Vitest:

```bash
# Run web suite tests
npm test
```

Refer to [data-model.md](file:///home/alosadad/Conjuros/specs/011-reformat-main/data-model.md) and [contracts/ui-layout-contract.md](file:///home/alosadad/Conjuros/specs/011-reformat-main/contracts/ui-layout-contract.md) for full design specifications.
