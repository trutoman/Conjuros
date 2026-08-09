import { describe, expect, it, vi } from 'vitest';
import { suggestedFileName, downloadTextFile } from '../downloadFile';

describe('suggestedFileName', () => {
  it('uses the item filename when present', () => {
    expect(suggestedFileName({ filename: 'deploy.log', title: 'Deploy Log' })).toBe('deploy.log');
  });

  it('falls back to a lowercased title slug without adding an extension', () => {
    expect(suggestedFileName({ filename: null, title: 'System Status' })).toBe('system-status');
    expect(suggestedFileName({ filename: null, title: 'Deploy   Runbook' })).toBe('deploy-runbook');
  });

  it('falls back to file when the title produces an empty slug', () => {
    expect(suggestedFileName({ filename: null, title: '' })).toBe('file');
    expect(suggestedFileName({ filename: null, title: '   ' })).toBe('file');
  });
});

describe('downloadTextFile', () => {
  it('downloads the content as a plain-text blob with the suggested name', () => {
    const createObjectURL = vi.fn(() => 'blob:mock-url');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const append = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation((node: Node) => node);

    downloadTextFile({ filename: 'deploy.log', title: 'Deploy Log', content: 'Line one\nLine two' });

    const anchor = append.mock.calls[0][0] as HTMLAnchorElement;
    expect(anchor.getAttribute('download')).toBe('deploy.log');
    expect(anchor.getAttribute('href')).toBe('blob:mock-url');
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('writes the raw content to the blob without transforming it', () => {
    const createObjectURL = vi.fn((blob: Blob) => `blob:${blob.size}`);
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL: vi.fn() });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    downloadTextFile({ filename: null, title: 'File', content: 'Started at 09:00\nFinished ok' });

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/plain;charset=utf-8');
    expect(blob.size).toBe('Started at 09:00\nFinished ok'.length);
  });
});