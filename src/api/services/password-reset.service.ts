import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { passwordSchema } from '@conjuros/contracts';
import type { EmailSender } from '../email/sender';
import { buildPasswordResetEmail } from '../email/templates';
import { AppError } from '../errors';
import type { PasswordResetTokensRepository } from '../repositories/password-reset-tokens.repository';
import type { UsersRepository } from '../repositories/users.repository';
import { sendEmailSafely } from './account-email.service';

export const RESET_TOKEN_INVALID_MESSAGE = 'This password reset link is invalid or has expired';

export function generateResetToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export interface RequestPasswordResetInput {
  email: string;
  appBaseUrl: string;
  ttlMinutes: number;
}

export async function requestPasswordReset(
  users: UsersRepository,
  tokens: PasswordResetTokensRepository,
  sender: EmailSender,
  input: RequestPasswordResetInput,
): Promise<void> {
  const user = await users.findByEmail(input.email);
  // Unknown and passwordless accounts are silently skipped so the caller can answer generically.
  if (!user || user.passwordHash === null) return;

  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + input.ttlMinutes * 60_000);
  await tokens.deleteUnusedForUser(user.id);
  await tokens.create({ userId: user.id, tokenHash: hashResetToken(token), expiresAt });
  await sendEmailSafely(
    sender,
    { to: user.email, ...buildPasswordResetEmail(input.appBaseUrl, token) },
    'password reset email',
  );
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export async function resetPassword(
  users: UsersRepository,
  tokens: PasswordResetTokensRepository,
  input: ResetPasswordInput,
): Promise<void> {
  // Validate the password before touching the token so a rejected password leaves it usable.
  const parsedPassword = passwordSchema.safeParse(input.password);
  if (!parsedPassword.success) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      parsedPassword.error.issues[0]?.message ?? 'Invalid password',
      parsedPassword.error.issues,
    );
  }

  const stored = await tokens.findByTokenHash(hashResetToken(input.token));
  if (!stored || stored.usedAt !== null || new Date(stored.expiresAt).getTime() <= Date.now()) {
    throw new AppError(400, 'RESET_TOKEN_INVALID', RESET_TOKEN_INVALID_MESSAGE);
  }

  const passwordHash = await bcrypt.hash(parsedPassword.data, 12);
  const updated = await users.updatePasswordHash(stored.userId, passwordHash);
  if (!updated) {
    throw new AppError(400, 'RESET_TOKEN_INVALID', RESET_TOKEN_INVALID_MESSAGE);
  }
  await tokens.markUsed(stored.id, new Date());
}
