# Quickstart & Validation Guide: New Tag Column Icon

## Prerequisites

- Node.js 18+ and npm installed
- Working workspace setup

## Verification Steps

### 1. Automated Tests

Run the frontend component test suite:
```bash
npm run test -- src/web/components/__tests__/
```

Run full project checks (lint, test, build):
```bash
npm run check
```

### 2. Manual Visual Verification

1. Start dev server:
   ```bash
   npm run dev
   ```
2. Open local browser.
3. Locate the topbar "Tags" toggle button:
   - Verify the text "Tags" appears centered at the top.
   - Verify the custom soft bar bookmark SVG icon appears centered beneath the text.
4. Click the "Tags" button to open the sidebar.
5. Inspect the sidebar header title:
   - Verify the text "Tags" appears centered at the top.
   - Verify the soft bar bookmark SVG icon appears centered beneath the title text.
6. Toggle light/dark theme using the theme toggle and verify the SVG icon fill adapts seamlessly (`fill="currentColor"`).
