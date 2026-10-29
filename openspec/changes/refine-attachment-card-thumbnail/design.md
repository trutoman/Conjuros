## Context

See `proposal.md` for motivation and `specs/item-card-experience/spec.md` for the behavior contract. The card header is a flex container with `flex-wrap: nowrap`: the title, the inline content box (filename plus description toggle for attachments), and the tags share one row. The tag overflow calculation currently budgets only the title width, tag widths, minimum content width, and gaps. The image preview added by `add-image-attachment-preview` renders as a separate block below the header through `.attachment-card-preview-frame`, which forces a second row.

## Goals / Non-Goals

**Goals:**

- Place the thumbnail in the existing single header row without introducing a second row or horizontal scrolling.
- Keep tags correctly collapsed when the thumbnail consumes horizontal space.
- Cap the thumbnail at 85 px on the longest edge while keeping the aspect ratio.
- Leave the preview request, caching, accessibility, and failure behavior untouched.

**Non-Goals:**

- Changing the retired preview endpoint, the MIME exposure, or the viewer image behavior.
- Generating resized thumbnails or new image variants on the server.
- Changing the tag overflow algorithm itself.
- Redesigning the card for narrow viewports beyond keeping the row within the card.

## Decisions

### 1. Move the existing `<img>` into the title row

The thumbnail markup moves from after `.item-header` to inside `.item-title-row`, immediately after `.item-inline-content-box` and before the conditional `.tags` block. It keeps its `.attachment-card-preview-frame` wrapper, but the wrapper becomes an inline flex item with `flex: 0 0 auto`, `display: flex`, and `align-items: center`, and loses the top margin. This preserves the existing `img` element, alt text, `loading="lazy"`, and `onError` handling.

Alternative considered: absolutely position the thumbnail in the header. It would avoid affecting flex layout, but overlap risk with tags and actions is higher and the layout becomes harder to reason about.

### 2. Cap the thumbnail at 85 px with `auto` dimensions

`.attachment-card-preview` changes to `max-width: 85px; max-height: 85px; width: auto; height: auto; object-fit: contain`. Auto dimensions plus max constraints preserve small images at their intrinsic size and scale large images proportionally. The existing border, radius, and muted background stay so the image still reads as a framed preview.

Alternative considered: fixed `width: 85px; height: 85px` with `object-fit: cover`. That would crop images and violate the no-cropping requirement.

### 3. Reserve the thumbnail width in the tag overflow budget

`computeTagOverflow` receives `availableWidth: topRowWidth`, which does not know about the image. The card subtracts a constant reservation when the item qualifies for a preview: `showsImagePreview ? 85 + 8 : 0`, clamped to zero. Eight pixels approximate the row gap. The reservation uses eligibility rather than the loaded URL so the collapsed tag count does not jump when the preview finishes loading, and `showsImagePreview` replaces `previewUrl` in the memo dependencies to keep the budget stable.

Alternative considered: measure the rendered image with a `ResizeObserver` and subtract its actual width. It is more precise but adds a second observer and a resize loop for an element that never exceeds 85 px; the fixed reservation is predictable and conservative.

### 4. Keep loading and failure behavior out of the row layout

While the preview URL is pending, no placeholder is rendered, so the row keeps its normal height and the reserved width only affects tag collapsing. If the request fails, the image stays absent and the card remains functional. Eligible cards therefore always reserve the same width for tag calculation, whether or not the image loaded.

## Risks / Trade-offs

- **Fixed reservation hides tags earlier than the actual image width requires** → The maximum error is the difference between 85 px and the real thumbnail width, applied only to image attachments; it keeps the layout stable and avoids overlap.
- **The row height grows to the thumbnail height while remaining one row** → The 85 px cap bounds the growth and the flex alignment keeps title, filename, and tags vertically centered.
- **Very narrow cards have little room for a title, thumbnail, and tags** → The title and filename already truncate, tags collapse to the overflow indicator, and the action row is separate; the thumbnail never wraps or overflows.
- **Stale tests may assert the previous block layout** → Update the card tests to assert the preview is a child of the title row, ordered after the filename box and before the tags, and that no preview block remains below the header.

## Migration Plan

No data, API, or database migration. Deploy the web bundle; roll back by reverting the component and stylesheet changes. The preview request and cached URLs are unaffected.

## Open Questions

None.
