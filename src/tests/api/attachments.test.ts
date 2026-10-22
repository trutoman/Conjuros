import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { AppError } from '../../api/errors';
import { InMemoryAttachmentStorage } from '../../api/storage/storage';
import { createTestApp, registerUser } from './testApp';

// Mirrors the seam: the real storage maps Supabase failures onto AppError before throwing.
class TogglingStorage extends InMemoryAttachmentStorage {
  failure: Error | null = null;

  override async upload(path: string, body: Buffer, contentType: string): Promise<void> {
    if (this.failure) throw this.failure;
    return super.upload(path, body, contentType);
  }
}

const pdf = Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(200, 0x20)]);
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(100, 1),
]);
const exe = Buffer.concat([Buffer.from('MZ'), Buffer.alloc(100, 3)]);

type TestContext = ReturnType<typeof createTestApp>;

async function createAttachment(context: TestContext, cookie: string, body: object = {}) {
  const response = await request(context.app)
    .post('/api/items')
    .set('Cookie', cookie)
    .send({ kind: 'attachment', title: 'Report', tags: [], relatedItemIds: [], ...body })
    .expect(201);
  return response.body as { id: string; filename: string | null; storagePath: string | null };
}

function upload(
  context: TestContext,
  cookie: string,
  itemId: string,
  file: { buffer: Buffer; filename: string; contentType: string },
) {
  return request(context.app)
    .put(`/api/items/${itemId}/attachment`)
    .set('Cookie', cookie)
    .attach('file', file.buffer, { filename: file.filename, contentType: file.contentType });
}

const pdfFile = { buffer: pdf, filename: 'Factura 2026 (final).pdf', contentType: 'application/pdf' };

function storage(context: TestContext) {
  return context.storage as InMemoryAttachmentStorage;
}

describe('attachment file endpoints', () => {
  it('stores an uploaded file under an owner-scoped path and records metadata', async () => {
    const context = createTestApp();
    const cookie = await registerUser(request, context.app, 'owner@example.com');
    const item = await createAttachment(context, cookie);

    const response = await upload(context, cookie, item.id, pdfFile).expect(200);

    expect(response.body.storagePath).toMatch(/^[^/]+\/[0-9a-f-]{36}\.pdf$/);
    expect(response.body.storagePath).not.toContain('Factura');
    expect(response.body.filename).toBe('Factura 2026 (final).pdf');
    expect(storage(context).objects.has(response.body.storagePath)).toBe(true);
    const listed = await request(context.app).get('/api/items').set('Cookie', cookie).expect(200);
    expect(listed.body.items[0].storagePath).toBe(response.body.storagePath);
  });

  it('keeps an existing filename and derives the extension from the validated type', async () => {
    const context = createTestApp();
    const cookie = await registerUser(request, context.app, 'owner@example.com');
    const item = await createAttachment(context, cookie, { filename: 'mine.jpg' });

    const response = await upload(context, cookie, item.id, {
      buffer: png,
      filename: 'photo.jpg',
      contentType: 'image/png',
    }).expect(200);

    expect(response.body.filename).toBe('mine.jpg');
    expect(response.body.storagePath).toMatch(/\.png$/);
  });

  it('replaces the previous object on a second upload', async () => {
    const context = createTestApp();
    const cookie = await registerUser(request, context.app, 'owner@example.com');
    const item = await createAttachment(context, cookie);
    const first = await upload(context, cookie, item.id, pdfFile).expect(200);

    const second = await upload(context, cookie, item.id, {
      buffer: png,
      filename: 'next.png',
      contentType: 'image/png',
    }).expect(200);

    expect(second.body.storagePath).not.toBe(first.body.storagePath);
    expect([...storage(context).objects.keys()]).toEqual([second.body.storagePath]);
  });

  it('returns a five-minute signed URL that keeps the original name', async () => {
    const context = createTestApp();
    const cookie = await registerUser(request, context.app, 'owner@example.com');
    const item = await createAttachment(context, cookie);
    await upload(context, cookie, item.id, pdfFile).expect(200);

    const response = await request(context.app)
      .get(`/api/items/${item.id}/attachment/download`)
      .set('Cookie', cookie)
      .expect(200);

    expect(response.body.expiresInSeconds).toBe(300);
    expect(response.body.url).toContain('expires=300');
    expect(new URL(response.body.url).searchParams.get('download')).toBe('Factura 2026 (final).pdf');
  });

  it('answers not found when there is no file to download', async () => {
    const context = createTestApp();
    const cookie = await registerUser(request, context.app, 'owner@example.com');
    const item = await createAttachment(context, cookie);

    await request(context.app)
      .get(`/api/items/${item.id}/attachment/download`)
      .set('Cookie', cookie)
      .expect(404);
  });

  it('removes the file and keeps the item', async () => {
    const context = createTestApp();
    const cookie = await registerUser(request, context.app, 'owner@example.com');
    const item = await createAttachment(context, cookie);
    await upload(context, cookie, item.id, pdfFile).expect(200);

    const response = await request(context.app)
      .delete(`/api/items/${item.id}/attachment`)
      .set('Cookie', cookie)
      .expect(200);

    expect(response.body.storagePath).toBeNull();
    expect(storage(context).objects.size).toBe(0);
    await request(context.app)
      .get(`/api/items/${item.id}/attachment/download`)
      .set('Cookie', cookie)
      .expect(404);
    await request(context.app).get(`/api/items/${item.id}`).set('Cookie', cookie).expect(200);
  });

  it('deletes the stored object together with the item', async () => {
    const context = createTestApp();
    const cookie = await registerUser(request, context.app, 'owner@example.com');
    const item = await createAttachment(context, cookie);
    await upload(context, cookie, item.id, pdfFile).expect(200);

    await request(context.app).delete(`/api/items/${item.id}`).set('Cookie', cookie).expect(204);

    expect(storage(context).objects.size).toBe(0);
  });

  it.each([
    [
      'an unsupported declared type',
      { buffer: exe, filename: 'setup.exe', contentType: 'application/x-msdownload' },
    ],
    ['content that does not match the declared type', { buffer: exe, filename: 'a.pdf', contentType: 'application/pdf' }],
  ])('rejects %s without storing anything', async (_label, file) => {
    const context = createTestApp();
    const cookie = await registerUser(request, context.app, 'owner@example.com');
    const item = await createAttachment(context, cookie);

    const response = await upload(context, cookie, item.id, file).expect(415);

    expect(response.body.error.code).toBe('UNSUPPORTED_FILE_TYPE');
    expect(storage(context).objects.size).toBe(0);
  });

  it('rejects an oversized file', async () => {
    const context = createTestApp({ maxBytes: 100 });
    const cookie = await registerUser(request, context.app, 'owner@example.com');
    const item = await createAttachment(context, cookie);

    const response = await upload(context, cookie, item.id, pdfFile).expect(413);

    expect(response.body.error.code).toBe('FILE_TOO_LARGE');
    expect(storage(context).objects.size).toBe(0);
  });

  it('rejects an empty file', async () => {
    const context = createTestApp();
    const cookie = await registerUser(request, context.app, 'owner@example.com');
    const item = await createAttachment(context, cookie);

    await upload(context, cookie, item.id, {
      buffer: Buffer.alloc(0),
      filename: 'empty.pdf',
      contentType: 'application/pdf',
    }).expect(400);

    expect(storage(context).objects.size).toBe(0);
  });

  it('only accepts files for attachment items', async () => {
    const context = createTestApp();
    const cookie = await registerUser(request, context.app, 'owner@example.com');
    const command = await request(context.app)
      .post('/api/items')
      .set('Cookie', cookie)
      .send({ kind: 'command', title: 'Status', tags: [], relatedItemIds: [], command: 'git status' })
      .expect(201);

    await upload(context, cookie, command.body.id, pdfFile).expect(409);
    expect(storage(context).objects.size).toBe(0);
  });

  it('isolates files between users and requires a session', async () => {
    const context = createTestApp();
    const ownerCookie = await registerUser(request, context.app, 'owner@example.com');
    const otherCookie = await registerUser(request, context.app, 'other@example.com');
    const item = await createAttachment(context, ownerCookie);
    const stored = await upload(context, ownerCookie, item.id, pdfFile).expect(200);

    await upload(context, otherCookie, item.id, pdfFile).expect(404);
    await request(context.app)
      .get(`/api/items/${item.id}/attachment/download`)
      .set('Cookie', otherCookie)
      .expect(404);
    await request(context.app)
      .delete(`/api/items/${item.id}/attachment`)
      .set('Cookie', otherCookie)
      .expect(404);
    await request(context.app).get(`/api/items/${item.id}/attachment/download`).expect(401);
    await request(context.app).put(`/api/items/${item.id}/attachment`).expect(401);

    expect([...storage(context).objects.keys()]).toEqual([stored.body.storagePath]);
  });

  it('blocks changing the kind of an item that has a stored file', async () => {
    const context = createTestApp();
    const cookie = await registerUser(request, context.app, 'owner@example.com');
    const item = await createAttachment(context, cookie);
    await upload(context, cookie, item.id, pdfFile).expect(200);

    await request(context.app)
      .patch(`/api/items/${item.id}`)
      .set('Cookie', cookie)
      .send({ kind: 'command', command: 'echo hi' })
      .expect(409);

    const current = await request(context.app).get(`/api/items/${item.id}`).set('Cookie', cookie);
    expect(current.body.kind).toBe('attachment');
    expect(current.body.storagePath).not.toBeNull();
  });

  it('rejects a client-provided storage path on update', async () => {
    const context = createTestApp();
    const cookie = await registerUser(request, context.app, 'owner@example.com');
    const item = await createAttachment(context, cookie);

    await request(context.app)
      .patch(`/api/items/${item.id}`)
      .set('Cookie', cookie)
      .send({ storagePath: 'someone/else.pdf' })
      .expect(400);
  });

  it('answers 503 without storage configuration while metadata still works', async () => {
    const context = createTestApp({ storage: null });
    const cookie = await registerUser(request, context.app, 'owner@example.com');
    const item = await createAttachment(context, cookie, { filename: 'plan.pdf' });

    const response = await upload(context, cookie, item.id, pdfFile).expect(503);
    expect(response.body.error.code).toBe('STORAGE_NOT_CONFIGURED');
    await request(context.app)
      .get(`/api/items/${item.id}/attachment/download`)
      .set('Cookie', cookie)
      .expect(503);
    await request(context.app)
      .patch(`/api/items/${item.id}`)
      .set('Cookie', cookie)
      .send({ title: 'Renamed' })
      .expect(200);
  });

  it('keeps the stored file when the bucket rejects the replacement', async () => {
    const storage = new TogglingStorage();
    const context = createTestApp({ storage });
    const cookie = await registerUser(request, context.app, 'owner@example.com');
    const item = await createAttachment(context, cookie);
    const stored = await upload(context, cookie, item.id, pdfFile).expect(200);

    storage.failure = new AppError(
      415,
      'UNSUPPORTED_FILE_TYPE',
      'File storage does not accept this file type',
    );
    const rejected = await upload(context, cookie, item.id, {
      buffer: png,
      filename: 'next.png',
      contentType: 'image/png',
    }).expect(415);
    storage.failure = null;

    expect(rejected.body.error.code).toBe('UNSUPPORTED_FILE_TYPE');
    expect([...storage.objects.keys()]).toEqual([stored.body.storagePath]);
    const current = await request(context.app).get(`/api/items/${item.id}`).set('Cookie', cookie);
    expect(current.body.storagePath).toBe(stored.body.storagePath);
    expect(current.body.filename).toBe('Factura 2026 (final).pdf');
    await request(context.app)
      .get(`/api/items/${item.id}/attachment/download`)
      .set('Cookie', cookie)
      .expect(200);
  });

  it('keeps the stored file when storage is unavailable', async () => {
    const storage = new TogglingStorage();
    const context = createTestApp({ storage });
    const cookie = await registerUser(request, context.app, 'owner@example.com');
    const item = await createAttachment(context, cookie);
    const stored = await upload(context, cookie, item.id, pdfFile).expect(200);

    storage.failure = new AppError(503, 'STORAGE_UNAVAILABLE', 'File storage is unavailable, please try again');
    const response = await upload(context, cookie, item.id, {
      buffer: png,
      filename: 'next.png',
      contentType: 'image/png',
    }).expect(503);
    storage.failure = null;

    expect(response.body.error.code).toBe('STORAGE_UNAVAILABLE');
    expect([...storage.objects.keys()]).toEqual([stored.body.storagePath]);

    // The metadata row survived the failed replacement, so the file can still be removed.
    const removed = await request(context.app)
      .delete(`/api/items/${item.id}/attachment`)
      .set('Cookie', cookie)
      .expect(200);
    expect(removed.body.storagePath).toBeNull();
    expect(storage.objects.size).toBe(0);
  });
});
