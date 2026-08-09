import { describe, expect, it, vi } from 'vitest';
import { downloadMarkdownFile, suggestedMarkdownFileName } from '../downloadMarkdown';

describe('suggestedMarkdownFileName', () => {
  it('uses the item filename when present', () => {
    expect(suggestedMarkdownFileName({ filename: 'notes.md', title: 'My Notes' })).toBe('notes.md');
  });

  it('falls back to a lowercased title slug with the .md extension', () => {
    expect(suggestedMarkdownFileName({ filename: null, title: 'My Ideas' })).toBe('my-ideas.md');
    expect(suggestedMarkdownFileName({ filename: null, title: 'Deploy   Runbook' })).toBe(
      'deploy-runbook.md',
    );
  });

  it('falls back to note.md when the title produces an empty slug', () => {
    expect(suggestedMarkdownFileName({ filename: null, title: '' })).toBe('note.md');
    expect(suggestedMarkdownFileName({ filename: null, title: '   ' })).toBe('note.md');
  });
});

describe('downloadMarkdownFile', () => {
  it('downloads the content as a markdown blob with the suggested name', () => {
    const createObjectURL = vi.fn(() => 'blob:mock-url');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const append = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation((node: Node) => node);

    downloadMarkdownFile({ filename: 'notes.md', title: 'My Notes', content: '# Notes\n\nBody' });

    const anchor = append.mock.calls[0][0] as HTMLAnchorElement;
    expect(anchor.getAttribute('download')).toBe('notes.md');
    expect(anchor.getAttribute('href')).toBe('blob:mock-url');
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('writes the raw content to the blob', () => {
    const createObjectURL = vi.fn((blob: Blob) => `blob:${blob.size}`);
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL: vi.fn() });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    downloadMarkdownFile({ filename: null, title: 'Note', content: '# Heading' });

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/markdown;charset=utf-8');
    expect(blob.size).toBe('# Heading'.length);
  });
});
