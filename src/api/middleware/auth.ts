import type { RequestHandler } from 'express';
import { AppError } from '../errors';
import { readSession } from '../services/auth.service';

type AuthenticatedRequest = Parameters<RequestHandler>[0] & {
  currentUser?: { id: string; email: string };
};

export function requireAuth(sessionSecret: string): RequestHandler {
  return (request, _response, next) => {
    const token = request.cookies?.conjuros_session;
    if (typeof token !== 'string') return next(new AppError(401, 'AUTH_ERROR', 'Authentication is required'));
    try {
      (request as AuthenticatedRequest).currentUser = readSession(token, sessionSecret);
      next();
    } catch (error) {
      next(error);
    }
  };
}