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
      .send({ kind: 'spell', title: 'First', description: '', tags: [], relatedItemIds: [], command: 'first' });
    const second = await request(app)
      .post('/api/items')
      .set('Cookie', cookie)
      .send({ kind: 'spell', title: 'Second', description: '', tags: [], relatedItemIds: [], command: 'second' });

    await request(app).patch(`/api/items/${second.body.id}/reorder`).set('Cookie', cookie).send({ order: 1 }).expect(200);
    const list = await request(app).get('/api/items').set('Cookie', cookie).expect(200);

    expect(list.body.items.map((item: { title: string }) => item.title)).toEqual(['Second', 'First']);
  });
});