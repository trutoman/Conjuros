import 'dotenv/config';
import { createApp } from './app';
import { parseApiEnvironment } from './config/environment';
import { getDatabase } from './repositories/connection';
import { grantAdminRole, ensureThemesSeeded, backfillThemeIcons } from './bootstrap';
import { MongoItemsRepository } from './repositories/items.repository';
import { MongoTagsRepository } from './repositories/tags.repository';
import { MongoThemesRepository } from './repositories/themes.repository';
import { MongoUsersRepository } from './repositories/users.repository';
import { ThemesService } from './services/themes.service';

const environment = parseApiEnvironment(process.env);

const database = await getDatabase(environment.mongoUri, environment.databaseName);
const users = new MongoUsersRepository(database);
const themes = new MongoThemesRepository(database);
const themesService = new ThemesService(themes, users);
await grantAdminRole(users, environment.adminEmail);
await ensureThemesSeeded(themesService);
await backfillThemeIcons(themesService);
const app = createApp({
	items: new MongoItemsRepository(database),
	tags: new MongoTagsRepository(database),
	themes,
	users,
	sessionSecret: environment.sessionSecret,
	corsOrigin: environment.corsOrigin,
});
app.listen(environment.port, () => console.info(`Conjuros API listening on port ${environment.port}`));