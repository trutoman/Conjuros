import type { RequestHandler } from 'express';
import {
  credentialsSchema,
  loginCredentialsSchema,
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
  themePreferenceUpdateSchema,
} from '@conjuros/contracts';
import type { EmailSender } from '../email/sender';
import { AppError } from '../errors';
import type { PasswordResetTokensRepository } from '../repositories/password-reset-tokens.repository';
import type { UsersRepository } from '../repositories/users.repository';
import { sendWelcomeEmail } from '../services/account-email.service';
import { authenticateUser, createSession, readAuthenticatedUserProfile, registerUser, updateAuthenticatedUserTheme } from '../services/auth.service';
import { requestPasswordReset, resetPassword } from '../services/password-reset.service';
import { parseCredentialsOrThrow, parseOrThrow } from '../utils/http';

const sessionOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export const PASSWORD_RESET_REQUEST_MESSAGE =
  'If an account exists for that email, we have sent password reset instructions.';
export const PASSWORD_RESET_SUCCESS_MESSAGE =
  'Your password has been reset. You can now sign in.';

export interface AuthControllerDependencies {
  users: UsersRepository;
  sessionSecret: string;
  resetTokens: PasswordResetTokensRepository;
  emailSender: EmailSender;
  appBaseUrl: string;
  passwordResetTtlMinutes: number;
}

export function createAuthController(
  dependencies: AuthControllerDependencies,
): Record<string, RequestHandler> {
  const { users, sessionSecret, resetTokens, emailSender, appBaseUrl, passwordResetTtlMinutes } =
    dependencies;

  async function authenticate(request: Parameters<RequestHandler>[0], response: Parameters<RequestHandler>[1], mode: 'register' | 'login') {
    const authenticatedUser = mode === 'register'
      ? await registerUser(users, parseCredentialsOrThrow(credentialsSchema, request.body))
      : await authenticateUser(users, parseCredentialsOrThrow(loginCredentialsSchema, request.body));
    if (mode === 'register') {
      await sendWelcomeEmail(emailSender, authenticatedUser.email, appBaseUrl);
    }
    const user = await readAuthenticatedUserProfile(users, authenticatedUser);
    response.cookie('conjuros_session', createSession(authenticatedUser, sessionSecret), sessionOptions).status(mode === 'register' ? 201 : 200).json({ user });
  }

  async function requestReset(request: Parameters<RequestHandler>[0], response: Parameters<RequestHandler>[1]) {
    const body = parseOrThrow(passwordResetRequestSchema, request.body);
    await requestPasswordReset(users, resetTokens, emailSender, {
      email: body.email,
      appBaseUrl,
      ttlMinutes: passwordResetTtlMinutes,
    });
    response.status(202).json({ message: PASSWORD_RESET_REQUEST_MESSAGE });
  }

  async function confirmReset(request: Parameters<RequestHandler>[0], response: Parameters<RequestHandler>[1]) {
    const body = parseCredentialsOrThrow(passwordResetConfirmSchema, request.body);
    await resetPassword(users, resetTokens, body);
    response.json({ message: PASSWORD_RESET_SUCCESS_MESSAGE });
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
    requestReset: (request, response, next) => { void requestReset(request, response).catch(next); },
    confirmReset: (request, response, next) => { void confirmReset(request, response).catch(next); },
  };
}
