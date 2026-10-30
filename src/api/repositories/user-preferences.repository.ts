import { eq } from 'drizzle-orm';
import type { UserPreferences, UserPreferencesUpdate } from '@conjuros/contracts';
import type { Database } from '../db/client';
import { userPreferences } from '../db/schema';

export const defaultUserPreferences: UserPreferences = { themeId: null, tagsPanelExpanded: true };

export interface UserPreferencesRepository {
  get(userId: string): Promise<UserPreferences>;
  upsert(userId: string, update: UserPreferencesUpdate): Promise<UserPreferences>;
}

function changes(update: UserPreferencesUpdate) {
  const set: Partial<UserPreferences> = {};
  if (update.themeId !== undefined) set.themeId = update.themeId;
  if (update.tagsPanelExpanded !== undefined) set.tagsPanelExpanded = update.tagsPanelExpanded;
  return set;
}

export class InMemoryUserPreferencesRepository implements UserPreferencesRepository {
  private readonly preferences = new Map<string, UserPreferences>();

  async get(userId: string): Promise<UserPreferences> {
    return { ...(this.preferences.get(userId) ?? defaultUserPreferences) };
  }

  async upsert(userId: string, update: UserPreferencesUpdate): Promise<UserPreferences> {
    const next = { ...(await this.get(userId)), ...changes(update) };
    this.preferences.set(userId, next);
    return { ...next };
  }
}

export class PostgresUserPreferencesRepository implements UserPreferencesRepository {
  constructor(private readonly db: Database) {}

  async get(userId: string): Promise<UserPreferences> {
    const [row] = await this.db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    return row ? { themeId: row.themeId, tagsPanelExpanded: row.tagsPanelExpanded } : { ...defaultUserPreferences };
  }

  async upsert(userId: string, update: UserPreferencesUpdate): Promise<UserPreferences> {
    const set = changes(update);
    const [row] = await this.db
      .insert(userPreferences)
      .values({
        userId,
        themeId: set.themeId ?? null,
        tagsPanelExpanded: set.tagsPanelExpanded ?? defaultUserPreferences.tagsPanelExpanded,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: { ...set, updatedAt: new Date() },
      })
      .returning();
    return { themeId: row.themeId, tagsPanelExpanded: row.tagsPanelExpanded };
  }
}
