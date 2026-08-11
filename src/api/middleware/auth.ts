import type { RequestHandler } from 'express';
import { AppError } from '../errors';
import { readSession } from '../services/auth.service';
import type { UsersRepository } from '../repositories/users.repository';

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

export function requireAdmin(users: UsersRepository): RequestHandler {
  return async (request, _response, next) => {
    const currentUser = (request as AuthenticatedRequest).currentUser;
    if (!currentUser) {
      next(new AppError(401, 'AUTH_ERROR', 'Authentication is required'));
      return;
    }
    const user = await users.findById(currentUser.id);
    if (!user || user.email !== currentUser.email || user.role !== 'admin') {
      next(new AppError(403, 'FORBIDDEN', 'Admin role is required'));
      return;
    }
    next();
  };
}