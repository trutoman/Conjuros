# Quickstart & Validation Guide: Search & Filter Sub-Header

## Overview
This guide provides manual and automated validation procedures for verifying the relocated search input box and item type selector inside the main content frame sub-header.

## Setup Commands

```bash
# Start local development server
npm run dev
```

## Manual Verification Scenarios

### Scenario 1: Desktop Sub-Header Verification
1. Open the application in a desktop browser (`http://localhost:5173`).
2. Inspect `.main-content-frame`.
3. **Expected Result**: 
   - A sub-header row (`.collection-subheader`) appears directly above the item grid.
   - Search input box sits on the left with placeholder `"Buscar en título y contenido..."`, flexing to fill available width.
   - Item type selector (`Type: All types / Spells / Web links`) sits on the right.

---

### Scenario 2: Mobile Viewport Stacking Verification
1. Resize browser width to `<= 650px` (or enable mobile emulation in DevTools).
2. Inspect `.collection-subheader`.
3. **Expected Result**:
   - Sub-header stacks into two full-width rows: search input on top, type selector dropdown on the bottom.

---

### Scenario 3: Tags Sidebar Cleanup Verification
1. Click the `"Tags"` button in the topbar to open the tags sidebar.
2. Inspect sidebar header and content.
3. **Expected Result**:
   - Sidebar heading displays `"Tags"` (no longer `"Search"`).
   - Search input box and type dropdown are NOT present in the sidebar.

## Automated Verification

```bash
# Run unit & component test suite
npm test
```

Refer to [data-model.md](file:///home/alosadad/Conjuros/specs/012-searchbox-as-header/data-model.md) and [contracts/ui-components-contract.md](file:///home/alosadad/Conjuros/specs/012-searchbox-as-header/contracts/ui-components-contract.md) for design details.
