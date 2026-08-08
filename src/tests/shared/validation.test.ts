import {
  collectionItemInputSchema,
  collectionItemUpdateSchema,
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

  it('preserves markdown content exactly as entered', () => {
    const content = '# Heading\n\nLine with `code` and **bold**.';
    const parsed = collectionItemInputSchema.parse({
      kind: 'markdown',
      title: 'Notes',
      description: '',
      tags: ['docs'],
      relatedItemIds: [],
      content,
    });

    if (parsed.kind !== 'markdown') throw new Error('Expected a markdown item');
    expect(parsed.content).toBe(content);
  });

  it('requires non-empty content for markdown items', () => {
    expect(
      collectionItemInputSchema.safeParse({
        kind: 'markdown',
        title: 'Notes',
        description: '',
        tags: [],
        relatedItemIds: [],
        content: '',
      }).success,
    ).toBe(false);
  });

  it('preserves long markdown content beyond the spell command limit', () => {
    const longContent = Array.from({ length: 2_500 }, () => 'lorem').join(' ');
    const parsed = collectionItemInputSchema.parse({
      kind: 'markdown',
      title: 'Notes',
      description: '',
      tags: [],
      relatedItemIds: [],
      content: longContent,
    });

    if (parsed.kind !== 'markdown') throw new Error('Expected a markdown item');
    expect(parsed.content).toBe(longContent);
  });

  it('rejects cross-kind fields in item updates', () => {
    expect(
      collectionItemUpdateSchema.safeParse({ kind: 'markdown', command: 'echo hi' }).success,
    ).toBe(false);
    expect(
      collectionItemUpdateSchema.safeParse({ kind: 'markdown', url: 'https://example.com' }).success,
    ).toBe(false);
    expect(
      collectionItemUpdateSchema.safeParse({ kind: 'spell', content: 'note' }).success,
    ).toBe(false);
    expect(
      collectionItemUpdateSchema.safeParse({ kind: 'web-link', content: 'note' }).success,
    ).toBe(false);
    expect(collectionItemUpdateSchema.safeParse({ kind: 'markdown', content: 'note' }).success).toBe(
      true,
    );
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

  it('rejects tag categories with characters other than alphanumeric characters and dots', () => {
    const base = {
      tagName: 'deploy.todo',
      description: '',
      color: '#123ABC',
    };

    expect(tagInputSchema.safeParse({ ...base, tagCategory: 'Work Todo' }).success).toBe(false);
    expect(tagInputSchema.safeParse({ ...base, tagCategory: 'work!' }).success).toBe(false);
    expect(tagInputSchema.safeParse({ ...base, tagCategory: 'Work-Tag' }).success).toBe(false);
    expect(tagInputSchema.safeParse({ ...base, tagCategory: 'dev.ops' }).success).toBe(true);
  });
});
