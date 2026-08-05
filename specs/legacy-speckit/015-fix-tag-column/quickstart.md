# Quickstart & Validation Guide: Fix Tag Column Icon Layout

## Automated Verification

Run full test suite and project checks:
```bash
npm run check
```

## Manual Verification

1. Start dev server:
   ```bash
   npm run dev
   ```
2. Open web application in browser.
3. Locate topbar "Tags" toggle button:
   - Confirm `<button class="quiet tags-toggle-btn"><span>Tags</span><svg ...></svg></button>` renders text on top centered and SVG directly below.
4. Click "Tags" button to toggle sidebar:
   - Confirm sidebar header title renders "Tags" on top centered and SVG directly below.
5. Toggle light/dark theme to confirm SVG `currentColor` fill adaptation.
