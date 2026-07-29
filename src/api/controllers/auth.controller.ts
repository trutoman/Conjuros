import type { RequestHandler } from 'express';
import { credentialsSchema, themePreferenceUpdateSchema } from '@conjuros/contracts';
import { AppError } from '../errors';
import type { UsersRepository } from '../repositories/users.repository';
import { authenticateUser, createSession, readAuthenticatedUserProfile, registerUser, updateAuthenticatedUserTheme } from '../services/auth.service';
import { parseOrThrow } from '../utils/http';

const sessionOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export function createAuthController(users: UsersRepository, sessionSecret: string): Record<string, RequestHandler> {
  async function authenticate(request: Parameters<RequestHandler>[0], response: Parameters<RequestHandler>[1], mode: 'register' | 'login') {
    const credentials = parseOrThrow(credentialsSchema, request.body);
    const authenticatedUser = mode === 'register'
      ? await registerUser(users, credentials)
      : await authenticateUser(users, credentials);
    const user = await readAuthenticatedUserProfile(users, authenticatedUser);
    response.cookie('conjuros_session', createSession(authenticatedUser, sessionSecret), sessionOptions).status(mode === 'register' ? 201 : 200).json({ user });
  }

  async function updateTheme(request: Parameters<RequestHandler>[0], response: Parameters<RequestHandler>[1]) {
    const body = parseOrThrow(themePreferenceUpdateSchema, request.body);
    const currentUser = (request as Parameters<RequestHandler>[0] & { currentUser?: { id: string; email: string } }).currentUser;
    if (!currentUser) throw new AppError(401, 'AUTH_ERROR', 'Authentication is required');
    const user = await updateAuthenticatedUserTheme(users, currentUser.id, body.theme);
    response.json({ user });
  }

  return {
    register: (request, response, next) => { void authenticate(request, response, 'register').catch(next); },
    login: (request, response, next) => { void authenticate(request, response, 'login').catch(next); },
    logout: (_request, response) => { response.clearCookie('conjuros_session', { path: '/' }).status(204).end(); },
    me: (request, response, next) => {
      const currentUser = (request as Parameters<RequestHandler>[0] & { currentUser?: { id: string; email: string } }).currentUser;
      if (!currentUser) {
        next(new AppError(401, 'AUTH_ERROR', 'Authentication is required'));
        return;
      }
      void readAuthenticatedUserProfile(users, currentUser).then((user) => response.json({ user })).catch(next);
    },
    updateTheme: (request, response, next) => { void updateTheme(request, response).catch(next); },
  };
}