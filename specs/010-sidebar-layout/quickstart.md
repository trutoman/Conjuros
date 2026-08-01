# Quickstart & Validation Guide - Sidebar Tag Filter Layout

This guide defines the manual and automated validation scenarios to confirm the sidebar filter layout works correctly.

## Prerequisites
- Start the development server:
  ```bash
  npm run dev
  ```
- Authenticate with a test account.

---

## Validation Scenarios

### Scenario 1: Sidebar Toggle
1. Navigate to the main collection page.
2. On desktop viewports, verify that the tags sidebar is visible on the left by default.
3. Click the **Tags** button in the topbar.
4. Verify that the sidebar transitions smoothly out of view, and the collection items list expands to fill the full width.
5. Click the **Tags** button again and verify it returns to view.

### Scenario 2: Tag Grouping & Sorting
1. Click the **Manage Tags** link at the bottom of the sidebar.
2. Create or verify you have the following tags:
   - Tag: `git`, Category: `Development`
   - Tag: `docs`, Category: `Documentation`
   - Tag: `docker`, Category: `Development`
3. Return to the Collection page.
4. Verify that the tags are grouped under category headers:
   - **Development**: `docker`, `git` (sorted alphabetically)
   - **Documentation**: `docs`

### Scenario 3: Tag Filtering
1. Check the checkbox next to the tag `git`.
2. Verify that only items containing the `git` tag are shown.
3. Toggle the match mode selector at the top-right of the sidebar (e.g., from "Match all" to "Match any").
4. Verify the filtering changes accordingly.

### Scenario 4: Responsive Mobile Layout
1. Resize your browser window to a width of `768px` or less.
2. Verify that the tags sidebar is closed by default.
3. Click the **Tags** button in the topbar.
4. Verify that the sidebar slides into view as an overlay drawer, and a dark semi-transparent backdrop overlays the collection.
5. Click on the backdrop or the close button, and verify the drawer closes.

---

## Automated Verification
To run the automated visual and behavior tests:
```bash
npm run test
```
