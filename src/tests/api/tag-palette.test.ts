import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createTestApp, registerUser } from './testApp';
import { ThemesService } from '../../api/services/themes.service';

function seededContext() {
  const context = createTestApp();
  const themesService = new ThemesService(context.themes, context.users);
  return { ...context, themesService };
}

describe('tag color palette enforcement', () => {
  it('rejects a tag color outside the active theme palette', async () => {
    const { app, themesService } = seededContext();
    await themesService.ensureSeeded();
    const cookie = await registerUser(request, app, 'owner@example.com');

    await request(app)
      .post('/api/tags')
      .set('Cookie', cookie)
      .send({ tagName: 'Work', tagCategory: 'General', description: '', color: '#123ABC' })
      .expect(400);
  });

  it('accepts a tag color from the active theme palette with case-insensitive comparison', async () => {
    const { app, themesService } = seededContext();
    await themesService.ensureSeeded();
    const cookie = await registerUser(request, app, 'owner@example.com');

    const created = await request(app)
      .post('/api/tags')
      .set('Cookie', cookie)
      .send({ tagName: 'Work', tagCategory: 'General', description: '', color: '#1a73e8' })
      .expect(201);

    expect(created.body.color).toBe('#1a73e8');
  });

  it('enforces the palette on color updates too', async () => {
    const { app, themesService } = seededContext();
    await themesService.ensureSeeded();
    const cookie = await registerUser(request, app, 'owner@example.com');

    const created = await request(app)
      .post('/api/tags')
      .set('Cookie', cookie)
      .send({ tagName: 'Work', tagCategory: 'General', description: '', color: '#1A73E8' })
      .expect(201);

    await request(app)
      .patch(`/api/tags/${created.body.id}`)
      .set('Cookie', cookie)
      .send({ color: '#ABCDEF' })
      .expect(400);
  });

  it('resolves the active palette from the user theme preference', async () => {
    const { app, themesService } = seededContext();
    await themesService.ensureSeeded();
    const cookie = await registerUser(request, app, 'owner@example.com');
    await request(app).patch('/api/auth/me/theme').set('Cookie', cookie).send({ theme: 'dark' }).expect(200);

    const dark = (await themesService.list({ limit: 50, skip: 0, sort: 'name' })).items.find(
      (theme) => theme.name === 'dark',
    )!;
    const paletteColor = dark.tagColorPalette[0];

    const created = await request(app)
      .post('/api/tags')
      .set('Cookie', cookie)
      .send({ tagName: 'Work', tagCategory: 'General', description: '', color: paletteColor })
      .expect(201);

    expect(created.body.color).toBe(paletteColor);
  });
});