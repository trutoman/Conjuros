import { createApp } from '../../api/app';
import { InMemoryItemsRepository } from '../../api/repositories/items.repository';
import { InMemoryUsersRepository } from '../../api/repositories/users.repository';

export function createTestApp() {
  const items = new InMemoryItemsRepository();
  const users = new InMemoryUsersRepository();
  return { app: createApp({ items, users, sessionSecret: 'test-session-secret' }), items, users };
}

export const validPassword = 'correct-horse-battery-staple';

export async function registerUser(
  request: typeof import('supertest'),
  app: ReturnType<typeof createTestApp>['app'],
  email: string,
) {
  const response = await request(app).post('/api/auth/register').send({ email, password: validPassword });
  return response.headers['set-cookie'][0] as string;
}