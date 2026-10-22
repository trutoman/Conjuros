import { Router } from 'express';
import type { RequestHandler } from 'express';

export function createAttachmentsRouter(
  controller: Record<string, RequestHandler>,
  requireAuth: RequestHandler,
) {
  return Router()
    .use(requireAuth)
    .put('/:id/attachment', controller.ensureConfigured, controller.receiveFile, controller.store)
    .get('/:id/attachment/download', controller.download)
    .delete('/:id/attachment', controller.remove);
}
