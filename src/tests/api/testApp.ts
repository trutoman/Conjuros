import { createApp } from '../../api/app';
import type { EmailMessage, EmailSender } from '../../api/email/sender';
import { InMemoryAttachmentsRepository } from '../../api/repositories/attachments.repository';
import { InMemoryItemsRepository } from '../../api/repositories/items.repository';
import { InMemoryPasswordResetTokensRepository } from '../../api/repositories/password-reset-tokens.repository';
import { InMemoryTagCategoriesRepository } from '../../api/repositories/tag-categories.repository';
import { InMemoryTagsRepository } from '../../api/repositories/tags.repository';
import { InMemoryThemesRepository } from '../../api/repositories/themes.repository';
import { InMemoryUserPreferencesRepository } from '../../api/repositories/user-preferences.repository';
import { InMemoryUsersRepository } from '../../api/repositories/users.repository';
import { InMemoryAttachmentStorage, type AttachmentStorage } from '../../api/storage/storage';
import { InMemoryThemeImageStorage, type ThemeImageStorage } from '../../api/storage/themeImageStorage';

export class RecordingEmailSender implements EmailSender {
  readonly messages: EmailMessage[] = [];

  async send(message: EmailMessage): Promise<void> {
    this.messages.push(message);
  }
}

export const testAppBaseUrl = 'http://localhost:5173';

export function createTestApp(
  options: { storage?: AttachmentStorage | null; maxBytes?: number; themeImages?: ThemeImageStorage | null } = {},
) {
  const items = new InMemoryItemsRepository();
  const attachments = new InMemoryAttachmentsRepository(items);
  const storage =
    options.storage === undefined ? new InMemoryAttachmentStorage() : options.storage;
  const themeImages =
    options.themeImages === undefined ? new InMemoryThemeImageStorage() : options.themeImages;
  const tags = new InMemoryTagsRepository();
  const tagCategories = new InMemoryTagCategoriesRepository();
  const themes = new InMemoryThemesRepository();
  const userPreferences = new InMemoryUserPreferencesRepository();
  const users = new InMemoryUsersRepository();
  const resetTokens = new InMemoryPasswordResetTokensRepository();
  const emailSender = new RecordingEmailSender();
  return {
    app: createApp({
      items,
      attachments,
      attachmentStorage: storage,
      attachmentMaxBytes: options.maxBytes,
      themeImageStorage: themeImages,
      tags,
      tagCategories,
      themes,
      userPreferences,
      users,
      resetTokens,
      emailSender,
      sessionSecret: 'test-session-secret',
      appBaseUrl: testAppBaseUrl,
    }),
    items,
    attachments,
    storage,
    themeImages,
    tags,
    tagCategories,
    themes,
    userPreferences,
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
