import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createTag, createTestApp, registerUser } from './testApp';

describe('GET /api/items', () => {
  it('lists only the authenticated user items and supports search', async () => {
    const { app } = createTestApp();
    const ownerCookie = await registerUser(request, app, 'owner@example.com');
    const otherCookie = await registerUser(request, app, 'other@example.com');

    await createTag(request, app, ownerCookie, 'git');
    await createTag(request, app, otherCookie, 'docs');

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

  it('supports all and any modes for multi-tag filtering', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    await createTag(request, app, cookie, 'git');
    await createTag(request, app, cookie, 'docs');

    await request(app)
      .post('/api/items')
      .set('Cookie', cookie)
      .send({ kind: 'spell', title: 'Both tags', description: '', tags: ['git', 'docs'], relatedItemIds: [], command: 'echo both' })
      .expect(201);
    await request(app)
      .post('/api/items')
      .set('Cookie', cookie)
      .send({ kind: 'spell', title: 'Git only', description: '', tags: ['git'], relatedItemIds: [], command: 'echo git' })
      .expect(201);

    const allResponse = await request(app)
      .get('/api/items?tags=git&tags=docs&tagFilterMode=all')
      .set('Cookie', cookie)
      .expect(200);
    expect(allResponse.body.items.map((item: { title: string }) => item.title)).toEqual(['Both tags']);

    const anyResponse = await request(app)
      .get('/api/items?tags=git&tags=docs&tagFilterMode=any')
      .set('Cookie', cookie)
      .expect(200);
    expect(anyResponse.body.items).toHaveLength(2);
  });
});