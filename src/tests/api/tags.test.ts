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
      .send({ tagName: 'Work.Todo', tagCategory: 'Work', description: 'Tasks', color: '#12AB34' })
      .expect(201);

    expect(created.body).toMatchObject({
      tagName: 'Work.Todo',
      tagCategory: 'work',
      color: '#12AB34',
    });

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

  it('normalizes the tag category to lowercase on create', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    const mixedCase = await request(app)
      .post('/api/tags')
      .set('Cookie', cookie)
      .send({ tagName: 'ci.build', tagCategory: 'DeV.Ops', description: '', color: '#123456' })
      .expect(201);
    expect(mixedCase.body.tagCategory).toBe('dev.ops');

    const trimmed = await request(app)
      .post('/api/tags')
      .set('Cookie', cookie)
      .send({ tagName: 'code.review', tagCategory: '  Quality  ', description: '', color: '#123456' })
      .expect(201);
    expect(trimmed.body.tagCategory).toBe('quality');

    await request(app)
      .post('/api/tags')
      .set('Cookie', cookie)
      .send({ tagName: 'bad.cat', tagCategory: 'bad category!', description: '', color: '#123456' })
      .expect(400);
  });

  it('normalizes the tag category to lowercase on update', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    const tag = await createTag(request, app, cookie, 'release.tag');

    const updated = await request(app)
      .patch(`/api/tags/${tag.body.id}`)
      .set('Cookie', cookie)
      .send({ tagCategory: 'Release' })
      .expect(200);
    expect(updated.body.tagCategory).toBe('release');

    const fetched = await request(app)
      .get(`/api/tags/${tag.body.id}`)
      .set('Cookie', cookie)
      .expect(200);
    expect(fetched.body.tagCategory).toBe('release');
  });

  it('rejects invalid tag names, colors, and case-insensitive duplicates', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    await request(app)
      .post('/api/tags')
      .set('Cookie', cookie)
      .send({ tagName: 'bad name', tagCategory: 'Work', description: '', color: '#123456' })
      .expect(400);

    await request(app)
      .post('/api/tags')
      .set('Cookie', cookie)
      .send({ tagName: 'valid.name', tagCategory: 'Work', description: '', color: 'blue' })
      .expect(400);

    await createTag(request, app, cookie, 'Work.Tag', 'Work');

    await request(app)
      .post('/api/tags')
      .set('Cookie', cookie)
      .send({ tagName: 'work.tag', tagCategory: 'Personal', description: '', color: '#123456' })
      .expect(201);

    await request(app)
      .post('/api/tags')
      .set('Cookie', cookie)
      .send({ tagName: 'work.tag', tagCategory: 'work', description: '', color: '#123456' })
      .expect(409);
  });

  it('rejects updates that would duplicate the same normalized name-category pair', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    const source = await createTag(request, app, cookie, 'Work.Tag', 'Ops');
    const target = await createTag(request, app, cookie, 'Deploy.Tag', 'Infra');

    await request(app)
      .patch(`/api/tags/${target.body.id}`)
      .set('Cookie', cookie)
      .send({ tagName: 'work.tag', tagCategory: 'ops' })
      .expect(409);

    await request(app).get(`/api/tags/${source.body.id}`).set('Cookie', cookie).expect(200);
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
    await request(app)
      .delete(`/api/tags/${created.body.id}`)
      .set('Cookie', otherCookie)
      .expect(404);

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

    const afterRename = await request(app)
      .get(`/api/items/${createdItem.body.id}`)
      .set('Cookie', cookie)
      .expect(200);
    expect(afterRename.body.tags).toContain('new.tag');
    expect(afterRename.body.tags).not.toContain('old.tag');

    await request(app).delete(`/api/tags/${oldTag.body.id}`).set('Cookie', cookie).expect(204);

    const afterDelete = await request(app)
      .get(`/api/items/${createdItem.body.id}`)
      .set('Cookie', cookie)
      .expect(200);
    expect(afterDelete.body.tags).toEqual(['keep.tag']);
  });

  it('keeps item tag values unchanged when only the tag category changes', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    const tag = await createTag(request, app, cookie, 'old.tag', 'Work');

    const createdItem = await request(app)
      .post('/api/items')
      .set('Cookie', cookie)
      .send({
        kind: 'spell',
        title: 'Tagged spell',
        description: '',
        tags: ['old.tag'],
        relatedItemIds: [],
        command: 'echo tagged',
      })
      .expect(201);

    await request(app)
      .patch(`/api/tags/${tag.body.id}`)
      .set('Cookie', cookie)
      .send({ tagCategory: 'Archive' })
      .expect(200);

    const afterCategoryUpdate = await request(app)
      .get(`/api/items/${createdItem.body.id}`)
      .set('Cookie', cookie)
      .expect(200);

    expect(afterCategoryUpdate.body.tags).toEqual(['old.tag']);
  });

  it('surfaces legacy tags without category or with capitalized categories as general', async () => {
    const { app, tags } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');
    await createTag(request, app, cookie, 'seed.tag', 'Seed');

    const legacyStore = tags as unknown as {
      tags: Map<
        string,
        {
          id: string;
          ownerId: string;
          tagName: string;
          tagNameNormalized: string;
          tagCategory?: string;
          tagCategoryNormalized?: string;
          description: string;
          color: string;
          order: number;
          createdAt: string;
          updatedAt: string;
        }
      >;
    };

    const ownerId = [...legacyStore.tags.values()][0]?.ownerId;
    if (!ownerId) throw new Error('Expected seeded tag owner ID');

    legacyStore.tags.set('legacy-tag', {
      id: 'legacy-tag',
      ownerId,
      tagName: 'legacy.tag',
      tagNameNormalized: 'legacy.tag',
      description: '',
      color: '#123ABC',
      order: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    legacyStore.tags.set('legacy-capitalized', {
      id: 'legacy-capitalized',
      ownerId,
      tagName: 'legacy.capitalized',
      tagNameNormalized: 'legacy.capitalized',
      tagCategory: 'General',
      tagCategoryNormalized: 'general',
      description: '',
      color: '#123ABC',
      order: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    const listed = await request(app).get('/api/tags').set('Cookie', cookie).expect(200);

    expect(listed.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'legacy-tag',
          tagCategory: 'general',
        }),
        expect.objectContaining({
          id: 'legacy-capitalized',
          tagCategory: 'general',
        }),
      ]),
    );
  });

  it('does not rename unrelated item tags when only a tag category changes', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    const categorizedTag = await createTag(request, app, cookie, 'status.tag', 'work');
    await createTag(request, app, cookie, 'work', 'labels');

    const createdItem = await request(app)
      .post('/api/items')
      .set('Cookie', cookie)
      .send({
        kind: 'spell',
        title: 'Tagged spell',
        description: '',
        tags: ['status.tag', 'work'],
        relatedItemIds: [],
        command: 'echo tagged',
      })
      .expect(201);

    await request(app)
      .patch(`/api/tags/${categorizedTag.body.id}`)
      .set('Cookie', cookie)
      .send({ tagCategory: 'archive' })
      .expect(200);

    const afterCategoryUpdate = await request(app)
      .get(`/api/items/${createdItem.body.id}`)
      .set('Cookie', cookie)
      .expect(200);

    expect(afterCategoryUpdate.body.tags).toEqual(['status.tag', 'work']);
  });
});
