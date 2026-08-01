import {
  collectionItemInputSchema,
  normalizeTags,
  reorderItemSchema,
  tagInputSchema,
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

  it('requires a non-empty trimmed tag category', () => {
    expect(
      tagInputSchema.safeParse({
        tagName: 'deploy.todo',
        tagCategory: '   ',
        description: '',
        color: '#123ABC',
      }).success,
    ).toBe(false);

    expect(
      tagInputSchema.parse({
        tagName: 'deploy.todo',
        tagCategory: ' Work ',
        description: '',
        color: '#123ABC',
      }).tagCategory,
    ).toBe('Work');
  });
});