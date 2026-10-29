import { and, eq, sql } from 'drizzle-orm';
import type { Database } from '../db/client';
import { attachments, collectionItems } from '../db/schema';
import {
  toStoredItem,
  type InMemoryItemsRepository,
  type StoredCollectionItem,
} from './items.repository';

export interface StoredAttachment {
  id: string;
  userId: string;
  itemId: string;
  bucketId: string;
  objectPath: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface AttachmentsRepository {
  findByItem(ownerId: string, itemId: string): Promise<StoredAttachment | null>;
  // Replaces the item's file row and points the item at it in one step.
  replaceForItem(
    attachment: StoredAttachment,
  ): Promise<{ previousObjectPath: string | null; item: StoredCollectionItem } | null>;
  deleteForItem(
    ownerId: string,
    itemId: string,
  ): Promise<{ attachment: StoredAttachment; item: StoredCollectionItem } | null>;
}

function toStoredAttachment(row: typeof attachments.$inferSelect): StoredAttachment {
  return {
    id: row.id,
    userId: row.userId,
    itemId: row.itemId,
    bucketId: row.bucketId,
    objectPath: row.objectPath,
    originalFilename: row.originalFilename,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    createdAt: row.createdAt.toISOString(),
  };
}

export class PostgresAttachmentsRepository implements AttachmentsRepository {
  constructor(private readonly db: Database) {}

  async findByItem(ownerId: string, itemId: string) {
    const [row] = await this.db
      .select()
      .from(attachments)
      .where(and(eq(attachments.itemId, itemId), eq(attachments.userId, ownerId)));
    return row ? toStoredAttachment(row) : null;
  }

  async replaceForItem(attachment: StoredAttachment) {
    return this.db.transaction(async (tx) => {
      const [previous] = await tx
        .delete(attachments)
        .where(eq(attachments.itemId, attachment.itemId))
        .returning({ objectPath: attachments.objectPath });
      await tx.insert(attachments).values({
        ...attachment,
        createdAt: new Date(attachment.createdAt),
      });
      const [row] = await tx
        .update(collectionItems)
        .set({
          storagePath: attachment.objectPath,
          filename: sql`coalesce(nullif(${collectionItems.filename}, ''), ${attachment.originalFilename})`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(collectionItems.id, attachment.itemId),
            eq(collectionItems.ownerId, attachment.userId),
          ),
        )
        .returning();
      if (!row) throw new Error('Attachment item disappeared during upload');
      return {
        previousObjectPath: previous?.objectPath ?? null,
        item: toStoredItem(row, attachment.mimeType),
      };
    });
  }

  async deleteForItem(ownerId: string, itemId: string) {
    return this.db.transaction(async (tx) => {
      const [removed] = await tx
        .delete(attachments)
        .where(and(eq(attachments.itemId, itemId), eq(attachments.userId, ownerId)))
        .returning();
      if (!removed) return null;
      const [row] = await tx
        .update(collectionItems)
        .set({ storagePath: null, updatedAt: new Date() })
        .where(and(eq(collectionItems.id, itemId), eq(collectionItems.ownerId, ownerId)))
        .returning();
      return { attachment: toStoredAttachment(removed), item: toStoredItem(row, null) };
    });
  }
}

export class InMemoryAttachmentsRepository implements AttachmentsRepository {
  private readonly rows = new Map<string, StoredAttachment>();

  constructor(private readonly items: InMemoryItemsRepository) {}

  async findByItem(ownerId: string, itemId: string) {
    const row = this.rows.get(itemId);
    return row && row.userId === ownerId ? row : null;
  }

  async replaceForItem(attachment: StoredAttachment) {
    const item = await this.items.findOwned(attachment.itemId, attachment.userId);
    if (!item) return null;
    const previous = this.rows.get(attachment.itemId) ?? null;
    this.rows.set(attachment.itemId, attachment);
    const updated = await this.items.replace({
      ...item,
      storagePath: attachment.objectPath,
      filename: item.filename || attachment.originalFilename,
      mimeType: attachment.mimeType,
      updatedAt: new Date().toISOString(),
    });
    return { previousObjectPath: previous?.objectPath ?? null, item: updated };
  }

  async deleteForItem(ownerId: string, itemId: string) {
    const attachment = await this.findByItem(ownerId, itemId);
    const item = await this.items.findOwned(itemId, ownerId);
    if (!attachment || !item) return null;
    this.rows.delete(itemId);
    const updated = await this.items.replace({
      ...item,
      storagePath: null,
      mimeType: null,
      updatedAt: new Date().toISOString(),
    });
    return { attachment, item: updated };
  }
}
