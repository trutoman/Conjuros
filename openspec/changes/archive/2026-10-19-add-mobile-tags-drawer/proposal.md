## Why

On narrow viewports the tags sidebar is force-expanded and stacked above the collection, so the tag panel pushes the search bar and the item list below the fold. Someone opening Conjuros on a phone or a small window has to scroll past the entire tag list before reaching the collection they came for.

## What Changes

- On viewports at or below the mobile breakpoint (`768px`), the tags sidebar SHALL be hidden by default instead of being force-expanded and stacked above the collection.
- The topbar SHALL render a `Tags` button next to the `Conjuros` title on narrow viewports; activating it opens the tags sidebar as an overlay drawer over the content.
- The drawer SHALL close through its close control, a click on the backdrop, or `Escape`, and its open state SHALL NOT be persisted (unlike the desktop sidebar).
- Desktop sidebar behavior (persisted expand/collapse through `conjuros_sidebar_open`) SHALL remain unchanged.
- Mobile topbar presentation SHALL be tightened: the tagline eyebrow is hidden, the topbar stays on a single row with a smaller title, and the theme toggle and user name are compacted.
- The two duplicated `max-width: 650px` media blocks SHALL be removed so a single `768px` breakpoint governs the narrow layout.
- Item card inline content truncation rules SHALL be scoped to `.item-card` and SHALL explicitly disable inherited word-breaking so the content stays a single truncated line.
- The narrow-viewport sidebar tests SHALL assert the drawer behavior (hidden by default, opens/closes through the Tags button), and the CSS-text assertion for the old `650px` add-button sizing SHALL be dropped.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `collection-layout-and-navigation`: narrow viewports hide the tags sidebar and reveal it through a topbar `Tags` button that opens a drawer dismissed via close control, backdrop, or `Escape`; desktop collapse persistence is unchanged; a single mobile breakpoint replaces the duplicated `650px` blocks.

## Impact

- `src/web/pages/CollectionPage.tsx` — mobile drawer state, topbar `Tags` button, conditional sidebar rendering.
- `src/web/index.css` — `.topbar-title-row`, mobile `768px` topbar styles, `.item-card .item-inline-content` scoping, removal of the duplicated `650px` media blocks.
- `src/web/pages/__tests__/CollectionPage.test.tsx` — narrow-viewport tests updated for the drawer and the obsolete CSS assertion removed.
- `.gitignore` — ignore the local `.cloudfare_token` file.
- No API, contract, schema, or persistence changes.
