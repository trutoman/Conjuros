import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createTestApp, registerUser } from './testApp';

describe('PATCH /api/items/:id/reorder', () => {
  it('persists an owned item position', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');
    await request(app)
      .post('/api/items')
      .set('Cookie', cookie)
      .send({
        kind: 'spell',
        title: 'First',
        description: '',
        tags: [],
        relatedItemIds: [],
        command: 'first',
      });
    const second = await request(app)
      .post('/api/items')
      .set('Cookie', cookie)
      .send({
        kind: 'spell',
        title: 'Second',
        description: '',
        tags: [],
        relatedItemIds: [],
        command: 'second',
      });

    await request(app)
      .patch(`/api/items/${second.body.id}/reorder`)
      .set('Cookie', cookie)
      .send({ order: 1 })
      .expect(200);
    const list = await request(app).get('/api/items').set('Cookie', cookie).expect(200);

    expect(list.body.items.map((item: { title: string }) => item.title)).toEqual([
      'Second',
      'First',
    ]);
  });

  it('rejects cross-user reorder attempts for private items', async () => {
    const { app } = createTestApp();
    const ownerCookie = await registerUser(request, app, 'owner@example.com');
    const otherCookie = await registerUser(request, app, 'other@example.com');

    const created = await request(app)
      .post('/api/items')
      .set('Cookie', ownerCookie)
      .send({
        kind: 'spell',
        title: 'Owner item',
        description: '',
        tags: [],
        relatedItemIds: [],
        command: 'private',
      })
      .expect(201);

    const response = await request(app)
      .patch(`/api/items/${created.body.id}/reorder`)
      .set('Cookie', otherCookie)
      .send({ order: 1 });

    expect([403, 404]).toContain(response.status);
  });
});
