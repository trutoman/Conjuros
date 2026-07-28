import {
  collectionItemInputSchema,
  normalizeTags,
  reorderItemSchema,
} from '@conjuros/contracts';
import { describe, expect, it } from 'vitest';

describe('collection item contracts', () => {
  it('preserves spell commands exactly as entered', () => {
    const command = '  git status && echo "ready"  ';
    const parsed = collectionItemInputSchema.parse({
      kind: 'spell',
      title: 'Status',
      description: '',
      tags: ['Git'],
      relatedItemIds: [],
      command,
    });

    if (parsed.kind !== 'spell') throw new Error('Expected a spell');
    expect(parsed.command).toBe(command);
  });

  it('requires absolute HTTP URLs for web links', () => {
    expect(
      collectionItemInputSchema.safeParse({
        kind: 'web-link',
        title: 'Docs',
        description: '',
        tags: [],
        relatedItemIds: [],
        url: 'docs.example.com',
      }).success,
    ).toBe(false);
  });

  it('normalizes and de-duplicates tags', () => {
    expect(normalizeTags([' Git ', 'git', 'Frontend'])).toEqual(['git', 'frontend']);
  });

  it('only accepts positive integer reorder positions', () => {
    expect(reorderItemSchema.safeParse({ order: 0 }).success).toBe(false);
    expect(reorderItemSchema.parse({ order: 3 })).toEqual({ order: 3 });
  });
});