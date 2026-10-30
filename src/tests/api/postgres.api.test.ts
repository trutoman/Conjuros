// @vitest-environment node
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../api/app';
import { attachments } from '../../api/db/schema';
import { PostgresAttachmentsRepository } from '../../api/repositories/attachments.repository';
import { PostgresItemsRepository } from '../../api/repositories/items.repository';
import { PostgresPasswordResetTokensRepository } from '../../api/repositories/password-reset-tokens.repository';
import { PostgresTagCategoriesRepository } from '../../api/repositories/tag-categories.repository';
import { PostgresTagsRepository } from '../../api/repositories/tags.repository';
import { PostgresThemesRepository } from '../../api/repositories/themes.repository';
import { PostgresUserPreferencesRepository } from '../../api/repositories/user-preferences.repository';
import { buildSeedThemes } from '../../api/repositories/themeSeed';
import { PostgresUsersRepository } from '../../api/repositories/users.repository';
import { ThemesService } from '../../api/services/themes.service';
import { InMemoryAttachmentStorage, type AttachmentStorage } from '../../api/storage/storage';
import { setupPgliteDatabase } from './pglite';
import { RecordingEmailSender, registerUser, validPassword } from './testApp';

const database = setupPgliteDatabase();

const isoTimestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const paletteColor = buildSeedThemes()[0].tagColorPalette[0];

async function createPostgresApp(storage: AttachmentStorage | null = new InMemoryAttachmentStorage()) {
  const themes = new PostgresThemesRepository(database.db);
  const users = new PostgresUsersRepository(database.db);
  const userPreferences = new PostgresUserPreferencesRepository(database.db);
  await new ThemesService(themes, userPreferences).ensureSeeded();
  return createApp({
    items: new PostgresItemsRepository(database.db),
    attachments: new PostgresAttachmentsRepository(database.db),
    attachmentStorage: storage,
    tags: new PostgresTagsRepository(database.db),
    tagCategories: new PostgresTagCategoriesRepository(database.db),
    themes,
    userPreferences,
    users,
    resetTokens: new PostgresPasswordResetTokensRepository(database.db),
    emailSender: new RecordingEmailSender(),
    sessionSecret: 'test-session-secret',
    appBaseUrl: 'http://localhost:5173',
  });
}

type PostgresApp = Awaited<ReturnType<typeof createPostgresApp>>;

function postTag(app: PostgresApp, cookie: string, tagName: string, tagCategory: string) {
  return request(app)
    .post('/api/tags')
    .set('Cookie', cookie)
    .send({ tagName, tagCategory, description: '', color: paletteColor });
}

function postItem(app: PostgresApp, cookie: string, body: Record<string, unknown>) {
  return request(app)
    .post('/api/items')
    .set('Cookie', cookie)
    .send({ tags: [], relatedItemIds: [], ...body });
}

const forbiddenFields = ['ownerId', 'passwordHash', 'nameNormalized', 'tagNameNormalized', '_id'];

function expectNoPersistenceFields(body: unknown) {
  const serialized = JSON.stringify(body);
  for (const field of forbiddenFields) {
    expect(serialized).not.toContain(`"${field}"`);
  }
}

describe('API over PostgreSQL repositories', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('serves the collection flow end to end with unchanged response shapes', async () => {
    const app = await createPostgresApp();

    const registration = await request(app)
      .post('/api/auth/register')
      .send({ email: 'ada@example.com', password: validPassword })
      .expect(201);
    const cookie = registration.headers['set-cookie'][0] as string;
    expect(registration.body.user).toEqual({
      id: expect.any(String),
      email: 'ada@example.com',
      role: 'user',
      preferences: { themeId: null, tagsPanelExpanded: true },
    });
    expectNoPersistenceFields(registration.body);

    // A tag that introduces an unknown category creates that category.
    const tag = await postTag(app, cookie, 'backend', 'work').expect(201);
    expect(tag.body).toMatchObject({ tagName: 'backend', tagCategory: 'work', order: 1 });
    expect(tag.body.createdAt).toMatch(isoTimestamp);
    expect(tag.body.updatedAt).toMatch(isoTimestamp);
    expectNoPersistenceFields(tag.body);

    const categories = await request(app)
      .get('/api/tag-categories')
      .set('Cookie', cookie)
      .expect(200);
    const work = categories.body.items.find(
      (category: { name: string }) => category.name === 'work',
    );
    expect(work).toMatchObject({ tagIds: [tag.body.id], tagCount: 1 });
    expect(categories.body.items.map((category: { name: string }) => category.name).sort()).toEqual(
      ['general', 'work'],
    );
    expectNoPersistenceFields(categories.body);

    const command = await postItem(app, cookie, {
      kind: 'command',
      title: 'Deploy',
      command: 'npm run deploy',
      tags: ['backend'],
    }).expect(201);
    const link = await postItem(app, cookie, {
      kind: 'web-link',
      title: 'Docs',
      url: 'https://example.com/docs',
    }).expect(201);
    const note = await postItem(app, cookie, {
      kind: 'markdown',
      title: 'Notes',
      content: '# Notes',
      filename: 'notes.md',
    }).expect(201);

    expect(command.body).toMatchObject({
      description: null,
      url: null,
      content: null,
      filename: null,
      order: 1,
    });
    expect(link.body).toMatchObject({ command: null, content: null, filename: null, order: 2 });
    expect(note.body).toMatchObject({ command: null, url: null, filename: 'notes.md', order: 3 });
    for (const created of [command, link, note]) {
      expect(created.body.createdAt).toMatch(isoTimestamp);
      expect(created.body.updatedAt).toMatch(isoTimestamp);
      expectNoPersistenceFields(created.body);
    }

    const listed = await request(app).get('/api/items').set('Cookie', cookie).expect(200);
    expect(listed.body.total).toBe(3);
    expect(listed.body.items.map((item: { title: string }) => item.title)).toEqual([
      'Deploy',
      'Docs',
      'Notes',
    ]);
    expectNoPersistenceFields(listed.body);

    const filtered = await request(app)
      .get('/api/items')
      .query({ kind: 'web-link' })
      .set('Cookie', cookie)
      .expect(200);
    expect(filtered.body.items.map((item: { title: string }) => item.title)).toEqual(['Docs']);
    const searched = await request(app)
      .get('/api/items')
      .query({ search: 'NPM RUN' })
      .set('Cookie', cookie)
      .expect(200);
    expect(searched.body.items.map((item: { title: string }) => item.title)).toEqual(['Deploy']);
    const tagged = await request(app)
      .get('/api/items')
      .query({ tags: 'backend' })
      .set('Cookie', cookie)
      .expect(200);
    expect(tagged.body.total).toBe(1);

    const moved = await request(app)
      .patch(`/api/items/${note.body.id}/reorder`)
      .set('Cookie', cookie)
      .send({ order: 1 })
      .expect(200);
    expect(moved.body).toMatchObject({ title: 'Notes', order: 1 });
    const reordered = await request(app).get('/api/items').set('Cookie', cookie).expect(200);
    expect(
      reordered.body.items.map((item: { title: string; order: number }) => [
        item.title,
        item.order,
      ]),
    ).toEqual([
      ['Notes', 1],
      ['Deploy', 2],
      ['Docs', 3],
    ]);

    // Renaming a tag rewrites the items that carry it.
    await request(app)
      .patch(`/api/tags/${tag.body.id}`)
      .set('Cookie', cookie)
      .send({ tagName: 'services' })
      .expect(200);
    const renamed = await request(app)
      .get(`/api/items/${command.body.id}`)
      .set('Cookie', cookie)
      .expect(200);
    expect(renamed.body.tags).toEqual(['services']);

    await request(app).delete(`/api/items/${link.body.id}`).set('Cookie', cookie).expect(204);
    await request(app).get(`/api/items/${link.body.id}`).set('Cookie', cookie).expect(404);

    // Deleting a tag removes it from the items that carry it.
    await request(app).delete(`/api/tags/${tag.body.id}`).set('Cookie', cookie).expect(204);
    const untagged = await request(app)
      .get(`/api/items/${command.body.id}`)
      .set('Cookie', cookie)
      .expect(200);
    expect(untagged.body.tags).toEqual([]);

    const preference = await request(app)
      .patch('/api/auth/me/preferences')
      .set('Cookie', cookie)
      .send({ themeId: (await new PostgresThemesRepository(database.db).findByName('dark'))!.id })
      .expect(200);
    expect(preference.body.user.preferences.themeId).toBe((await new PostgresThemesRepository(database.db).findByName('dark'))!.id);
    const profile = await request(app).get('/api/auth/me').set('Cookie', cookie).expect(200);
    expect(profile.body.user).toMatchObject({ email: 'ada@example.com', preferences: { themeId: preference.body.user.preferences.themeId } });
  });

  it('keeps each user’s collection private', async () => {
    const app = await createPostgresApp();
    const ownerCookie = await registerUser(request, app, 'owner@example.com');
    const otherCookie = await registerUser(request, app, 'other@example.com');
    const item = await postItem(app, ownerCookie, {
      kind: 'command',
      title: 'Private',
      command: 'secret',
    }).expect(201);

    await request(app).get(`/api/items/${item.body.id}`).set('Cookie', otherCookie).expect(404);
    await request(app)
      .patch(`/api/items/${item.body.id}`)
      .set('Cookie', otherCookie)
      .send({ title: 'Stolen' })
      .expect(404);
    await request(app)
      .patch(`/api/items/${item.body.id}/reorder`)
      .set('Cookie', otherCookie)
      .send({ order: 1 })
      .expect(404);
    await request(app).delete(`/api/items/${item.body.id}`).set('Cookie', otherCookie).expect(404);

    const others = await request(app).get('/api/items').set('Cookie', otherCookie).expect(200);
    expect(others.body).toEqual({ items: [], total: 0 });
    const intact = await request(app)
      .get(`/api/items/${item.body.id}`)
      .set('Cookie', ownerCookie)
      .expect(200);
    expect(intact.body.title).toBe('Private');
  });

  it('answers a conflict for the second of two simultaneous registrations of one email', async () => {
    const app = await createPostgresApp();
    // Both requests must pass the service's existing-email check, so the unique index decides the race.
    const create = vi.spyOn(PostgresUsersRepository.prototype, 'create');
    const register = () =>
      request(app)
        .post('/api/auth/register')
        .send({ email: 'ada@example.com', password: validPassword });

    const responses = await Promise.all([register(), register()]);

    expect(create).toHaveBeenCalledTimes(2);
    expect(responses.map((response) => response.status).sort()).toEqual([201, 409]);
    const conflict = responses.find((response) => response.status === 409);
    expect(conflict?.body.error).toMatchObject({
      code: 'CONFLICT',
      message: 'An account with this email already exists',
    });
    const users = new PostgresUsersRepository(database.db);
    expect(await users.findByEmail('ada@example.com')).not.toBeNull();
  });

  it('creates one category for two simultaneous tag creations that introduce it', async () => {
    const app = await createPostgresApp();
    const cookie = await registerUser(request, app, 'ada@example.com');

    const responses = await Promise.all([
      postTag(app, cookie, 'alpha', 'work'),
      postTag(app, cookie, 'beta', 'work'),
    ]);

    expect(responses.map((response) => response.status)).toEqual([201, 201]);
    const categories = await request(app)
      .get('/api/tag-categories')
      .set('Cookie', cookie)
      .expect(200);
    const work = categories.body.items.filter(
      (category: { name: string }) => category.name === 'work',
    );
    expect(work).toHaveLength(1);
    expect([...work[0].tagIds].sort()).toEqual(
      responses.map((response) => response.body.id).sort(),
    );
    expect(work[0].tagCount).toBe(2);
  });

  it('stores, replaces, and removes an attachment file over PostgreSQL repositories', async () => {
    const storage = new InMemoryAttachmentStorage();
    const app = await createPostgresApp(storage);
    const cookie = await registerUser(request, app, 'ada@example.com');
    const item = await postItem(app, cookie, {
      kind: 'attachment',
      title: 'Contract',
    }).expect(201);
    const pdf = Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(64, 0x20)]);
    const png = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.alloc(32, 1),
    ]);

    const first = await request(app)
      .put(`/api/items/${item.body.id}/attachment`)
      .set('Cookie', cookie)
      .attach('file', pdf, { filename: 'contract.pdf', contentType: 'application/pdf' })
      .expect(200);
    let rows = await database.db.select().from(attachments);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      itemId: item.body.id,
      bucketId: 'attachments',
      objectPath: first.body.storagePath,
      originalFilename: 'contract.pdf',
      mimeType: 'application/pdf',
      sizeBytes: pdf.length,
    });

    const second = await request(app)
      .put(`/api/items/${item.body.id}/attachment`)
      .set('Cookie', cookie)
      .attach('file', png, { filename: 'scan.png', contentType: 'image/png' })
      .expect(200);
    rows = await database.db.select().from(attachments);
    expect(rows).toHaveLength(1);
    expect(rows[0].objectPath).toBe(second.body.storagePath);
    expect([...storage.objects.keys()]).toEqual([second.body.storagePath]);

    const removed = await request(app)
      .delete(`/api/items/${item.body.id}/attachment`)
      .set('Cookie', cookie)
      .expect(200);
    expect(removed.body.storagePath).toBeNull();
    expect(await database.db.select().from(attachments)).toHaveLength(0);
    expect(storage.objects.size).toBe(0);

    await request(app)
      .put(`/api/items/${item.body.id}/attachment`)
      .set('Cookie', cookie)
      .attach('file', pdf, { filename: 'again.pdf', contentType: 'application/pdf' })
      .expect(200);
    await request(app).delete(`/api/items/${item.body.id}`).set('Cookie', cookie).expect(204);
    expect(await database.db.select().from(attachments)).toHaveLength(0);
    expect(storage.objects.size).toBe(0);
  });
});
