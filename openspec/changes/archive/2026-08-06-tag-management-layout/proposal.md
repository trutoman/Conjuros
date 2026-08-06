## Why

In the tag management view, a tag's description is currently rendered on its own line below the tag name, category, and color, which makes rows taller and harder to scan. The tag search box also occupies only a fixed width instead of filling the available header space, so it feels smaller than the collection search box.

## What Changes

- Tag rows render the description inline on the same line as the tag name, category, and color.
- When the description overflows the available row width, it is truncated with an ellipsis instead of wrapping to a new line.
- The tag search box in the tag management header stretches to fill all available width, matching the collection search box behavior.

## Capabilities

### New Capabilities

- none

### Modified Capabilities

- `tag-management`: tag rows must keep the description on the same line as the other metadata (truncating with an ellipsis when it overflows), and the tag search box must fill the available header width.

## Impact

- `src/web/components/TagList.tsx` — tag row markup and description placement.
- `src/web/index.css` — tag row description layout/truncation and tag management header search field sizing.
- `src/web/components/__tests__/TagList.test.tsx` and `src/web/pages/__tests__/CollectionPage.manageTags.test.tsx` — updated/extended tests for the new layout.
