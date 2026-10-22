import { z } from 'zod';

export const attachmentMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-7z-compressed',
  'application/gzip',
  'application/x-tar',
] as const;

export type AttachmentMimeType = (typeof attachmentMimeTypes)[number];

export const attachmentMaxBytes = 52_428_800;

export const attachmentExtensions: Record<AttachmentMimeType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'text/plain': 'txt',
  'text/csv': 'csv',
  'application/zip': 'zip',
  'application/x-7z-compressed': '7z',
  'application/gzip': 'gz',
  'application/x-tar': 'tar',
};

export function isAttachmentMimeType(value: string): value is AttachmentMimeType {
  return (attachmentMimeTypes as readonly string[]).includes(value);
}

export const attachmentDownloadSchema = z.object({
  url: z.string().url(),
  expiresInSeconds: z.number().int().positive(),
});

export type AttachmentDownload = z.infer<typeof attachmentDownloadSchema>;
