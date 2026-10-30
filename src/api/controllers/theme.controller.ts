import multer from 'multer';
import type { RequestHandler } from 'express';
import { themeImageMaxBytes } from '@conjuros/contracts';
import { AppError } from '../errors';
import type { UploadedFile } from '../services/attachments.service';
import type { ThemesService } from '../services/themes.service';

type AuthenticatedRequest = Parameters<RequestHandler>[0] & {
  currentUser?: { id: string; email: string };
  file?: UploadedFile;
};

function currentUser(request: Parameters<RequestHandler>[0]): { id: string; email: string } {
  const user = (request as Parameters<RequestHandler>[0] & { currentUser?: { id: string; email: string } }).currentUser;
  if (!user) throw new Error('Authenticated route is missing a user');
  return user;
}

export function createThemesController(service: ThemesService): Record<string, RequestHandler> {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: themeImageMaxBytes, files: 1, fields: 0 },
  }).single('image');

  return {
    list: (request, response, next) => {
      void service.list(service.parseQuery(request.query)).then((result) => response.json(result)).catch(next);
    },
    get: (request, response, next) => {
      void service.get(service.parseId(request.params.id)).then((theme) => response.json(theme)).catch(next);
    },
    getActive: (request, response, next) => {
      void service.getActiveForUser(currentUser(request).id).then((context) => response.json(context)).catch(next);
    },
    create: (request, response, next) => {
      void service.create(service.parseInput(request.body)).then((theme) => response.status(201).json(theme)).catch(next);
    },
    update: (request, response, next) => {
      void service.update(service.parseId(request.params.id), service.parseUpdate(request.body)).then((theme) => response.json(theme)).catch(next);
    },
    delete: (request, response, next) => {
      void service.delete(service.parseId(request.params.id)).then(() => response.status(204).end()).catch(next);
    },
    activate: (request, response, next) => {
      void service.setActive(service.parseId(request.params.id)).then((theme) => response.json(theme)).catch(next);
    },
    ensureImageStorage: (_request, _response, next) => {
      try {
        service.assertImageStorageConfigured();
        next();
      } catch (error) {
        next(error);
      }
    },
    receiveImage: (request, response, next) => {
      upload(request, response, (error: unknown) => {
        if (error instanceof multer.MulterError) {
          next(
            error.code === 'LIMIT_FILE_SIZE'
              ? new AppError(413, 'FILE_TOO_LARGE', 'The image exceeds the maximum allowed size')
              : new AppError(400, 'VALIDATION_ERROR', 'Send exactly one image in the "image" field'),
          );
          return;
        }
        next(error);
      });
    },
    uploadImage: (request, response, next) => {
      const current = request as AuthenticatedRequest;
      void service
        .uploadImageBackdrop(service.parseId(current.params.id), current.file)
        .then((theme) => response.json(theme))
        .catch(next);
    },
  };
}
