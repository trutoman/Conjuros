import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createTestApp, registerUser, validPassword } from './testApp';
import { buildSeedThemes } from '../../api/repositories/themeSeed';
import { grantAdminRole } from '../../api/bootstrap';
import { ThemesService } from '../../api/services/themes.service';

function createSeededTestApp() {
  const context = createTestApp();
  const service = new ThemesService(context.themes, context.users);
  return { ...context, themesService: service };
}

async function seedThemes(context: ReturnType<typeof createSeededTestApp>) {
  await context.themesService.ensureSeeded();
}

async function registerAdmin(
  app: ReturnType<typeof createTestApp>['app'],
  users: ReturnType<typeof createTestApp>['users'],
  email = 'admin@example.com',
) {
  const createResponse = await request(app)
    .post('/api/auth/register')
    .send({ email, password: validPassword })
    .expect(201);
  await grantAdminRole(users, email);
  return createResponse.headers['set-cookie'][0] as string;
}

describe('theme endpoints', () => {
  it('seeds the default light and dark themes on an empty collection', async () => {
    const context = createSeededTestApp();
    await seedThemes(context);

    const themes = await context.themesService.list({ limit: 50, skip: 0, sort: 'name' });
    expect(themes.total).toBe(2);
    const names = themes.items.map((theme) => theme.name).sort();
    expect(names).toEqual(['dark', 'light']);
    const light = themes.items.find((theme) => theme.name === 'light');
    expect(light).toMatchObject({ isDefault: true, kindColors: { spell: '#7c3aed' } });
    expect(light?.tagColorPalette.length).toBeGreaterThan(0);
  });

  it('keeps seed themes stable on repeat boots', async () => {
    const context = createSeededTestApp();
    await seedThemes(context);
    await seedThemes(context);
    const { total } = await context.themesService.list({ limit: 50, skip: 0, sort: 'name' });
    expect(total).toBe(2);
  });

  it('allows a non-admin to read themes and the active theme', async () => {
    const context = createSeededTestApp();
    await seedThemes(context);
    const cookie = await registerUser(request, context.app, 'user@example.com');

    const list = await request(context.app).get('/api/themes').set('Cookie', cookie).expect(200);
    expect(list.body.total).toBe(2);

    const active = await request(context.app).get('/api/themes/active').set('Cookie', cookie).expect(200);
    expect(active.body.theme.name).toBe('light');
    expect(active.body.source).toBe('preference');
  });

  it('rejects non-admin theme mutations with 403', async () => {
    const context = createSeededTestApp();
    await seedThemes(context);
    const cookie = await registerUser(request, context.app, 'user@example.com');

    const lightId = (await context.themesService.list({ limit: 50, skip: 0, sort: 'name' })).items.find(
      (theme) => theme.name === 'light',
    )!.id;

    await request(context.app)
      .post('/api/themes')
      .set('Cookie', cookie)
      .send(buildSeedThemes()[0])
      .expect(403);

    await request(context.app)
      .patch(`/api/themes/${lightId}`)
      .set('Cookie', cookie)
      .send({ label: 'Nope' })
      .expect(403);

    await request(context.app)
      .delete(`/api/themes/${lightId}`)
      .set('Cookie', cookie)
      .expect(403);

    await request(context.app)
      .patch(`/api/themes/${lightId}/activate`)
      .set('Cookie', cookie)
      .expect(403);
  });

  it('lets an admin create, update, activate, and delete a theme', async () => {
    const context = createSeededTestApp();
    await seedThemes(context);
    const cookie = await registerAdmin(context.app, context.users);

    const created = await request(context.app)
      .post('/api/themes')
      .set('Cookie', cookie)
      .send({
        name: 'sepia',
        label: 'Sepia',
        colors: buildSeedThemes()[0].colors,
        fonts: buildSeedThemes()[0].fonts,
        fontSizes: buildSeedThemes()[0].fontSizes,
        iconAssets: {
          spell: { path: 'M15 4V2 M15 16v-2 M3 21l9-9', viewBox: '0 0 24 24' },
          copy: { path: 'M10 8 H20 A2 2 0 0 1 22 10 V20', viewBox: '0 0 24 24' },
        },
        kindColors: buildSeedThemes()[0].kindColors,
        tagColorPalette: ['#8B5A2B', '#A0522D', '#D2B48C', '#CD853F', '#F5DEB3'],
        isDefault: false,
      })
      .expect(201);

    expect(created.body.name).toBe('sepia');
    expect(created.body.tagColorPalette).toEqual(['#8B5A2B', '#A0522D', '#D2B48C', '#CD853F', '#F5DEB3']);

    const id = created.body.id;
    const updated = await request(context.app)
      .patch(`/api/themes/${id}`)
      .set('Cookie', cookie)
      .send({ label: 'Warm Sepia' })
      .expect(200);
    expect(updated.body.label).toBe('Warm Sepia');

    const activated = await request(context.app)
      .patch(`/api/themes/${id}/activate`)
      .set('Cookie', cookie)
      .expect(200);
    expect(activated.body.isDefault).toBe(true);
    const lightId = (await context.themesService.list({ limit: 50, skip: 0, sort: 'name' })).items.find(
      (theme) => theme.name === 'light',
    )!.id;
    const light = await context.themesService.get(lightId);
    expect(light.isDefault).toBe(false);

    await request(context.app)
      .patch(`/api/themes/${lightId}/activate`)
      .set('Cookie', cookie)
      .expect(200);

    await request(context.app).delete(`/api/themes/${id}`).set('Cookie', cookie).expect(204);
    await request(context.app).get(`/api/themes/${id}`).set('Cookie', cookie).expect(404);
  });

  it('does not allow deleting the default theme', async () => {
    const context = createSeededTestApp();
    await seedThemes(context);
    const cookie = await registerAdmin(context.app, context.users);
    const lightId = (await context.themesService.list({ limit: 50, skip: 0, sort: 'name' })).items.find(
      (theme) => theme.name === 'light',
    )!.id;

    await request(context.app).delete(`/api/themes/${lightId}`).set('Cookie', cookie).expect(409);
  });

  it('rejects duplicate theme names with 409', async () => {
    const context = createSeededTestApp();
    await seedThemes(context);
    const cookie = await registerAdmin(context.app, context.users);

    await request(context.app)
      .post('/api/themes')
      .set('Cookie', cookie)
      .send({
        name: 'light',
        label: 'Clone',
        colors: buildSeedThemes()[0].colors,
        fonts: buildSeedThemes()[0].fonts,
        fontSizes: buildSeedThemes()[0].fontSizes,
        iconAssets: {
          spell: { path: 'M15 4V2 M15 16v-2 M3 21l9-9', viewBox: '0 0 24 24' },
        },
        kindColors: buildSeedThemes()[0].kindColors,
        tagColorPalette: ['#1A73E8', '#7C3AED', '#2563EB', '#B45309', '#0D9488'],
      })
      .expect(409);
  });

  it('rejects invalid theme payloads with 400', async () => {
    const context = createSeededTestApp();
    await seedThemes(context);
    const cookie = await registerAdmin(context.app, context.users);

    await request(context.app)
      .post('/api/themes')
      .set('Cookie', cookie)
      .send({ name: 'bad', label: 'Bad', colors: {}, fonts: {}, fontSizes: {}, iconAssets: {}, kindColors: {}, tagColorPalette: [] })
      .expect(400);
  });

  describe('legacy iconAssets shape', () => {
    async function seedLegacyTheme(context: ReturnType<typeof createSeededTestApp>) {
      const now = new Date().toISOString();
      const legacy = {
        id: 'theme-light-legacy',
        name: 'light',
        label: 'Light',
        colors: {
          pageBg: '#f7faf8',
          pageBgAccent: 'rgba(15, 23, 42, 0.04)',
          surface: '#ffffff',
          surfaceElevated: '#fffdfa',
          surfaceMuted: '#edf2ef',
          surfaceAlt: '#f4f8f6',
          text: '#0f172a',
          textMuted: '#475569',
          border: '#cbd5e1',
          borderStrong: '#a5b4c3',
          primary: '#4f46e5',
          primaryStrong: '#4338ca',
          accentSoft: '#e0e7ff',
          danger: '#dc2626',
          success: '#15803d',
          warning: '#b45309',
          shadow: '0 14px 32px rgba(15, 23, 42, 0.08)',
        },
        fonts: { display: 'serif', body: 'serif', mono: 'monospace' },
        fontSizes: { heading: '2.65rem', body: '1rem', mono: '0.75rem' },
        iconAssets: ['spell', 'copy'],
        kindColors: { spell: '#7c3aed', webLink: '#2563eb', markdown: '#b45309', file: '#0d9488' },
        tagColorPalette: ['#1A73E8', '#7C3AED'],
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      };
      await context.themes.create(legacy as unknown as Parameters<typeof context.themes.create>[0]);
    }

    it('GET /api/themes/active returns HTTP 200 for a stored legacy-shape theme', async () => {
      const context = createSeededTestApp();
      await seedLegacyTheme(context);
      const cookie = await registerUser(request, context.app, 'legacy@example.com');

      const active = await request(context.app)
        .get('/api/themes/active')
        .set('Cookie', cookie)
        .expect(200);
      expect(active.body.theme.name).toBe('light');
      expect(Array.isArray(active.body.theme.iconAssets)).toBe(false);
      expect(active.body.theme.iconAssets).toMatchObject({
        spell: { path: expect.any(String), viewBox: expect.any(String) },
        copy: { path: expect.any(String), viewBox: expect.any(String) },
      });
    });

    it('GET /api/themes returns HTTP 200 and normalizes the legacy shape', async () => {
      const context = createSeededTestApp();
      await seedLegacyTheme(context);
      const cookie = await registerUser(request, context.app, 'legacy@example.com');

      const list = await request(context.app).get('/api/themes').set('Cookie', cookie).expect(200);
      expect(list.body.total).toBe(1);
      expect(list.body.items[0].iconAssets).toMatchObject({
        spell: { path: expect.any(String), viewBox: expect.any(String) },
        copy: { path: expect.any(String), viewBox: expect.any(String) },
      });
    });
  });
});