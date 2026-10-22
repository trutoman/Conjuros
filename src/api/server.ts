import 'dotenv/config';
import { createApp } from './app';
import { parseApiEnvironment } from './config/environment';
import { createDatabase } from './db/client';
import { runMigrations } from './db/migrate';
import { grantAdminRole, ensureThemesSeeded, backfillThemeIcons } from './bootstrap';
import { createEmailSender } from './email/sender';
import { PostgresAttachmentsRepository } from './repositories/attachments.repository';
import { PostgresItemsRepository } from './repositories/items.repository';
import { PostgresPasswordResetTokensRepository } from './repositories/password-reset-tokens.repository';
import { PostgresTagCategoriesRepository } from './repositories/tag-categories.repository';
import { PostgresTagsRepository } from './repositories/tags.repository';
import { PostgresThemesRepository } from './repositories/themes.repository';
import { PostgresUsersRepository } from './repositories/users.repository';
import { ThemesService } from './services/themes.service';
import { createAttachmentStorage } from './storage/storage';

const environment = parseApiEnvironment(process.env);

// Any failure below rejects the top-level await, so the process exits non-zero before it listens.
const { db } = createDatabase(environment.databaseUrl, {
  mode: environment.databaseSsl,
  caPath: environment.databaseSslCa,
});
await runMigrations(db);
const users = new PostgresUsersRepository(db);
const themes = new PostgresThemesRepository(db);
const themesService = new ThemesService(themes, users);
await grantAdminRole(users, environment.adminEmail);
await ensureThemesSeeded(themesService);
await backfillThemeIcons(themesService);
const attachmentStorage = createAttachmentStorage({
  supabaseUrl: environment.supabaseUrl,
  supabaseServiceRoleKey: environment.supabaseServiceRoleKey,
  bucket: environment.attachmentBucket,
});
if (!attachmentStorage) {
  console.info('Attachment file storage is not configured; file endpoints answer 503.');
}
const app = createApp({
  items: new PostgresItemsRepository(db),
  attachments: new PostgresAttachmentsRepository(db),
  attachmentStorage,
  attachmentBucket: environment.attachmentBucket,
  attachmentMaxBytes: environment.attachmentMaxBytes,
  tags: new PostgresTagsRepository(db),
  tagCategories: new PostgresTagCategoriesRepository(db),
  themes,
  users,
  resetTokens: new PostgresPasswordResetTokensRepository(db),
  emailSender: createEmailSender({ smtpUrl: environment.smtpUrl, mailFrom: environment.mailFrom }),
  sessionSecret: environment.sessionSecret,
  corsOrigin: environment.corsOrigin,
  appBaseUrl: environment.appBaseUrl,
  passwordResetTtlMinutes: environment.passwordResetTtlMinutes,
});
app.listen(environment.port, () =>
  console.info(`Conjuros API listening on port ${environment.port}`),
);
