import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createTestApp, registerUser } from './testApp';

describe('GET /api/items', () => {
  it('lists only the authenticated user items and supports search', async () => {
    const { app } = createTestApp();
    const ownerCookie = await registerUser(request, app, 'owner@example.com');
    const otherCookie = await registerUser(request, app, 'other@example.com');

    await request(app)
      .post('/api/items')
      .set('Cookie', ownerCookie)
      .send({ kind: 'spell', title: 'Git status', description: 'Check state', tags: ['git'], relatedItemIds: [], command: 'git status' })
      .expect(201);
    await request(app)
      .post('/api/items')
      .set('Cookie', otherCookie)
      .send({ kind: 'web-link', title: 'Private docs', description: '', tags: ['docs'], relatedItemIds: [], url: 'https://example.com' })
      .expect(201);

    const response = await request(app)
      .get('/api/items?search=status')
      .set('Cookie', ownerCookie)
      .expect(200);

    expect(response.body.total).toBe(1);
    expect(response.body.items[0]).toMatchObject({ title: 'Git status', command: 'git status' });
    expect(response.body.items[0]).not.toHaveProperty('ownerId');
  });
});