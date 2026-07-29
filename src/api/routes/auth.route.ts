import { Router } from 'express';
import type { RequestHandler } from 'express';

export function createAuthRouter(controller: Record<string, RequestHandler>, requireAuth: RequestHandler) {
  return Router()
    .post('/register', controller.register)
    .post('/login', controller.login)
    .post('/logout', controller.logout)
    .get('/me', requireAuth, controller.me)
    .patch('/me/theme', requireAuth, controller.updateTheme);
}