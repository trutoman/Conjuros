import { randomUUID } from 'node:crypto';
import type { Collection, Db } from 'mongodb';

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface UsersRepository {
  findByEmail(email: string): Promise<StoredUser | null>;
  findById(id: string): Promise<StoredUser | null>;
  create(email: string, passwordHash: string): Promise<StoredUser>;
}

export class MongoUsersRepository implements UsersRepository {
  private readonly users: Collection<StoredUser>;

  constructor(database: Db) {
    this.users = database.collection<StoredUser>('users');
  }

  async findByEmail(email: string): Promise<StoredUser | null> {
    return this.users.findOne({ email });
  }

  async findById(id: string): Promise<StoredUser | null> {
    return this.users.findOne({ id });
  }

  async create(email: string, passwordHash: string): Promise<StoredUser> {
    const user = { id: randomUUID(), email, passwordHash, createdAt: new Date().toISOString() };
    await this.users.insertOne(user);
    return user;
  }
}

export class InMemoryUsersRepository implements UsersRepository {
  private readonly users = new Map<string, StoredUser>();

  async findByEmail(email: string): Promise<StoredUser | null> {
    return [...this.users.values()].find((user) => user.email === email) ?? null;
  }

  async findById(id: string): Promise<StoredUser | null> {
    return this.users.get(id) ?? null;
  }

  async create(email: string, passwordHash: string): Promise<StoredUser> {
    const user = { id: randomUUID(), email, passwordHash, createdAt: new Date().toISOString() };
    this.users.set(user.id, user);
    return user;
  }
}