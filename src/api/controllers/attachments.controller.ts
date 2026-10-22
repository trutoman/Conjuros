import multer from 'multer';
import type { RequestHandler } from 'express';
import { itemIdSchema } from '@conjuros/contracts';
import { AppError } from '../errors';
import type { AttachmentsService, UploadedFile } from '../services/attachments.service';

type AuthenticatedRequest = Parameters<RequestHandler>[0] & {
  currentUser?: { id: string; email: string };
  file?: UploadedFile;
};

function userId(request: AuthenticatedRequest): string {
  if (!request.currentUser) throw new Error('Authenticated route is missing a user');
  return request.currentUser.id;
}

function itemId(request: AuthenticatedRequest): string {
  return itemIdSchema.parse(request.params.id);
}

export function createAttachmentsController(
  service: AttachmentsService,
  maxBytes: number,
): Record<string, RequestHandler> {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxBytes, files: 1, fields: 0 },
  }).single('file');

  return {
    ensureConfigured: (_request, _response, next) => {
      try {
        service.assertConfigured();
        next();
      } catch (error) {
        next(error);
      }
    },
    receiveFile: (request, response, next) => {
      upload(request, response, (error: unknown) => {
        if (error instanceof multer.MulterError) {
          next(
            error.code === 'LIMIT_FILE_SIZE'
              ? new AppError(413, 'FILE_TOO_LARGE', 'The file exceeds the maximum allowed size')
              : new AppError(400, 'VALIDATION_ERROR', 'Send exactly one file in the "file" field'),
          );
          return;
        }
        next(error);
      });
    },
    store: (request, response, next) => {
      const current = request as AuthenticatedRequest;
      void service
        .store(userId(current), itemId(current), current.file)
        .then((item) => response.json(item))
        .catch(next);
    },
    download: (request, response, next) => {
      const current = request as AuthenticatedRequest;
      void service
        .downloadUrl(userId(current), itemId(current))
        .then((result) => response.json(result))
        .catch(next);
    },
    remove: (request, response, next) => {
      const current = request as AuthenticatedRequest;
      void service
        .remove(userId(current), itemId(current))
        .then((item) => response.json(item))
        .catch(next);
    },
  };
}
