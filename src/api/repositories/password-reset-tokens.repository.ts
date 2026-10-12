import { randomUUID } from 'node:crypto';
import { and, eq, isNull } from 'drizzle-orm';
import type { Database } from '../db/client';
import { passwordResetTokens } from '../db/schema';

export interface StoredPasswordResetToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export interface CreatePasswordResetTokenInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface PasswordResetTokensRepository {
  create(input: CreatePasswordResetTokenInput): Promise<StoredPasswordResetToken>;
  findByTokenHash(tokenHash: string): Promise<StoredPasswordResetToken | null>;
  markUsed(id: string, usedAt: Date): Promise<void>;
  deleteUnusedForUser(userId: string): Promise<void>;
}

function toStoredToken(row: typeof passwordResetTokens.$inferSelect): StoredPasswordResetToken {
  return {
    id: row.id,
    userId: row.userId,
    tokenHash: row.tokenHash,
    expiresAt: row.expiresAt.toISOString(),
    usedAt: row.usedAt ? row.usedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export class PostgresPasswordResetTokensRepository implements PasswordResetTokensRepository {
  constructor(private readonly db: Database) {}

  async create(input: CreatePasswordResetTokenInput): Promise<StoredPasswordResetToken> {
    const [row] = await this.db
      .insert(passwordResetTokens)
      .values({
        id: randomUUID(),
        userId: input.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
        createdAt: new Date(),
      })
      .returning();
    return toStoredToken(row);
  }

  async findByTokenHash(tokenHash: string): Promise<StoredPasswordResetToken | null> {
    const [row] = await this.db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, tokenHash));
    return row ? toStoredToken(row) : null;
  }

  async markUsed(id: string, usedAt: Date): Promise<void> {
    await this.db.update(passwordResetTokens).set({ usedAt }).where(eq(passwordResetTokens.id, id));
  }

  async deleteUnusedForUser(userId: string): Promise<void> {
    await this.db
      .delete(passwordResetTokens)
      .where(and(eq(passwordResetTokens.userId, userId), isNull(passwordResetTokens.usedAt)));
  }
}

export class InMemoryPasswordResetTokensRepository implements PasswordResetTokensRepository {
  private readonly tokens = new Map<string, StoredPasswordResetToken>();

  async create(input: CreatePasswordResetTokenInput): Promise<StoredPasswordResetToken> {
    if ([...this.tokens.values()].some((token) => token.tokenHash === input.tokenHash)) {
      throw new Error('A token with this hash already exists');
    }
    const token: StoredPasswordResetToken = {
      id: randomUUID(),
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt.toISOString(),
      usedAt: null,
      createdAt: new Date().toISOString(),
    };
    this.tokens.set(token.id, token);
    return token;
  }

  async findByTokenHash(tokenHash: string): Promise<StoredPasswordResetToken | null> {
    return [...this.tokens.values()].find((token) => token.tokenHash === tokenHash) ?? null;
  }

  async markUsed(id: string, usedAt: Date): Promise<void> {
    const current = this.tokens.get(id);
    if (!current) return;
    this.tokens.set(id, { ...current, usedAt: usedAt.toISOString() });
  }

  async deleteUnusedForUser(userId: string): Promise<void> {
    for (const [id, token] of this.tokens) {
      if (token.userId === userId && token.usedAt === null) {
        this.tokens.delete(id);
      }
    }
  }
}
