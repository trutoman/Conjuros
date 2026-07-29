import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createTestApp, registerUser } from './testApp';

describe('auth theme preference', () => {
  it('returns the default theme for a newly authenticated user', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    const response = await request(app).get('/api/auth/me').set('Cookie', cookie).expect(200);

    expect(response.body.user).toMatchObject({
      email: 'owner@example.com',
      theme: 'light',
    });
  });

  it('updates the authenticated user theme and returns the updated profile', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    const updated = await request(app)
      .patch('/api/auth/me/theme')
      .set('Cookie', cookie)
      .send({ theme: 'dark' })
      .expect(200);

    expect(updated.body.user).toMatchObject({
      email: 'owner@example.com',
      theme: 'dark',
    });

    const reloaded = await request(app).get('/api/auth/me').set('Cookie', cookie).expect(200);
    expect(reloaded.body.user.theme).toBe('dark');
  });

  it('keeps each user theme preference isolated', async () => {
    const { app } = createTestApp();
    const ownerCookie = await registerUser(request, app, 'owner@example.com');
    const otherCookie = await registerUser(request, app, 'other@example.com');

    await request(app)
      .patch('/api/auth/me/theme')
      .set('Cookie', ownerCookie)
      .send({ theme: 'dark' })
      .expect(200);

    const otherProfile = await request(app).get('/api/auth/me').set('Cookie', otherCookie).expect(200);
    expect(otherProfile.body.user).toMatchObject({
      email: 'other@example.com',
      theme: 'light',
    });
  });

  it('rejects unsupported theme values', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    await request(app)
      .patch('/api/auth/me/theme')
      .set('Cookie', cookie)
      .send({ theme: 'system' })
      .expect(400);
  });
});