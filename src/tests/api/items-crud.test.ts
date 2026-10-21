import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createTag, createTestApp, registerUser } from './testApp';

describe('collection item CRUD endpoints', () => {
  it('rejects the former spell kind in writes and filters', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'legacy@example.com');

    await request(app)
      .post('/api/items')
      .set('Cookie', cookie)
      .send({
        kind: 'spell',
        title: 'Legacy',
        tags: [],
        relatedItemIds: [],
        command: 'echo legacy',
      })
      .expect(400);

    await request(app).get('/api/items?kind=spell').set('Cookie', cookie).expect(400);
    await request(app).get('/api/items?kind=command').set('Cookie', cookie).expect(200);
  });

  it('rejects invalid input and prevents cross-user updates and deletion', async () => {
    const { app } = createTestApp();
    const ownerCookie = await registerUser(request, app, 'owner@example.com');
    const otherCookie = await registerUser(request, app, 'other@example.com');

    await request(app)
      .post('/api/items')
      .set('Cookie', ownerCookie)
      .send({ kind: 'command', title: 'Broken', description: '', tags: [], relatedItemIds: [] })
      .expect(400);

    await createTag(request, app, ownerCookie, 'backend');

    const otherItem = await request(app)
      .post('/api/items')
      .set('Cookie', otherCookie)
      .send({ kind: 'command', title: 'Other user item', description: '', tags: [], relatedItemIds: [], command: 'private' })
      .expect(201);

    await request(app)
      .post('/api/items')
      .set('Cookie', ownerCookie)
      .send({ kind: 'command', title: 'Invalid relationship', description: '', tags: [], relatedItemIds: [otherItem.body.id], command: 'blocked' })
      .expect(400);

    const created = await request(app)
      .post('/api/items')
      .set('Cookie', ownerCookie)
      .send({ kind: 'command', title: 'Deploy', description: '', tags: ['backend'], relatedItemIds: [], command: 'npm run deploy' })
      .expect(201);

    await request(app)
      .patch(`/api/items/${created.body.id}`)
      .set('Cookie', otherCookie)
      .send({ title: 'Stolen' })
      .expect(404);
    await request(app).delete(`/api/items/${created.body.id}`).set('Cookie', otherCookie).expect(404);

    const updated = await request(app)
      .patch(`/api/items/${created.body.id}`)
      .set('Cookie', ownerCookie)
      .send({ title: 'Deploy safely' })
      .expect(200);
    expect(updated.body.title).toBe('Deploy safely');

    await request(app).delete(`/api/items/${created.body.id}`).set('Cookie', ownerCookie).expect(204);
  });
});