import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import type { ItemsRepository } from './repositories/items.repository';
import type { TagsRepository } from './repositories/tags.repository';
import type { ThemesRepository } from './repositories/themes.repository';
import type { UsersRepository } from './repositories/users.repository';
import { errorHandler } from './errors';
import { requireAdmin, requireAuth } from './middleware/auth';
import { createAuthController } from './controllers/auth.controller';
import { createItemsController } from './controllers/items.controller';
import { createTagsController } from './controllers/tags.controller';
import { createThemesController } from './controllers/theme.controller';
import { createAuthRouter } from './routes/auth.route';
import { createItemsRouter } from './routes/items.route';
import { createTagsRouter } from './routes/tags.route';
import { createThemesRouter } from './routes/theme.route';
import { ItemsService } from './services/items.service';
import { TagsService } from './services/tags.service';
import { ThemesService } from './services/themes.service';

export interface AppDependencies {
  items: ItemsRepository;
  tags: TagsRepository;
  themes: ThemesRepository;
  users: UsersRepository;
  sessionSecret: string;
  corsOrigin?: string;
}

export function createApp(dependencies: AppDependencies) {
  const app = express();
  const auth = requireAuth(dependencies.sessionSecret);
  const admin = requireAdmin(dependencies.users);
  app.use(cors({ origin: dependencies.corsOrigin ?? 'http://localhost:5173', credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
  app.use('/api/auth', createAuthRouter(createAuthController(dependencies.users, dependencies.sessionSecret), auth));
  const themesService = new ThemesService(dependencies.themes, dependencies.users);
  const tagsService = new TagsService(dependencies.tags, dependencies.items, themesService);
  app.use('/api/tags', createTagsRouter(createTagsController(tagsService), auth));
  app.use('/api/items', createItemsRouter(createItemsController(new ItemsService(dependencies.items, tagsService)), auth));
  app.use('/api/themes', createThemesRouter(createThemesController(themesService), auth, admin));
  app.use(errorHandler);
  return app;
}