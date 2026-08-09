import { describe, expect, it } from 'vitest';
import { collectionItemInputSchema, type CollectionItemInput } from '@conjuros/contracts';
import { MESSAGES, messageForInputError } from '../itemForm';

function messageFor(payload: Record<string, unknown>): string {
  const result = collectionItemInputSchema.safeParse(payload);
  const message = messageForInputError(payload as Partial<CollectionItemInput>, result);
  if (message === null) throw new Error('expected payload to fail validation');
  return message;
}

describe('messageForInputError', () => {
  it('returns null when the payload is valid', () => {
    const result = collectionItemInputSchema.safeParse({
      kind: 'markdown',
      title: 'Note',
      tags: [],
      relatedItemIds: [],
      content: 'Body',
      filename: 'note.md',
    });
    if (!result.success) throw new Error('expected payload to validate');
    expect(messageForInputError(result.data, result)).toBeNull();
  });

  it('reports an empty title as "Title is required"', () => {
    const message = messageFor({ kind: 'markdown', title: '', content: 'Body' });
    expect(message).toBe(MESSAGES.titleRequired);
  });

  it('reports a whitespace-only title as "Title is required"', () => {
    const message = messageFor({ kind: 'markdown', title: '   ', content: 'Body' });
    expect(message).toBe(MESSAGES.titleRequired);
  });

  it('reports empty content as "Content is required for a markdown note"', () => {
    const message = messageFor({ kind: 'markdown', title: 'Note', content: '' });
    expect(message).toBe(MESSAGES.contentRequired);
  });

  it('reports whitespace-only content as "Content is required for a markdown note"', () => {
    const message = messageFor({ kind: 'markdown', title: 'Note', content: '   ' });
    expect(message).toBe(MESSAGES.contentRequired);
  });

  it('reports a whitespace-only command as "Command is required for a spell"', () => {
    const message = messageFor({ kind: 'spell', title: 'Spell', command: '   ' });
    expect(message).toBe(MESSAGES.commandRequired);
  });

  it('reports an invalid URL as "URL must use the http or https protocol"', () => {
    const message = messageFor({ kind: 'web-link', title: 'Link', url: 'ftp://example.com' });
    expect(message).toBe(MESSAGES.invalidUrl);
  });

  it('reports a non-URL string for a web-link as the URL message', () => {
    const message = messageFor({ kind: 'web-link', title: 'Link', url: 'not-a-url' });
    expect(message).toBe(MESSAGES.invalidUrl);
  });

  it('reports an invalid filename as the friendly filename message', () => {
    const message = messageFor({
      kind: 'markdown',
      title: 'Note',
      content: 'Body',
      filename: 'note.txt',
    });
    expect(message).toBe(MESSAGES.filenameInvalid);
  });

  it('reports a path inside the filename as the friendly filename message', () => {
    const message = messageFor({
      kind: 'markdown',
      title: 'Note',
      content: 'Body',
      filename: 'folder/note.md',
    });
    expect(message).toBe(MESSAGES.filenameInvalid);
  });

  it('reports an empty filename as "Content is required" only when content is missing', () => {
    const message = messageFor({ kind: 'markdown', title: 'Note', content: '', filename: '' });
    expect(message).toBe(MESSAGES.contentRequired);
  });

  it('reports empty content for a file as "Content is required for a file"', () => {
    const message = messageFor({ kind: 'file', title: 'Log', content: '' });
    expect(message).toBe(MESSAGES.fileContentRequired);
  });

  it('reports whitespace-only content for a file as "Content is required for a file"', () => {
    const message = messageFor({ kind: 'file', title: 'Log', content: '   ' });
    expect(message).toBe(MESSAGES.fileContentRequired);
  });

  it('reports a missing filename for a file as "Filename is required for a file"', () => {
    const message = messageFor({ kind: 'file', title: 'Log', content: 'Body', filename: '' });
    expect(message).toBe(MESSAGES.fileFilenameRequired);
  });

  it('accepts a file filename without requiring a markdown extension', () => {
    const result = collectionItemInputSchema.safeParse({
      kind: 'file',
      title: 'Log',
      tags: [],
      relatedItemIds: [],
      content: 'Body',
      filename: 'server.log',
    });
    expect(result.success).toBe(true);
  });

  it('reports a too-long file filename as the friendly file filename message', () => {
    const message = messageFor({
      kind: 'file',
      title: 'Log',
      content: 'Body',
      filename: `${'a'.repeat(129)}.txt`,
    });
    expect(message).toBe(MESSAGES.fileFilenameInvalid);
  });

  it('reports a path inside a file filename as the friendly file filename message', () => {
    const message = messageFor({
      kind: 'file',
      title: 'Log',
      content: 'Body',
      filename: 'folder/server.log',
    });
    expect(message).toBe(MESSAGES.fileFilenameInvalid);
  });

  it('falls back to the generic message for unexpected failures', () => {
    const message = messageFor({ kind: 'spell', title: 'Long', command: 'ok', tags: 'not-an-array' });
    expect(message).toBe(MESSAGES.generic);
  });

  it('never returns the raw Zod message', () => {
    const cases: Array<Record<string, unknown>> = [
      { kind: 'markdown', title: '', content: 'Body' },
      { kind: 'markdown', title: 'Note', content: '   ' },
      { kind: 'markdown', title: 'Note', content: 'Body', filename: 'bad-name' },
      { kind: 'spell', title: 'Spell', command: '   ' },
      { kind: 'web-link', title: 'Link', url: 'ftp://example.com' },
    ];
    for (const payload of cases) {
      expect(messageFor(payload)).not.toContain('String must contain at least 1 character(s)');
    }
  });
});
