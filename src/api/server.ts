import 'dotenv/config';
import { createApp } from './app';
import { parseApiEnvironment } from './config/environment';
import { getDatabase } from './repositories/connection';
import { MongoItemsRepository } from './repositories/items.repository';
import { MongoTagsRepository } from './repositories/tags.repository';
import { MongoUsersRepository } from './repositories/users.repository';

const environment = parseApiEnvironment(process.env);

const database = await getDatabase(environment.mongoUri, environment.databaseName);
const app = createApp({
	items: new MongoItemsRepository(database),
	tags: new MongoTagsRepository(database),
	users: new MongoUsersRepository(database),
	sessionSecret: environment.sessionSecret,
});
app.listen(environment.port, () => console.info(`Conjuros API listening on port ${environment.port}`));