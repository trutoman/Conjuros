import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { themeImageMaxBytes } from '@conjuros/contracts';
import { createTestApp, registerUser, validPassword } from './testApp';
import { buildSeedThemes } from '../../api/repositories/themeSeed';
import { grantAdminRole } from '../../api/bootstrap';
import { ThemesService } from '../../api/services/themes.service';
import type { InMemoryThemeImageStorage } from '../../api/storage/themeImageStorage';

const pngBytes = (size = 64) =>
  Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(size - 8)]);
const jpegBytes = (size = 64) => Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(size - 3)]);
const webpBytes = (size = 64) =>
  Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP'), Buffer.alloc(size - 12)]);
const gifBytes = (size = 64) => Buffer.concat([Buffer.from('GIF89a'), Buffer.alloc(size - 6)]);

async function setup(options: Parameters<typeof createTestApp>[0] = {}) {
  const context = createTestApp(options);
  await new ThemesService(context.themes, context.userPreferences).ensureSeeded();
  const registered = await request(context.app)
    .post('/api/auth/register')
    .send({ email: 'admin@example.com', password: validPassword })
    .expect(201);
  await grantAdminRole(context.users, 'admin@example.com');
  const cookie = registered.headers['set-cookie'][0] as string;
  const all = await context.themes.findAll();
  const objects = context.themeImages ? (context.themeImages as InMemoryThemeImageStorage).objects : new Map();
  return {
    ...context,
    objects,
    cookie,
    lightId: all.find((theme) => theme.name === 'light')!.id,
    darkId: all.find((theme) => theme.name === 'dark')!.id,
  };
}

type Context = Awaited<ReturnType<typeof setup>>;

function upload(context: Context, themeId: string, body: Buffer, filename: string, contentType: string, cookie = context.cookie) {
  return request(context.app)
    .post(`/api/themes/${themeId}/image-backdrop`)
    .set('Cookie', cookie)
    .attach('image', body, { filename, contentType });
}

describe('theme image upload', () => {
  it('stores a valid PNG under the theme path and references it', async () => {
    const context = await setup();

    const response = await upload(context, context.lightId, pngBytes(), 'background.png', 'image/png').expect(200);

    expect(response.body.imageBackdrop).toMatchObject({ mimeType: 'image/png', sizeBytes: 64 });
    expect(response.body.imageBackdrop.storagePath).toMatch(new RegExp(`^themes/${context.lightId}/[0-9a-f-]+\\.png$`));
    expect(response.body.imageBackdropUrl).toBe(`https://storage.test/public/${response.body.imageBackdrop.storagePath}`);
    expect(context.objects.has(response.body.imageBackdrop.storagePath)).toBe(true);
  });

  it('ignores the client file name in the storage path', async () => {
    const context = await setup();

    const response = await upload(context, context.lightId, webpBytes(), 'Fondo final (v2).webp', 'image/webp').expect(200);

    expect(response.body.imageBackdrop.storagePath).toMatch(/\.webp$/);
    expect(response.body.imageBackdrop.storagePath).not.toContain('Fondo');
  });

  it('stores JPEG with a jpg extension', async () => {
    const context = await setup();

    const response = await upload(context, context.lightId, jpegBytes(), 'photo.jpeg', 'image/jpeg').expect(200);

    expect(response.body.imageBackdrop.storagePath).toMatch(/\.jpg$/);
  });

  it('refuses non-administrators with 403 and stores nothing', async () => {
    const context = await setup();
    const userCookie = await registerUser(request, context.app, 'user@example.com');

    await upload(context, context.lightId, pngBytes(), 'background.png', 'image/png', userCookie).expect(403);

    expect(context.objects.size).toBe(0);
  });

  it('refuses unsupported types with 415 and stores nothing', async () => {
    const context = await setup();

    await upload(context, context.lightId, gifBytes(), 'background.gif', 'image/gif').expect(415);

    expect(context.objects.size).toBe(0);
  });

  it('refuses content that does not match the declared type with 415', async () => {
    const context = await setup();

    await upload(context, context.lightId, jpegBytes(), 'background.png', 'image/png').expect(415);

    expect(context.objects.size).toBe(0);
  });

  it('refuses files above 5 MB with 413', async () => {
    const context = await setup();

    await upload(context, context.lightId, pngBytes(themeImageMaxBytes + 1), 'huge.png', 'image/png').expect(413);

    expect(context.objects.size).toBe(0);
  });

  it('answers 503 when theme image storage is not configured', async () => {
    const context = await setup({ themeImages: null });

    const response = await upload(context, context.lightId, pngBytes(), 'background.png', 'image/png').expect(503);

    expect(response.body.error.code).toBe('STORAGE_NOT_CONFIGURED');
  });

  it('keeps the previous object when an image is replaced', async () => {
    const context = await setup();
    const first = await upload(context, context.lightId, pngBytes(), 'a.png', 'image/png').expect(200);

    const second = await upload(context, context.lightId, webpBytes(), 'b.webp', 'image/webp').expect(200);

    expect(second.body.imageBackdrop.storagePath).not.toBe(first.body.imageBackdrop.storagePath);
    expect(context.objects.has(first.body.imageBackdrop.storagePath)).toBe(true);
    expect(context.objects.has(second.body.imageBackdrop.storagePath)).toBe(true);
  });

  it('leaves the current reference unchanged when a replacement is refused', async () => {
    const context = await setup();
    const first = await upload(context, context.lightId, pngBytes(), 'a.png', 'image/png').expect(200);

    await upload(context, context.lightId, gifBytes(), 'b.gif', 'image/gif').expect(415);

    const stored = await context.themes.findById(context.lightId);
    expect(stored!.imageBackdrop!.storagePath).toBe(first.body.imageBackdrop.storagePath);
    expect(context.objects.has(first.body.imageBackdrop.storagePath)).toBe(true);
  });

  it('keeps stored images when the theme is deleted', async () => {
    const context = await setup();
    const uploaded = await upload(context, context.darkId, pngBytes(), 'dark.png', 'image/png').expect(200);

    await request(context.app).delete(`/api/themes/${context.darkId}`).set('Cookie', context.cookie).expect(204);

    expect(context.objects.has(uploaded.body.imageBackdrop.storagePath)).toBe(true);
  });
});

describe('image mode flag', () => {
  it('refuses to create a theme in image mode', async () => {
    const context = await setup();

    await request(context.app)
      .post('/api/themes')
      .set('Cookie', context.cookie)
      .send({ ...buildSeedThemes()[0], name: 'image-first', label: 'Image first', useImageBackdrop: true })
      .expect(400);
  });

  it('refuses to enable image mode before an image is uploaded', async () => {
    const context = await setup();

    const response = await request(context.app)
      .patch(`/api/themes/${context.lightId}`)
      .set('Cookie', context.cookie)
      .send({ useImageBackdrop: true })
      .expect(400);

    expect(response.body.error.message).toMatch(/requires an uploaded image/);
  });

  it('enables image mode once an image is stored', async () => {
    const context = await setup();
    await upload(context, context.lightId, pngBytes(), 'a.png', 'image/png').expect(200);

    const response = await request(context.app)
      .patch(`/api/themes/${context.lightId}`)
      .set('Cookie', context.cookie)
      .send({ useImageBackdrop: true })
      .expect(200);

    expect(response.body.useImageBackdrop).toBe(true);
    expect(response.body.imageBackdrop).not.toBeNull();
  });

  it('ignores a client-supplied image reference on update', async () => {
    const context = await setup();

    const response = await request(context.app)
      .patch(`/api/themes/${context.lightId}`)
      .set('Cookie', context.cookie)
      .send({ label: 'Light', imageBackdrop: { storagePath: 'themes/other/x.png', mimeType: 'image/png', sizeBytes: 1 } })
      .expect(200);

    expect(response.body.imageBackdrop).toBeNull();
  });
});
