import {
  collectionItemInputSchema,
  collectionItemSchema,
  collectionItemUpdateSchema,
  markdownUpdateCandidateSchema,
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
      filename: 'notes.md',
    });

    if (parsed.kind !== 'markdown') throw new Error('Expected a markdown item');
    expect(parsed.content).toBe(content);
  });

  it('allows markdown items without a description', () => {
    const parsed = collectionItemInputSchema.safeParse({
      kind: 'markdown',
      title: 'Notes',
      tags: [],
      relatedItemIds: [],
      content: '# Notes',
      filename: 'notes.md',
    });
    expect(parsed.success).toBe(true);
  });

  it('allows markdown items with a description', () => {
    const parsed = collectionItemInputSchema.parse({
      kind: 'markdown',
      title: 'Notes',
      description: 'A short summary',
      tags: [],
      relatedItemIds: [],
      content: '# Notes',
      filename: 'notes.md',
    });
    if (parsed.kind !== 'markdown') throw new Error('Expected a markdown item');
    expect(parsed.description).toBe('A short summary');
  });

  it('accepts a null description in the read model', () => {
    const item = {
      id: 'markdown-1',
      kind: 'markdown',
      title: 'Notes',
      description: null,
      tags: [],
      order: 1,
      relatedItemIds: [],
      command: null,
      url: null,
      content: '# Notes',
      filename: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    expect(collectionItemSchema.safeParse(item).success).toBe(true);
  });

  it('allows markdown updates to carry a description', () => {
    expect(
      collectionItemUpdateSchema.safeParse({ kind: 'markdown', description: 'Updated summary' })
        .success,
    ).toBe(true);
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
        filename: 'notes.md',
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
      filename: 'notes.md',
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

  it('accepts a filename in the read model', () => {
    const item = {
      id: 'markdown-1',
      kind: 'markdown',
      title: 'Notes',
      description: null,
      tags: [],
      order: 1,
      relatedItemIds: [],
      command: null,
      url: null,
      content: '# Notes',
      filename: 'notes.md',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    expect(collectionItemSchema.safeParse(item).success).toBe(true);
  });

  it('allows a markdown item with a trimmed valid filename', () => {
    const parsed = collectionItemInputSchema.parse({
      kind: 'markdown',
      title: 'Notes',
      description: '',
      tags: ['docs'],
      relatedItemIds: [],
      content: '# Notes',
      filename: ' notes.md ',
    });
    if (parsed.kind !== 'markdown') throw new Error('Expected a markdown item');
    expect(parsed.filename).toBe('notes.md');
  });

  it('rejects creating a markdown item without a filename', () => {
    expect(
      collectionItemInputSchema.safeParse({
        kind: 'markdown',
        title: 'Notes',
        description: '',
        tags: [],
        relatedItemIds: [],
        content: '# Notes',
      }).success,
    ).toBe(false);
    expect(
      collectionItemInputSchema.safeParse({
        kind: 'markdown',
        title: 'Notes',
        description: '',
        tags: [],
        relatedItemIds: [],
        content: '# Notes',
        filename: '   ',
      }).success,
    ).toBe(false);
  });

  it('allows markdown updates to set or clear the filename', () => {
    expect(
      collectionItemUpdateSchema.safeParse({ kind: 'markdown', filename: 'research.md' }).success,
    ).toBe(true);
    const cleared = collectionItemUpdateSchema.parse({ kind: 'markdown', filename: '  ' });
    expect(cleared.filename).toBe('');
  });

  it('marks the update candidate with a cleared or legacy filename', () => {
    const set = markdownUpdateCandidateSchema.parse({
      kind: 'markdown',
      title: 'Notes',
      description: '',
      tags: [],
      relatedItemIds: [],
      content: '# Notes',
      filename: 'research.md',
    });
    expect(set.filename).toBe('research.md');
    const cleared = markdownUpdateCandidateSchema.parse({
      kind: 'markdown',
      title: 'Notes',
      description: '',
      tags: [],
      relatedItemIds: [],
      content: '# Notes',
      filename: '',
    });
    expect(cleared.filename).toBe('');
  });

  it('rejects markdown filenames that are not plain .md file names', () => {
    const too = `${'a'.repeat(65)}.md`;
    for (const invalid of [
      'folder/notes.md',
      'folder\\notes.md',
      'notes.txt',
      'notes',
      too,
    ]) {
      expect(
        collectionItemInputSchema.safeParse({
          kind: 'markdown',
          title: 'Notes',
          description: '',
          tags: [],
          relatedItemIds: [],
          content: '# Notes',
          filename: invalid,
        }).success,
      ).toBe(false);
    }
  });

  it('rejects a filename on non-markdown items', () => {
    expect(
      collectionItemInputSchema.safeParse({
        kind: 'spell',
        title: 'Status',
        description: '',
        tags: [],
        relatedItemIds: [],
        command: 'git status',
        filename: 'status.md',
      }).success,
    ).toBe(false);
    expect(
      collectionItemInputSchema.safeParse({
        kind: 'web-link',
        title: 'Docs',
        description: '',
        tags: [],
        relatedItemIds: [],
        url: 'https://example.com',
        filename: 'docs.md',
      }).success,
    ).toBe(false);
    expect(collectionItemUpdateSchema.safeParse({ kind: 'spell', filename: 'spin.md' }).success).toBe(
      false,
    );
    expect(
      collectionItemUpdateSchema.safeParse({ kind: 'web-link', filename: 'docs.md' }).success,
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
