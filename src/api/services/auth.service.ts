import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { AuthenticatedUser, AuthenticatedUserProfile, Credentials, ThemePreference } from '@conjuros/contracts';
import { AppError } from '../errors';
import type { UsersRepository } from '../repositories/users.repository';

export async function registerUser(repository: UsersRepository, credentials: Credentials): Promise<AuthenticatedUser> {
  if (await repository.findByEmail(credentials.email)) {
    throw new AppError(409, 'CONFLICT', 'An account with this email already exists');
  }
  const user = await repository.create(credentials.email, await bcrypt.hash(credentials.password, 12));
  return { id: user.id, email: user.email };
}

export async function authenticateUser(repository: UsersRepository, credentials: Credentials): Promise<AuthenticatedUser> {
  const user = await repository.findByEmail(credentials.email);
  if (!user || !(await bcrypt.compare(credentials.password, user.passwordHash))) {
    throw new AppError(401, 'AUTH_ERROR', 'Invalid email or password');
  }
  return { id: user.id, email: user.email };
}

export async function readAuthenticatedUserProfile(repository: UsersRepository, user: AuthenticatedUser): Promise<AuthenticatedUserProfile> {
  const stored = await repository.findById(user.id);
  if (!stored || stored.email !== user.email) {
    throw new AppError(401, 'AUTH_ERROR', 'Your session is invalid or expired');
  }
  return { id: stored.id, email: stored.email, theme: stored.theme };
}

export async function updateAuthenticatedUserTheme(repository: UsersRepository, userId: string, theme: ThemePreference): Promise<AuthenticatedUserProfile> {
  const updated = await repository.updateTheme(userId, theme);
  if (!updated) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }
  return { id: updated.id, email: updated.email, theme: updated.theme };
}

export function createSession(user: AuthenticatedUser, secret: string): string {
  return jwt.sign(user, secret, { expiresIn: '7d' });
}

export function readSession(token: string, secret: string): AuthenticatedUser {
  try {
    const payload = jwt.verify(token, secret);
    if (typeof payload === 'string' || typeof payload.id !== 'string' || typeof payload.email !== 'string') throw new Error('Invalid session');
    return { id: payload.id, email: payload.email };
  } catch {
    throw new AppError(401, 'AUTH_ERROR', 'Your session is invalid or expired');
  }
}