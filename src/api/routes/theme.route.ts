import { Router } from 'express';
import type { RequestHandler } from 'express';

export function createThemesRouter(
  controller: Record<string, RequestHandler>,
  requireAuth: RequestHandler,
  requireAdmin: RequestHandler,
) {
  return Router()
    .use(requireAuth)
    .get('/', controller.list)
    .get('/active', controller.getActive)
    .get('/:id', controller.get)
    .post('/', requireAdmin, controller.create)
    .patch('/:id', requireAdmin, controller.update)
    .delete('/:id', requireAdmin, controller.delete)
    .patch('/:id/activate', requireAdmin, controller.activate);
}