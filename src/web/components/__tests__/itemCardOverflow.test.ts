import { describe, expect, it } from 'vitest';
import { computeTagOverflow } from '../itemCardOverflow';

describe('computeTagOverflow', () => {
  it('keeps all tags visible when available width is unconstrained', () => {
    const result = computeTagOverflow({
      availableWidth: Number.POSITIVE_INFINITY,
      titleWidth: 80,
      minContentWidth: 32,
      tagWidths: [60, 70, 80],
      gap: 6,
    });

    expect(result).toEqual({ visibleCount: 3, collapsedCount: 0 });
  });

  it('collapses tags when space remains only for a subset', () => {
    const result = computeTagOverflow({
      availableWidth: 260,
      titleWidth: 120,
      minContentWidth: 32,
      tagWidths: [48, 64, 72],
      gap: 6,
    });

    expect(result.visibleCount).toBe(1);
    expect(result.collapsedCount).toBe(2);
  });

  it('collapses all tags when no width remains after title and min content', () => {
    const result = computeTagOverflow({
      availableWidth: 120,
      titleWidth: 100,
      minContentWidth: 32,
      tagWidths: [50, 60],
      gap: 6,
    });

    expect(result).toEqual({ visibleCount: 0, collapsedCount: 2 });
  });
});
