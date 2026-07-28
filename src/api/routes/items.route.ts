import { Router } from 'express';
import type { RequestHandler } from 'express';

export function createItemsRouter(controller: Record<string, RequestHandler>, requireAuth: RequestHandler) {
  return Router()
    .use(requireAuth)
    .get('/', controller.list)
    .post('/', controller.create)
    .get('/:id', controller.get)
    .patch('/:id', controller.update)
    .delete('/:id', controller.delete)
    .patch('/:id/reorder', controller.reorder);
}