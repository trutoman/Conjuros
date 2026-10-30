import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildSeedThemes } from '../../api/repositories/themeSeed';
import { createTestApp, registerUser } from './testApp';

async function seedThemes(context: ReturnType<typeof createTestApp>) {
  for (const theme of buildSeedThemes()) await context.themes.create(theme);
}

describe('authenticated user preferences', () => {
  it('returns default preferences for a newly authenticated user', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    const response = await request(app).get('/api/auth/me').set('Cookie', cookie).expect(200);

    expect(response.body.user).toMatchObject({
      email: 'owner@example.com',
      preferences: { themeId: null, tagsPanelExpanded: true },
    });
  });

  it('updates and reloads theme and tags panel preferences', async () => {
    const context = createTestApp();
    await seedThemes(context);
    const cookie = await registerUser(request, context.app, 'owner@example.com');
    const dark = (await context.themes.findByName('dark'))!;

    const updated = await request(context.app)
      .patch('/api/auth/me/preferences')
      .set('Cookie', cookie)
      .send({ themeId: dark.id, tagsPanelExpanded: false })
      .expect(200);

    expect(updated.body.user.preferences).toEqual({ themeId: dark.id, tagsPanelExpanded: false });
    const reloaded = await request(context.app).get('/api/auth/me').set('Cookie', cookie).expect(200);
    expect(reloaded.body.user.preferences).toEqual({ themeId: dark.id, tagsPanelExpanded: false });
  });

  it('keeps preferences isolated between users', async () => {
    const context = createTestApp();
    await seedThemes(context);
    const ownerCookie = await registerUser(request, context.app, 'owner@example.com');
    const otherCookie = await registerUser(request, context.app, 'other@example.com');
    const dark = (await context.themes.findByName('dark'))!;

    await request(context.app)
      .patch('/api/auth/me/preferences')
      .set('Cookie', ownerCookie)
      .send({ themeId: dark.id })
      .expect(200);

    const otherProfile = await request(context.app).get('/api/auth/me').set('Cookie', otherCookie).expect(200);
    expect(otherProfile.body.user.preferences).toEqual({ themeId: null, tagsPanelExpanded: true });
  });

  it('rejects unknown theme ids without changing preferences', async () => {
    const context = createTestApp();
    await seedThemes(context);
    const cookie = await registerUser(request, context.app, 'owner@example.com');

    await request(context.app)
      .patch('/api/auth/me/preferences')
      .set('Cookie', cookie)
      .send({ themeId: 'missing-theme' })
      .expect(400);

    const profile = await request(context.app).get('/api/auth/me').set('Cookie', cookie).expect(200);
    expect(profile.body.user.preferences.themeId).toBeNull();
  });

  it('requires authentication to update preferences', async () => {
    await request(createTestApp().app)
      .patch('/api/auth/me/preferences')
      .send({ tagsPanelExpanded: false })
      .expect(401);
  });

  it('uses the selected theme for the active theme endpoint and falls back after deletion', async () => {
    const context = createTestApp();
    await seedThemes(context);
    const cookie = await registerUser(request, context.app, 'owner@example.com');
    const [light, dark] = buildSeedThemes();
    const custom = await context.themes.create({
      ...light,
      id: 'theme-custom-test',
      name: 'custom-test',
      label: 'Custom test',
      isDefault: false,
    });

    await request(context.app)
      .patch('/api/auth/me/preferences')
      .set('Cookie', cookie)
      .send({ themeId: custom.id })
      .expect(200);
    const active = await request(context.app).get('/api/themes/active').set('Cookie', cookie).expect(200);
    expect(active.body.theme.id).toBe(custom.id);

    await context.themes.delete(custom.id);
    const fallback = await request(context.app).get('/api/themes/active').set('Cookie', cookie).expect(200);
    expect(fallback.body.theme.name).toBe('light');
    expect((await context.themes.findById(dark.id))?.name).toBe('dark');
  });

  it('ignores unknown preference fields', async () => {
    const context = createTestApp();
    const cookie = await registerUser(request, context.app, 'owner@example.com');

    const response = await request(context.app)
      .patch('/api/auth/me/preferences')
      .set('Cookie', cookie)
      .send({ tagsPanelExpanded: false, extra: 'ignored' })
      .expect(200);

    expect(response.body.user.preferences.tagsPanelExpanded).toBe(false);
  });
});
