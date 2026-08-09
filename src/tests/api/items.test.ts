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
        tags: [],
        relatedItemIds: [],
        content: '# Outage\n\nResolved by restarting.',
        filename: 'incident.md',
      })
      .expect(201);
    expect(created.body).toMatchObject({
      kind: 'markdown',
      title: 'Incident notes',
      content: '# Outage\n\nResolved by restarting.',
      description: null,
      command: null,
      url: null,
    });
    expect(created.body).not.toHaveProperty('ownerId');

    const withDescription = await request(app)
      .post('/api/items')
      .set('Cookie', cookie)
      .send({
        kind: 'markdown',
        title: 'Runbook',
        description: 'Incident runbook',
        tags: [],
        relatedItemIds: [],
        content: '# Runbook',
        filename: 'runbook.md',
      })
      .expect(201);
    expect(withDescription.body).toMatchObject({
      kind: 'markdown',
      title: 'Runbook',
      description: 'Incident runbook',
    });

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
    expect(kindFilter.body.items).toHaveLength(2);
    expect(kindFilter.body.items[0].kind).toBe('markdown');
  });

  it('persists, normalizes, and clears the filename, and guards non-markdown kinds', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    const created = await request(app)
      .post('/api/items')
      .set('Cookie', cookie)
      .send({
        kind: 'markdown',
        title: 'Incident notes',
        tags: [],
        relatedItemIds: [],
        content: '# Outage',
        filename: 'incident.md',
      })
      .expect(201);
    expect(created.body).toMatchObject({ kind: 'markdown', filename: 'incident.md' });

    const withoutFilename = await request(app)
      .post('/api/items')
      .set('Cookie', cookie)
      .send({ kind: 'markdown', title: 'Plain note', tags: [], relatedItemIds: [], content: '# Note' })
      .expect(400);
    expect(withoutFilename.body).not.toHaveProperty('filename');

    const renamed = await request(app)
      .patch(`/api/items/${created.body.id}`)
      .set('Cookie', cookie)
      .send({ filename: 'final.md' })
      .expect(200);
    expect(renamed.body.filename).toBe('final.md');

    const cleared = await request(app)
      .patch(`/api/items/${created.body.id}`)
      .set('Cookie', cookie)
      .send({ filename: '  ' })
      .expect(200);
    expect(cleared.body.filename).toBeNull();

    await request(app)
      .patch(`/api/items/${created.body.id}`)
      .set('Cookie', cookie)
      .send({ filename: 'bad.txt' })
      .expect(400);

    await request(app)
      .post('/api/items')
      .set('Cookie', cookie)
      .send({
        kind: 'spell',
        title: 'Status',
        tags: [],
        relatedItemIds: [],
        command: 'git status',
        filename: 'status.md',
      })
      .expect(400);

    await request(app)
      .patch(`/api/items/${created.body.id}`)
      .set('Cookie', cookie)
      .send({ kind: 'web-link', url: 'https://example.com', filename: 'docs.md' })
      .expect(400);
  });
});

describe('file collection items', () => {
  it('creates, updates, searches, and filters file items', async () => {
    const { app } = createTestApp();
    const cookie = await registerUser(request, app, 'owner@example.com');

    await request(app)
      .post('/api/items')
      .set('Cookie', cookie)
      .send({ kind: 'file', title: 'Logs', tags: [], relatedItemIds: [], content: '' , filename: 'app.log'})
      .expect(400);

    await request(app)
      .post('/api/items')
      .set('Cookie', cookie)
      .send({ kind: 'file', title: 'Logs', tags: [], relatedItemIds: [], content: 'boot ok', filename: 'bare-name-without-extension' })
      .expect(201);

    const created = await request(app)
      .post('/api/items')
      .set('Cookie', cookie)
      .send({
        kind: 'file',
        title: 'Deploy log',
        tags: [],
        relatedItemIds: [],
        content: 'Started at 09:00\nFinished ok',
        filename: 'deploy.log',
      })
      .expect(201);
    expect(created.body).toMatchObject({
      kind: 'file',
      title: 'Deploy log',
      content: 'Started at 09:00\nFinished ok',
      filename: 'deploy.log',
      description: null,
      command: null,
      url: null,
    });
    expect(created.body).not.toHaveProperty('ownerId');

    const missingFilename = await request(app)
      .post('/api/items')
      .set('Cookie', cookie)
      .send({ kind: 'file', title: 'No name', tags: [], relatedItemIds: [], content: 'hello' })
      .expect(400);
    expect(missingFilename.body).not.toHaveProperty('filename');

    const updated = await request(app)
      .patch(`/api/items/${created.body.id}`)
      .set('Cookie', cookie)
      .send({ content: 'Started at 12:00\nRestarted once' })
      .expect(200);
    expect(updated.body.content).toBe('Started at 12:00\nRestarted once');

    const renamed = await request(app)
      .patch(`/api/items/${created.body.id}`)
      .set('Cookie', cookie)
      .send({ filename: 'restart.2' })
      .expect(200);
    expect(renamed.body.filename).toBe('restart.2');

    const cleared = await request(app)
      .patch(`/api/items/${created.body.id}`)
      .set('Cookie', cookie)
      .send({ filename: '  ' })
      .expect(200);
    expect(cleared.body.filename).toBeNull();

    await request(app)
      .patch(`/api/items/${created.body.id}`)
      .set('Cookie', cookie)
      .send({ kind: 'file', command: 'nope' })
      .expect(400);

    await request(app)
      .patch(`/api/items/${created.body.id}`)
      .set('Cookie', cookie)
      .send({ kind: 'file', url: 'https://example.com' })
      .expect(400);

    await request(app)
      .patch(`/api/items/${created.body.id}`)
      .set('Cookie', cookie)
      .send({ filename: `${'a'.repeat(129)}.log` })
      .expect(400);

    const search = await request(app)
      .get('/api/items?search=restarted')
      .set('Cookie', cookie)
      .expect(200);
    expect(search.body.total).toBe(1);

    const kindFilter = await request(app)
      .get('/api/items?kind=file')
      .set('Cookie', cookie)
      .expect(200);
    expect(kindFilter.body.items.every((item: { kind: string }) => item.kind === 'file')).toBe(true);
    expect(kindFilter.body.total).toBe(2);

    await request(app).delete(`/api/items/${created.body.id}`).set('Cookie', cookie).expect(204);
  });

  it('deletes a file item and blocks cross-user access', async () => {
    const { app } = createTestApp();
    const ownerCookie = await registerUser(request, app, 'owner@example.com');
    const otherCookie = await registerUser(request, app, 'other@example.com');

    const created = await request(app)
      .post('/api/items')
      .set('Cookie', ownerCookie)
      .send({
        kind: 'file',
        title: 'Private file',
        tags: [],
        relatedItemIds: [],
        content: 'secret',
        filename: 'secret.txt',
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
