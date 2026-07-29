import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createTag, createTestApp, registerUser } from './testApp';

describe('tag endpoints', () => {
  it('supports owner-scoped CRUD and case-insensitive search', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    const created = await request(app)
      .post('/api/tags')
      .set('Cookie', cookie)
      .send({ tagName: 'Work.Todo', description: 'Tasks', color: '#12AB34' })
      .expect(201);

    expect(created.body).toMatchObject({ tagName: 'Work.Todo', color: '#12AB34' });

    const listed = await request(app)
      .get('/api/tags?search=work')
      .set('Cookie', cookie)
      .expect(200);

    expect(listed.body.total).toBe(1);
    expect(listed.body.items[0].tagName).toBe('Work.Todo');

    await request(app)
      .patch(`/api/tags/${created.body.id}`)
      .set('Cookie', cookie)
      .send({ description: 'Updated', color: '#3344CC' })
      .expect(200);

    await request(app).delete(`/api/tags/${created.body.id}`).set('Cookie', cookie).expect(204);
  });

  it('rejects invalid tag names, colors, and case-insensitive duplicates', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    await request(app)
      .post('/api/tags')
      .set('Cookie', cookie)
      .send({ tagName: 'bad name', description: '', color: '#123456' })
      .expect(400);

    await request(app)
      .post('/api/tags')
      .set('Cookie', cookie)
      .send({ tagName: 'valid.name', description: '', color: 'blue' })
      .expect(400);

    await createTag(request, app, cookie, 'Work.Tag');

    await request(app)
      .post('/api/tags')
      .set('Cookie', cookie)
      .send({ tagName: 'work.tag', description: '', color: '#123456' })
      .expect(409);
  });

  it('prevents cross-user tag access and item associations', async () => {
    const { app } = createTestApp();
    const ownerCookie = await registerUser(request, app, 'owner@example.com');
    const otherCookie = await registerUser(request, app, 'other@example.com');

    const created = await createTag(request, app, ownerCookie, 'private.tag');

    await request(app).get(`/api/tags/${created.body.id}`).set('Cookie', otherCookie).expect(404);
    await request(app)
      .patch(`/api/tags/${created.body.id}`)
      .set('Cookie', otherCookie)
      .send({ description: 'stolen' })
      .expect(404);
    await request(app).delete(`/api/tags/${created.body.id}`).set('Cookie', otherCookie).expect(404);

    await request(app)
      .post('/api/items')
      .set('Cookie', otherCookie)
      .send({
        kind: 'spell',
        title: 'Invalid tag association',
        description: '',
        tags: ['private.tag'],
        relatedItemIds: [],
        command: 'echo nope',
      })
      .expect(400);
  });

  it('renames associated item tags and cascades tag deletion', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    const oldTag = await createTag(request, app, cookie, 'old.tag');
    await createTag(request, app, cookie, 'keep.tag');

    const createdItem = await request(app)
      .post('/api/items')
      .set('Cookie', cookie)
      .send({
        kind: 'spell',
        title: 'Tagged spell',
        description: '',
        tags: ['old.tag', 'keep.tag'],
        relatedItemIds: [],
        command: 'echo tagged',
      })
      .expect(201);

    await request(app)
      .patch(`/api/tags/${oldTag.body.id}`)
      .set('Cookie', cookie)
      .send({ tagName: 'new.tag' })
      .expect(200);

    const afterRename = await request(app).get(`/api/items/${createdItem.body.id}`).set('Cookie', cookie).expect(200);
    expect(afterRename.body.tags).toContain('new.tag');
    expect(afterRename.body.tags).not.toContain('old.tag');

    await request(app)
      .delete(`/api/tags/${oldTag.body.id}`)
      .set('Cookie', cookie)
      .expect(204);

    const afterDelete = await request(app).get(`/api/items/${createdItem.body.id}`).set('Cookie', cookie).expect(200);
    expect(afterDelete.body.tags).toEqual(['keep.tag']);
  });
});
