import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import type { Role, ThemePreference } from '@conjuros/contracts';
import type { Database } from '../db/client';
import { users } from '../db/schema';
import { UNIQUE_VIOLATION, findSqlState } from '../db/sqlstate';
import { AppError } from '../errors';

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  theme: ThemePreference;
  role: Role;
}

export interface UsersRepository {
  findByEmail(email: string): Promise<StoredUser | null>;
  findById(id: string): Promise<StoredUser | null>;
  create(email: string, passwordHash: string): Promise<StoredUser>;
  updateTheme(id: string, theme: ThemePreference): Promise<StoredUser | null>;
  setRole(id: string, role: Role): Promise<StoredUser | null>;
}

function toStoredUser(row: typeof users.$inferSelect): StoredUser {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    createdAt: row.createdAt.toISOString(),
    theme: row.theme,
    role: row.role,
  };
}

export class PostgresUsersRepository implements UsersRepository {
  constructor(private readonly db: Database) {}

  async findByEmail(email: string): Promise<StoredUser | null> {
    const [row] = await this.db.select().from(users).where(eq(users.email, email));
    return row ? toStoredUser(row) : null;
  }

  async findById(id: string): Promise<StoredUser | null> {
    const [row] = await this.db.select().from(users).where(eq(users.id, id));
    return row ? toStoredUser(row) : null;
  }

  async create(email: string, passwordHash: string): Promise<StoredUser> {
    try {
      const [row] = await this.db
        .insert(users)
        .values({ id: randomUUID(), email, passwordHash, createdAt: new Date() })
        .returning();
      return toStoredUser(row);
    } catch (error) {
      // Two simultaneous registrations can both pass the service's lookup; the unique index decides.
      if (findSqlState(error) === UNIQUE_VIOLATION) {
        throw new AppError(409, 'CONFLICT', 'An account with this email already exists');
      }
      throw error;
    }
  }

  async updateTheme(id: string, theme: ThemePreference): Promise<StoredUser | null> {
    const [row] = await this.db.update(users).set({ theme }).where(eq(users.id, id)).returning();
    return row ? toStoredUser(row) : null;
  }

  async setRole(id: string, role: Role): Promise<StoredUser | null> {
    const [row] = await this.db.update(users).set({ role }).where(eq(users.id, id)).returning();
    return row ? toStoredUser(row) : null;
  }
}

export class InMemoryUsersRepository implements UsersRepository {
  private readonly users = new Map<string, StoredUser>();

  private hydrate(user: StoredUser | null): StoredUser | null {
    if (!user) return null;
    return { ...user, theme: user.theme ?? 'light', role: user.role ?? 'user' };
  }

  async findByEmail(email: string): Promise<StoredUser | null> {
    return this.hydrate([...this.users.values()].find((user) => user.email === email) ?? null);
  }

  async findById(id: string): Promise<StoredUser | null> {
    return this.hydrate(this.users.get(id) ?? null);
  }

  async create(email: string, passwordHash: string): Promise<StoredUser> {
    const user = {
      id: randomUUID(),
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
      theme: 'light' as const,
      role: 'user' as const,
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateTheme(id: string, theme: ThemePreference): Promise<StoredUser | null> {
    const current = this.users.get(id);
    if (!current) return null;
    const updated = { ...current, theme };
    this.users.set(id, updated);
    return updated;
  }

  async setRole(id: string, role: Role): Promise<StoredUser | null> {
    const current = this.users.get(id);
    if (!current) return null;
    const updated = { ...current, role };
    this.users.set(id, updated);
    return updated;
  }
}
