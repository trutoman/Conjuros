import { randomUUID } from 'node:crypto';
import {
  attachmentExtensions,
  isAttachmentMimeType,
  type AttachmentDownload,
  type AttachmentPreview,
} from '@conjuros/contracts';
import { AppError } from '../errors';
import type { AttachmentsRepository } from '../repositories/attachments.repository';
import type { ItemsRepository } from '../repositories/items.repository';
import { fileMatchesMimeType } from '../storage/fileSignature';
import type { AttachmentStorage } from '../storage/storage';
import { toPublicItem } from './items.service';

export const signedUrlLifetimeSeconds = 300;

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export function sanitizeFilename(name: string): string {
  const base = name.replace(/\\/g, '/').split('/').pop() ?? '';
  const cleaned = Array.from(base)
    .filter((character) => character.charCodeAt(0) > 31 && character.charCodeAt(0) !== 127)
    .join('')
    .trim();
  if (cleaned.length <= 128) return cleaned || 'attachment';
  const dot = cleaned.lastIndexOf('.');
  const extension = dot > 0 && cleaned.length - dot <= 16 ? cleaned.slice(dot) : '';
  return `${cleaned.slice(0, 128 - extension.length)}${extension}`;
}

export class AttachmentsService {
  constructor(
    private readonly items: ItemsRepository,
    private readonly attachments: AttachmentsRepository,
    private readonly storage: AttachmentStorage | null,
    private readonly bucket: string,
    private readonly maxBytes: number,
  ) {}

  assertConfigured(): AttachmentStorage {
    if (!this.storage) {
      throw new AppError(
        503,
        'STORAGE_NOT_CONFIGURED',
        'File storage is not configured on this server',
      );
    }
    return this.storage;
  }

  async store(ownerId: string, itemId: string, file: UploadedFile | undefined) {
    const storage = this.assertConfigured();
    const item = await this.items.findOwned(itemId, ownerId);
    if (!item) throw new AppError(404, 'NOT_FOUND', 'Collection item not found');
    if (item.kind !== 'attachment') {
      throw new AppError(409, 'CONFLICT', 'Only attachment items can hold a file');
    }
    if (!file || file.buffer.length === 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'A non-empty file is required');
    }
    if (file.buffer.length > this.maxBytes) {
      throw new AppError(413, 'FILE_TOO_LARGE', 'The file exceeds the maximum allowed size');
    }
    if (!isAttachmentMimeType(file.mimetype) || !fileMatchesMimeType(file.buffer, file.mimetype)) {
      throw new AppError(415, 'UNSUPPORTED_FILE_TYPE', 'This file type is not supported');
    }

    const attachmentId = randomUUID();
    const objectPath = `${ownerId}/${attachmentId}.${attachmentExtensions[file.mimetype]}`;
    await storage.upload(objectPath, file.buffer, file.mimetype);

    let replaced;
    try {
      replaced = await this.attachments.replaceForItem({
        id: attachmentId,
        userId: ownerId,
        itemId,
        bucketId: this.bucket,
        objectPath,
        originalFilename: sanitizeFilename(file.originalname),
        mimeType: file.mimetype,
        sizeBytes: file.buffer.length,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      await this.removeQuietly([objectPath]);
      throw error;
    }
    if (!replaced) {
      await this.removeQuietly([objectPath]);
      throw new AppError(404, 'NOT_FOUND', 'Collection item not found');
    }
    if (replaced.previousObjectPath) await this.removeQuietly([replaced.previousObjectPath]);
    return toPublicItem(replaced.item);
  }

  async downloadUrl(ownerId: string, itemId: string): Promise<AttachmentDownload> {
    const storage = this.assertConfigured();
    const attachment = await this.attachments.findByItem(ownerId, itemId);
    if (!attachment) throw new AppError(404, 'NOT_FOUND', 'Attachment file not found');
    const url = await storage.createSignedUrl(
      attachment.objectPath,
      signedUrlLifetimeSeconds,
      attachment.originalFilename,
    );
    return { url, expiresInSeconds: signedUrlLifetimeSeconds };
  }

  async previewUrl(ownerId: string, itemId: string): Promise<AttachmentPreview> {
    const storage = this.assertConfigured();
    const attachment = await this.attachments.findByItem(ownerId, itemId);
    if (!attachment) throw new AppError(404, 'NOT_FOUND', 'Attachment file not found');
    if (!attachment.mimeType.startsWith('image/')) {
      throw new AppError(
        415,
        'UNSUPPORTED_FILE_TYPE',
        'Only image attachments can be previewed inline',
      );
    }
    const url = await storage.createSignedUrl(attachment.objectPath, signedUrlLifetimeSeconds);
    return { url, expiresInSeconds: signedUrlLifetimeSeconds };
  }

  async remove(ownerId: string, itemId: string) {
    this.assertConfigured();
    const removed = await this.attachments.deleteForItem(ownerId, itemId);
    if (!removed) throw new AppError(404, 'NOT_FOUND', 'Attachment file not found');
    await this.removeQuietly([removed.attachment.objectPath]);
    return toPublicItem(removed.item);
  }

  private async removeQuietly(paths: string[]) {
    try {
      await this.storage?.remove(paths);
    } catch (error) {
      console.error('Could not remove attachment objects from storage', paths, error);
    }
  }
}
