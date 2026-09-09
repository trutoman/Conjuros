import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createTestApp, registerUser } from './testApp';

async function createTagWithoutCategory(app: ReturnType<typeof createTestApp>['app'], cookie: string, tagName: string) {
  return request(app)
    .post('/api/tags')
    .set('Cookie', cookie)
    .send({ tagName, description: '', color: '#123ABC' })
    .expect(201);
}

describe('tag category entity', () => {
  it('auto-creates general and assigns tags without a category to it', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    const created = await createTagWithoutCategory(app, cookie, 'orphan.tag');
    expect(created.body.tagCategory).toBe('general');

    const categories = await request(app).get('/api/tag-categories').set('Cookie', cookie).expect(200);
    const general = categories.body.items.find((item: { name: string }) => item.name === 'general');
    expect(general).toBeDefined();
    expect(general.tagIds).toContain(created.body.id);
    expect(general.tagCount).toBe(1);
  });

  it('treats blank category as general', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    const created = await request(app)
      .post('/api/tags')
      .set('Cookie', cookie)
      .send({ tagName: 'blank.cat', tagCategory: '   ', description: '', color: '#123ABC' })
      .expect(201);
    expect(created.body.tagCategory).toBe('general');
  });

  it('auto-creates an unknown category on tag create and reuses an existing one', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    await request(app)
      .post('/api/tags')
      .set('Cookie', cookie)
      .send({ tagName: 'first.hobby', tagCategory: 'hobby', description: '', color: '#123ABC' })
      .expect(201);

    const before = await request(app).get('/api/tag-categories').set('Cookie', cookie).expect(200);
    const hobbyBefore = before.body.items.find((item: { name: string }) => item.name === 'hobby');
    expect(hobbyBefore.tagCount).toBe(1);

    await request(app)
      .post('/api/tags')
      .set('Cookie', cookie)
      .send({ tagName: 'second.hobby', tagCategory: 'HOBBY', description: '', color: '#123ABC' })
      .expect(201);

    const after = await request(app).get('/api/tag-categories').set('Cookie', cookie).expect(200);
    const hobbies = after.body.items.filter((item: { name: string }) => item.name === 'hobby');
    expect(hobbies).toHaveLength(1);
    expect(hobbies[0].tagCount).toBe(2);
  });

  it('lists empty categories', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    const created = await request(app)
      .post('/api/tag-categories')
      .set('Cookie', cookie)
      .send({ name: 'empty.cat' })
      .expect(201);
    expect(created.body.tagIds).toEqual([]);
    expect(created.body.tagCount).toBe(0);

    const listed = await request(app).get('/api/tag-categories').set('Cookie', cookie).expect(200);
    const empty = listed.body.items.find((item: { id: string }) => item.id === created.body.id);
    expect(empty).toBeDefined();
    expect(empty.tagCount).toBe(0);
  });

  it('cascades deleting a non-empty category to its tags but allows deleting an empty one', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    const tag = await request(app)
      .post('/api/tags')
      .set('Cookie', cookie)
      .send({ tagName: 'busy.tag', tagCategory: 'busy', description: '', color: '#123ABC' })
      .expect(201);

    const createdItem = await request(app)
      .post('/api/items')
      .set('Cookie', cookie)
      .send({
        kind: 'spell',
        title: 'Busy spell',
        description: '',
        tags: ['busy.tag'],
        relatedItemIds: [],
        command: 'echo busy',
      })
      .expect(201);

    const categories = await request(app).get('/api/tag-categories').set('Cookie', cookie).expect(200);
    const busy = categories.body.items.find((item: { name: string }) => item.name === 'busy');

    await request(app).delete(`/api/tag-categories/${busy.id}`).set('Cookie', cookie).expect(204);

    await request(app).get(`/api/tags/${tag.body.id}`).set('Cookie', cookie).expect(404);

    const afterDelete = await request(app)
      .get(`/api/items/${createdItem.body.id}`)
      .set('Cookie', cookie)
      .expect(200);
    expect(afterDelete.body.tags).toEqual([]);

    const remaining = await request(app).get('/api/tag-categories').set('Cookie', cookie).expect(200);
    expect(remaining.body.items.find((item: { name: string }) => item.name === 'busy')).toBeUndefined();

    const empty = await request(app)
      .post('/api/tag-categories')
      .set('Cookie', cookie)
      .send({ name: 'lonely' })
      .expect(201);
    await request(app).delete(`/api/tag-categories/${empty.body.id}`).set('Cookie', cookie).expect(204);
  });

  it('protects the general category from rename and delete', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');
    await createTagWithoutCategory(app, cookie, 'some.tag');

    const categories = await request(app).get('/api/tag-categories').set('Cookie', cookie).expect(200);
    const general = categories.body.items.find((item: { name: string }) => item.name === 'general');

    await request(app)
      .patch(`/api/tag-categories/${general.id}`)
      .set('Cookie', cookie)
      .send({ name: 'renamed' })
      .expect(400);
    await request(app).delete(`/api/tag-categories/${general.id}`).set('Cookie', cookie).expect(400);
  });

  it('renaming a category moves member tags', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    const tag = await request(app)
      .post('/api/tags')
      .set('Cookie', cookie)
      .send({ tagName: 'move.me', tagCategory: 'work', description: '', color: '#123ABC' })
      .expect(201);

    const categories = await request(app).get('/api/tag-categories').set('Cookie', cookie).expect(200);
    const work = categories.body.items.find((item: { name: string }) => item.name === 'work');

    const renamed = await request(app)
      .patch(`/api/tag-categories/${work.id}`)
      .set('Cookie', cookie)
      .send({ name: 'job' })
      .expect(200);
    expect(renamed.body.name).toBe('job');
    expect(renamed.body.tagIds).toContain(tag.body.id);

    const fetched = await request(app).get(`/api/tags/${tag.body.id}`).set('Cookie', cookie).expect(200);
    expect(fetched.body.tagCategory).toBe('job');
  });

  it('keeps categories owner-scoped', async () => {
    const { app } = createTestApp();
    const ownerCookie = await registerUser(request, app, 'owner@example.com');
    const otherCookie = await registerUser(request, app, 'other@example.com');

    const created = await request(app)
      .post('/api/tag-categories')
      .set('Cookie', ownerCookie)
      .send({ name: 'private' })
      .expect(201);

    await request(app).get(`/api/tag-categories/${created.body.id}`).set('Cookie', otherCookie).expect(404);

    const otherList = await request(app).get('/api/tag-categories').set('Cookie', otherCookie).expect(200);
    expect(otherList.body.items.find((item: { id: string }) => item.id === created.body.id)).toBeUndefined();
  });

  it('deleting a tag keeps its category as empty', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    const tag = await request(app)
      .post('/api/tags')
      .set('Cookie', cookie)
      .send({ tagName: 'last.one', tagCategory: 'solo', description: '', color: '#123ABC' })
      .expect(201);
    await request(app).delete(`/api/tags/${tag.body.id}`).set('Cookie', cookie).expect(204);

    const categories = await request(app).get('/api/tag-categories').set('Cookie', cookie).expect(200);
    const solo = categories.body.items.find((item: { name: string }) => item.name === 'solo');
    expect(solo).toBeDefined();
    expect(solo.tagCount).toBe(0);
  });
});
