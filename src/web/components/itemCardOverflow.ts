export type TagOverflowInput = {
  availableWidth: number;
  titleWidth: number;
  minContentWidth: number;
  tagWidths: number[];
  gap: number;
};

export type TagOverflowResult = {
  visibleCount: number;
  collapsedCount: number;
};

export function estimateInlineWidth(
  text: string,
  averageCharWidth = 7,
  horizontalPadding = 16,
): number {
  return text.length * averageCharWidth + horizontalPadding;
}

export function computeTagOverflow(input: TagOverflowInput): TagOverflowResult {
  const { availableWidth, titleWidth, minContentWidth, tagWidths, gap } = input;

  if (!Number.isFinite(availableWidth) || availableWidth <= 0 || tagWidths.length === 0) {
    return { visibleCount: tagWidths.length, collapsedCount: 0 };
  }

  const widthForTags = Math.max(0, availableWidth - titleWidth - minContentWidth);
  let consumed = 0;
  let visibleCount = 0;

  for (const width of tagWidths) {
    const next = visibleCount === 0 ? width : width + gap;
    if (consumed + next > widthForTags) {
      break;
    }
    consumed += next;
    visibleCount += 1;
  }

  const collapsedCount = Math.max(0, tagWidths.length - visibleCount);
  return { visibleCount, collapsedCount };
}
