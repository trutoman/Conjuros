import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import type { ItemsRepository } from './repositories/items.repository';
import type { TagsRepository } from './repositories/tags.repository';
import type { UsersRepository } from './repositories/users.repository';
import { errorHandler } from './errors';
import { requireAuth } from './middleware/auth';
import { createAuthController } from './controllers/auth.controller';
import { createItemsController } from './controllers/items.controller';
import { createTagsController } from './controllers/tags.controller';
import { createAuthRouter } from './routes/auth.route';
import { createItemsRouter } from './routes/items.route';
import { createTagsRouter } from './routes/tags.route';
import { ItemsService } from './services/items.service';
import { TagsService } from './services/tags.service';

export interface AppDependencies {
  items: ItemsRepository;
  tags: TagsRepository;
  users: UsersRepository;
  sessionSecret: string;
}

export function createApp(dependencies: AppDependencies) {
  const app = express();
  const auth = requireAuth(dependencies.sessionSecret);
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
  app.use('/api/auth', createAuthRouter(createAuthController(dependencies.users, dependencies.sessionSecret), auth));
  const tagsService = new TagsService(dependencies.tags, dependencies.items);
  app.use('/api/tags', createTagsRouter(createTagsController(tagsService), auth));
  app.use('/api/items', createItemsRouter(createItemsController(new ItemsService(dependencies.items, tagsService)), auth));
  app.use(errorHandler);
  return app;
}