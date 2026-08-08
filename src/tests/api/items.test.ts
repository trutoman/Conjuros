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
      .send({
        kind: 'spell',
        title: 'Git status',
        description: 'Check state',
        tags: ['git'],
        relatedItemIds: [],
        command: 'git status',
      })
      .expect(201);
    await request(app)
      .post('/api/items')
      .set('Cookie', otherCookie)
      .send({
        kind: 'web-link',
        title: 'Private docs',
        description: '',
        tags: ['docs'],
        relatedItemIds: [],
        url: 'https://example.com',
      })
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
      .send({
        kind: 'spell',
        title: 'Both tags',
        description: '',
        tags: ['git', 'docs'],
        relatedItemIds: [],
        command: 'echo both',
      })
      .expect(201);
    await request(app)
      .post('/api/items')
      .set('Cookie', cookie)
      .send({
        kind: 'spell',
        title: 'Git only',
        description: '',
        tags: ['git'],
        relatedItemIds: [],
        command: 'echo git',
      })
      .expect(201);

    const allResponse = await request(app)
      .get('/api/items?tags=git&tags=docs&tagFilterMode=all')
      .set('Cookie', cookie)
      .expect(200);
    expect(allResponse.body.items.map((item: { title: string }) => item.title)).toEqual([
      'Both tags',
    ]);

    const anyResponse = await request(app)
      .get('/api/items?tags=git&tags=docs&tagFilterMode=any')
      .set('Cookie', cookie)
      .expect(200);
    expect(anyResponse.body.items).toHaveLength(2);
  });

  it('denies cross-user read, update, and delete access to private items', async () => {
    const { app } = createTestApp();
    const ownerCookie = await registerUser(request, app, 'owner@example.com');
    const otherCookie = await registerUser(request, app, 'other@example.com');

    const created = await request(app)
      .post('/api/items')
      .set('Cookie', ownerCookie)
      .send({
        kind: 'spell',
        title: 'Owner only',
        description: '',
        tags: [],
        relatedItemIds: [],
        command: 'private',
      })
      .expect(201);

    const getResponse = await request(app)
      .get(`/api/items/${created.body.id}`)
      .set('Cookie', otherCookie);
    expect([403, 404]).toContain(getResponse.status);

    const patchResponse = await request(app)
      .patch(`/api/items/${created.body.id}`)
      .set('Cookie', otherCookie)
      .send({ title: 'Hijacked' });
    expect([403, 404]).toContain(patchResponse.status);

    const deleteResponse = await request(app)
      .delete(`/api/items/${created.body.id}`)
      .set('Cookie', otherCookie);
    expect([403, 404]).toContain(deleteResponse.status);

    await request(app).get(`/api/items/${created.body.id}`).set('Cookie', ownerCookie).expect(200);
  });
});

describe('markdown collection items', () => {
  it('creates, updates, and searches markdown items by content', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    await request(app)
      .post('/api/items')
      .set('Cookie', cookie)
      .send({ kind: 'markdown', title: 'Notes', description: '', tags: [], relatedItemIds: [], content: '' })
      .expect(400);

    const created = await request(app)
      .post('/api/items')
      .set('Cookie', cookie)
      .send({
        kind: 'markdown',
        title: 'Incident notes',
        description: '',
        tags: [],
        relatedItemIds: [],
        content: '# Outage\n\nResolved by restarting.',
      })
      .expect(201);
    expect(created.body).toMatchObject({
      kind: 'markdown',
      title: 'Incident notes',
      content: '# Outage\n\nResolved by restarting.',
      command: null,
      url: null,
    });
    expect(created.body).not.toHaveProperty('ownerId');

    const updated = await request(app)
      .patch(`/api/items/${created.body.id}`)
      .set('Cookie', cookie)
      .send({ content: '# Outage\n\nRestarted twice.' })
      .expect(200);
    expect(updated.body.content).toBe('# Outage\n\nRestarted twice.');

    await request(app)
      .patch(`/api/items/${created.body.id}`)
      .set('Cookie', cookie)
      .send({ kind: 'markdown', command: 'nope' })
      .expect(400);

    const search = await request(app)
      .get('/api/items?search=restarted')
      .set('Cookie', cookie)
      .expect(200);
    expect(search.body.total).toBe(1);

    const kindFilter = await request(app)
      .get('/api/items?kind=markdown')
      .set('Cookie', cookie)
      .expect(200);
    expect(kindFilter.body.items).toHaveLength(1);
    expect(kindFilter.body.items[0].kind).toBe('markdown');
  });
});
