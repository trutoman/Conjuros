import { createApp } from '../../api/app';
import { InMemoryItemsRepository } from '../../api/repositories/items.repository';
import { InMemoryTagsRepository } from '../../api/repositories/tags.repository';
import { InMemoryThemesRepository } from '../../api/repositories/themes.repository';
import { InMemoryUsersRepository } from '../../api/repositories/users.repository';

export function createTestApp() {
  const items = new InMemoryItemsRepository();
  const tags = new InMemoryTagsRepository();
  const themes = new InMemoryThemesRepository();
  const users = new InMemoryUsersRepository();
  return {
    app: createApp({ items, tags, themes, users, sessionSecret: 'test-session-secret' }),
    items,
    tags,
    themes,
    users,
  };
}

export const validPassword = 'correct-horse-battery-staple';

export async function registerUser(
  request: typeof import('supertest'),
  app: ReturnType<typeof createTestApp>['app'],
  email: string,
) {
  const response = await request(app)
    .post('/api/auth/register')
    .send({ email, password: validPassword });
  return response.headers['set-cookie'][0] as string;
}

export async function createTag(
  request: typeof import('supertest'),
  app: ReturnType<typeof createTestApp>['app'],
  cookie: string,
  tagName: string,
  tagCategory = 'general',
) {
  return request(app)
    .post('/api/tags')
    .set('Cookie', cookie)
    .send({ tagName, tagCategory, description: '', color: '#123ABC' })
    .expect(201);
}
