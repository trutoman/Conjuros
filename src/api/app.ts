import express from 'express';
import { attachmentMaxBytes as attachmentMaxBytesDefault } from '@conjuros/contracts';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import type { EmailSender } from './email/sender';
import type { AttachmentsRepository } from './repositories/attachments.repository';
import type { AttachmentStorage } from './storage/storage';
import type { ThemeImageStorage } from './storage/themeImageStorage';
import type { ItemsRepository } from './repositories/items.repository';
import type { PasswordResetTokensRepository } from './repositories/password-reset-tokens.repository';
import type { TagCategoriesRepository } from './repositories/tag-categories.repository';
import type { TagsRepository } from './repositories/tags.repository';
import type { ThemesRepository } from './repositories/themes.repository';
import type { UserPreferencesRepository } from './repositories/user-preferences.repository';
import type { UsersRepository } from './repositories/users.repository';
import { errorHandler } from './errors';
import { requireAdmin, requireAuth } from './middleware/auth';
import { createAttachmentsController } from './controllers/attachments.controller';
import { createAuthController } from './controllers/auth.controller';
import { createItemsController } from './controllers/items.controller';
import { createTagsController } from './controllers/tags.controller';
import { createTagCategoriesController } from './controllers/tag-categories.controller';
import { createThemesController } from './controllers/theme.controller';
import { createAttachmentsRouter } from './routes/attachments.route';
import { createAuthRouter } from './routes/auth.route';
import { createItemsRouter } from './routes/items.route';
import { createTagsRouter } from './routes/tags.route';
import { createTagCategoriesRouter } from './routes/tag-categories.route';
import { createThemesRouter } from './routes/theme.route';
import { AttachmentsService } from './services/attachments.service';
import { ItemsService } from './services/items.service';
import { TagCategoriesService } from './services/tag-categories.service';
import { TagsService } from './services/tags.service';
import { ThemesService } from './services/themes.service';

export interface AppDependencies {
  items: ItemsRepository;
  attachments: AttachmentsRepository;
  attachmentStorage?: AttachmentStorage | null;
  attachmentBucket?: string;
  attachmentMaxBytes?: number;
  tags: TagsRepository;
  tagCategories: TagCategoriesRepository;
  themes: ThemesRepository;
  userPreferences: UserPreferencesRepository;
  themeImageStorage?: ThemeImageStorage | null;
  users: UsersRepository;
  resetTokens: PasswordResetTokensRepository;
  emailSender: EmailSender;
  sessionSecret: string;
  corsOrigin?: string;
  appBaseUrl?: string;
  passwordResetTtlMinutes?: number;
}

export function createApp(dependencies: AppDependencies) {
  const app = express();
  const auth = requireAuth(dependencies.sessionSecret);
  const admin = requireAdmin(dependencies.users);
  app.use(cors({ origin: dependencies.corsOrigin ?? 'http://localhost:5173', credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
  const authController = createAuthController({
    users: dependencies.users,
    themes: dependencies.themes,
    preferences: dependencies.userPreferences,
    sessionSecret: dependencies.sessionSecret,
    resetTokens: dependencies.resetTokens,
    emailSender: dependencies.emailSender,
    appBaseUrl: dependencies.appBaseUrl ?? dependencies.corsOrigin ?? 'http://localhost:5173',
    passwordResetTtlMinutes: dependencies.passwordResetTtlMinutes ?? 60,
  });
  app.use('/api/auth', createAuthRouter(authController, auth));
  const themesService = new ThemesService(dependencies.themes, dependencies.userPreferences, dependencies.themeImageStorage ?? null);
  const tagCategoriesService = new TagCategoriesService(dependencies.tagCategories);
  const tagsService = new TagsService(dependencies.tags, dependencies.items, themesService, tagCategoriesService);
  app.use('/api/tags', createTagsRouter(createTagsController(tagsService), auth));
  app.use('/api/tag-categories', createTagCategoriesRouter(createTagCategoriesController(tagCategoriesService, tagsService), auth));
  const attachmentStorage = dependencies.attachmentStorage ?? null;
  const attachmentMaxBytes = dependencies.attachmentMaxBytes ?? attachmentMaxBytesDefault;
  const attachmentsService = new AttachmentsService(
    dependencies.items,
    dependencies.attachments,
    attachmentStorage,
    dependencies.attachmentBucket ?? 'attachments',
    attachmentMaxBytes,
  );
  app.use('/api/items', createAttachmentsRouter(createAttachmentsController(attachmentsService, attachmentMaxBytes), auth));
  const itemsService = new ItemsService(dependencies.items, tagsService, {
    attachments: dependencies.attachments,
    storage: attachmentStorage,
  });
  app.use('/api/items', createItemsRouter(createItemsController(itemsService), auth));
  app.use('/api/themes', createThemesRouter(createThemesController(themesService), auth, admin));
  app.use(errorHandler);
  return app;
}