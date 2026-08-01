import type { CollectionItem, Tag } from '@conjuros/contracts';

export function createSpellItem(overrides: Partial<CollectionItem> = {}): CollectionItem {
  return {
    id: 'spell-1',
    kind: 'spell',
    title: 'Status',
    description: 'Check repository state',
    tags: ['git'],
    order: 1,
    relatedItemIds: [],
    command: 'git status --short',
    url: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createWebLinkItem(overrides: Partial<CollectionItem> = {}): CollectionItem {
  return {
    id: 'link-1',
    kind: 'web-link',
    title: 'Docs',
    description: '',
    tags: ['docs'],
    order: 2,
    relatedItemIds: [],
    command: null,
    url: 'https://example.com/docs',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createTag(
  tagName: string,
  color = '#123ABC',
  order = 1,
  tagCategory = 'General',
): Tag {
  return {
    id: `tag-${tagName}`,
    tagName,
    tagCategory,
    description: '',
    color,
    order,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

export const denseTags = [
  createTag('git', '#123ABC', 1),
  createTag('backend', '#AA44CC', 2),
  createTag('automation', '#DD5522', 3),
  createTag('infra', '#228855', 4),
];
