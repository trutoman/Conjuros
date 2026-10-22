// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const storageApi = vi.hoisted(() => ({
  upload: vi.fn(),
  createSignedUrl: vi.fn(),
  remove: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ storage: { from: () => storageApi } }),
}));

const { SupabaseAttachmentStorage } = await import('../../api/storage/storage');
const { toStorageError } = await import('../../api/storage/storageErrors');

function createStorage() {
  return new SupabaseAttachmentStorage('https://project.supabase.co', 'service-role-key', 'attachments');
}

async function rejectionOf(run: () => Promise<unknown>) {
  try {
    await run();
  } catch (error) {
    return error as { status: number; code: string; message: string };
  }
  throw new Error('Expected the storage call to fail');
}

const pdf = Buffer.from('%PDF-1.4\n');

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  storageApi.upload.mockReset();
  storageApi.createSignedUrl.mockReset();
  storageApi.remove.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SupabaseAttachmentStorage error translation', () => {
  it('maps a bucket MIME rejection to an unsupported type error', async () => {
    storageApi.upload.mockResolvedValue({
      error: { message: 'mime type application/pdf is not supported', statusCode: '400' },
    });

    const error = await rejectionOf(() => createStorage().upload('user/id.pdf', pdf, 'application/pdf'));

    expect(error.status).toBe(415);
    expect(error.code).toBe('UNSUPPORTED_FILE_TYPE');
    expect(error.message).not.toContain('application/pdf');
  });

  it('maps a bucket size rejection to a too-large error', async () => {
    storageApi.upload.mockResolvedValue({
      error: { message: 'The object exceeded the maximum allowed size', statusCode: '413' },
    });

    const error = await rejectionOf(() => createStorage().upload('user/id.pdf', pdf, 'application/pdf'));

    expect(error.status).toBe(413);
    expect(error.code).toBe('FILE_TOO_LARGE');
  });

  it('reports a missing bucket as unconfigured storage', async () => {
    storageApi.upload.mockResolvedValue({ error: { message: 'Bucket not found', statusCode: '404' } });

    const error = await rejectionOf(() => createStorage().upload('user/id.pdf', pdf, 'application/pdf'));

    expect(error.status).toBe(503);
    expect(error.code).toBe('STORAGE_NOT_CONFIGURED');
  });

  it('reports an unknown failure as a transient storage outage', async () => {
    storageApi.upload.mockResolvedValue({ error: { message: 'fetch failed' } });

    const error = await rejectionOf(() => createStorage().upload('user/id.pdf', pdf, 'application/pdf'));

    expect(error.status).toBe(503);
    expect(error.code).toBe('STORAGE_UNAVAILABLE');
  });

  it('reports a missing object as not found when signing a download', async () => {
    storageApi.createSignedUrl.mockResolvedValue({
      data: null,
      error: { message: 'Object not found', statusCode: '404' },
    });

    const error = await rejectionOf(() => createStorage().createSignedUrl('user/id.pdf', 300, 'a.pdf'));

    expect(error.status).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });

  it('signs downloads and keeps the requested file name', async () => {
    storageApi.createSignedUrl.mockResolvedValue({
      data: { signedUrl: 'https://storage.test/a.pdf?token=1' },
      error: null,
    });

    await expect(createStorage().createSignedUrl('user/id.pdf', 300, 'report.pdf')).resolves.toBe(
      'https://storage.test/a.pdf?token=1',
    );
    expect(storageApi.createSignedUrl).toHaveBeenCalledWith('user/id.pdf', 300, {
      download: 'report.pdf',
    });
  });

  it('maps a removal failure and skips an empty removal', async () => {
    storageApi.remove.mockResolvedValue({ error: { message: 'Internal error' } });

    const error = await rejectionOf(() => createStorage().remove(['user/id.pdf']));
    expect(error.code).toBe('STORAGE_UNAVAILABLE');

    await createStorage().remove([]);
    expect(storageApi.remove).toHaveBeenCalledTimes(1);
  });

  it('uploads under the given path with the declared type and no overwrite', async () => {
    storageApi.upload.mockResolvedValue({ error: null });

    await createStorage().upload('user/id.pdf', pdf, 'application/pdf');

    expect(storageApi.upload).toHaveBeenCalledWith('user/id.pdf', pdf, {
      contentType: 'application/pdf',
      upsert: false,
    });
  });
});

describe('toStorageError', () => {
  it('accepts a plain message as well as an error object', () => {
    expect(toStorageError('mime type text/html is not supported').code).toBe('UNSUPPORTED_FILE_TYPE');
    expect(toStorageError(new Error('Payload too large')).code).toBe('FILE_TOO_LARGE');
  });

  it('falls back to a generic outage for unknown failures', () => {
    expect(toStorageError(null)).toMatchObject({
      status: 503,
      code: 'STORAGE_UNAVAILABLE',
    });
  });
});
