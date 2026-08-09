import { randomUUID } from 'node:crypto';
import type { Collection, Db } from 'mongodb';
import type { Role, ThemePreference } from '@conjuros/contracts';

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

export class MongoUsersRepository implements UsersRepository {
  private readonly users: Collection<StoredUser>;

  constructor(database: Db) {
    this.users = database.collection<StoredUser>('users');
  }

  private hydrate(user: StoredUser | null): StoredUser | null {
    if (!user) return null;
    return { ...user, theme: user.theme ?? 'light', role: user.role ?? 'user' };
  }

  async findByEmail(email: string): Promise<StoredUser | null> {
    return this.hydrate(await this.users.findOne({ email }));
  }

  async findById(id: string): Promise<StoredUser | null> {
    return this.hydrate(await this.users.findOne({ id }));
  }

  async create(email: string, passwordHash: string): Promise<StoredUser> {
    const user = { id: randomUUID(), email, passwordHash, createdAt: new Date().toISOString(), theme: 'light' as const, role: 'user' as const };
    await this.users.insertOne(user);
    return user;
  }

  async updateTheme(id: string, theme: ThemePreference): Promise<StoredUser | null> {
    const result = await this.users.findOneAndUpdate(
      { id },
      { $set: { theme } },
      { returnDocument: 'after' },
    );
    return this.hydrate(result);
  }

  async setRole(id: string, role: Role): Promise<StoredUser | null> {
    const result = await this.users.findOneAndUpdate(
      { id },
      { $set: { role } },
      { returnDocument: 'after' },
    );
    return this.hydrate(result);
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
    const user = { id: randomUUID(), email, passwordHash, createdAt: new Date().toISOString(), theme: 'light' as const, role: 'user' as const };
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