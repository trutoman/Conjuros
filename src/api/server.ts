import 'dotenv/config';
import { createApp } from './app';
import { parseApiEnvironment } from './config/environment';
import { createDatabase } from './db/client';
import { runMigrations } from './db/migrate';
import { grantAdminRole, ensureThemesSeeded, backfillThemeIcons } from './bootstrap';
import { PostgresItemsRepository } from './repositories/items.repository';
import { PostgresTagCategoriesRepository } from './repositories/tag-categories.repository';
import { PostgresTagsRepository } from './repositories/tags.repository';
import { PostgresThemesRepository } from './repositories/themes.repository';
import { PostgresUsersRepository } from './repositories/users.repository';
import { ThemesService } from './services/themes.service';

const environment = parseApiEnvironment(process.env);

// Any failure below rejects the top-level await, so the process exits non-zero before it listens.
const { db } = createDatabase(environment.databaseUrl);
await runMigrations(db);
const users = new PostgresUsersRepository(db);
const themes = new PostgresThemesRepository(db);
const themesService = new ThemesService(themes, users);
await grantAdminRole(users, environment.adminEmail);
await ensureThemesSeeded(themesService);
await backfillThemeIcons(themesService);
const app = createApp({
  items: new PostgresItemsRepository(db),
  tags: new PostgresTagsRepository(db),
  tagCategories: new PostgresTagCategoriesRepository(db),
  themes,
  users,
  sessionSecret: environment.sessionSecret,
  corsOrigin: environment.corsOrigin,
});
app.listen(environment.port, () =>
  console.info(`Conjuros API listening on port ${environment.port}`),
);
