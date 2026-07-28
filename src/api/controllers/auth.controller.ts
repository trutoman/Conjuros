import type { RequestHandler } from 'express';
import { credentialsSchema } from '@conjuros/contracts';
import type { UsersRepository } from '../repositories/users.repository';
import { authenticateUser, createSession, registerUser } from '../services/auth.service';
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
    const user = mode === 'register'
      ? await registerUser(users, credentials)
      : await authenticateUser(users, credentials);
    response.cookie('conjuros_session', createSession(user, sessionSecret), sessionOptions).status(mode === 'register' ? 201 : 200).json({ user });
  }

  return {
    register: (request, response, next) => { void authenticate(request, response, 'register').catch(next); },
    login: (request, response, next) => { void authenticate(request, response, 'login').catch(next); },
    logout: (_request, response) => { response.clearCookie('conjuros_session', { path: '/' }).status(204).end(); },
    me: (request, response) => response.json({ user: (request as Parameters<RequestHandler>[0] & { currentUser?: { id: string; email: string } }).currentUser }),
  };
}