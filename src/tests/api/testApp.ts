import { createApp } from '../../api/app';
import type { EmailMessage, EmailSender } from '../../api/email/sender';
import { InMemoryItemsRepository } from '../../api/repositories/items.repository';
import { InMemoryPasswordResetTokensRepository } from '../../api/repositories/password-reset-tokens.repository';
import { InMemoryTagCategoriesRepository } from '../../api/repositories/tag-categories.repository';
import { InMemoryTagsRepository } from '../../api/repositories/tags.repository';
import { InMemoryThemesRepository } from '../../api/repositories/themes.repository';
import { InMemoryUsersRepository } from '../../api/repositories/users.repository';

export class RecordingEmailSender implements EmailSender {
  readonly messages: EmailMessage[] = [];

  async send(message: EmailMessage): Promise<void> {
    this.messages.push(message);
  }
}

export const testAppBaseUrl = 'http://localhost:5173';

export function createTestApp() {
  const items = new InMemoryItemsRepository();
  const tags = new InMemoryTagsRepository();
  const tagCategories = new InMemoryTagCategoriesRepository();
  const themes = new InMemoryThemesRepository();
  const users = new InMemoryUsersRepository();
  const resetTokens = new InMemoryPasswordResetTokensRepository();
  const emailSender = new RecordingEmailSender();
  return {
    app: createApp({
      items,
      tags,
      tagCategories,
      themes,
      users,
      resetTokens,
      emailSender,
      sessionSecret: 'test-session-secret',
      appBaseUrl: testAppBaseUrl,
    }),
    items,
    tags,
    tagCategories,
    themes,
    users,
    resetTokens,
    emailSender,
  };
}

export const validPassword = 'Correct-horse-battery-staple-1';

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
