import bcrypt from 'bcryptjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EmailMessage, EmailSender } from '../../api/email/sender';
import { InMemoryPasswordResetTokensRepository } from '../../api/repositories/password-reset-tokens.repository';
import { InMemoryUsersRepository } from '../../api/repositories/users.repository';
import { authenticateUser } from '../../api/services/auth.service';
import {
  generateResetToken,
  hashResetToken,
  requestPasswordReset,
  resetPassword,
} from '../../api/services/password-reset.service';

const APP_BASE_URL = 'https://conjuros.example.com';
const OLD_PASSWORD = 'OldPass1!';
const NEW_PASSWORD = 'NewPass1!';

class RecordingEmailSender implements EmailSender {
  readonly messages: EmailMessage[] = [];

  async send(message: EmailMessage): Promise<void> {
    this.messages.push(message);
  }
}

class FailingEmailSender implements EmailSender {
  async send(): Promise<void> {
    throw new Error('smtp is unavailable');
  }
}

function extractToken(message: EmailMessage): string {
  const match = message.text.match(/reset-password\?token=([^\s]+)/);
  if (!match) throw new Error('No reset token in the email');
  return decodeURIComponent(match[1]);
}

async function createPasswordUser(users: InMemoryUsersRepository, email: string) {
  return users.create(email, await bcrypt.hash(OLD_PASSWORD, 4));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('requestPasswordReset', () => {
  it('emails a reset link for an account with a local password', async () => {
    const users = new InMemoryUsersRepository();
    const tokens = new InMemoryPasswordResetTokensRepository();
    const sender = new RecordingEmailSender();
    await createPasswordUser(users, 'ada@example.com');

    await requestPasswordReset(users, tokens, sender, {
      email: 'ada@example.com',
      appBaseUrl: APP_BASE_URL,
      ttlMinutes: 60,
    });

    expect(sender.messages).toHaveLength(1);
    expect(sender.messages[0].to).toBe('ada@example.com');
    expect(sender.messages[0].text).toContain(`${APP_BASE_URL}/reset-password?token=`);
  });

  it('sends nothing for an unknown email', async () => {
    const users = new InMemoryUsersRepository();
    const tokens = new InMemoryPasswordResetTokensRepository();
    const sender = new RecordingEmailSender();

    await requestPasswordReset(users, tokens, sender, {
      email: 'nobody@example.com',
      appBaseUrl: APP_BASE_URL,
      ttlMinutes: 60,
    });

    expect(sender.messages).toHaveLength(0);
  });

  it('sends nothing for a passwordless account', async () => {
    const users = new InMemoryUsersRepository();
    const tokens = new InMemoryPasswordResetTokensRepository();
    const sender = new RecordingEmailSender();
    await users.create('google@example.com', null);

    await requestPasswordReset(users, tokens, sender, {
      email: 'google@example.com',
      appBaseUrl: APP_BASE_URL,
      ttlMinutes: 60,
    });

    expect(sender.messages).toHaveLength(0);
  });

  it('does not throw when the email cannot be sent', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const users = new InMemoryUsersRepository();
    const tokens = new InMemoryPasswordResetTokensRepository();
    await createPasswordUser(users, 'ada@example.com');

    await expect(
      requestPasswordReset(users, tokens, new FailingEmailSender(), {
        email: 'ada@example.com',
        appBaseUrl: APP_BASE_URL,
        ttlMinutes: 60,
      }),
    ).resolves.toBeUndefined();
  });
});

describe('resetPassword', () => {
  it('changes the password and the new one signs in while the old fails', async () => {
    const users = new InMemoryUsersRepository();
    const tokens = new InMemoryPasswordResetTokensRepository();
    const sender = new RecordingEmailSender();
    await createPasswordUser(users, 'ada@example.com');
    await requestPasswordReset(users, tokens, sender, {
      email: 'ada@example.com',
      appBaseUrl: APP_BASE_URL,
      ttlMinutes: 60,
    });

    await resetPassword(users, tokens, {
      token: extractToken(sender.messages[0]),
      password: NEW_PASSWORD,
    });

    await expect(
      authenticateUser(users, { email: 'ada@example.com', password: NEW_PASSWORD }),
    ).resolves.toMatchObject({ email: 'ada@example.com' });
    await expect(
      authenticateUser(users, { email: 'ada@example.com', password: OLD_PASSWORD }),
    ).rejects.toMatchObject({ status: 401, message: 'Invalid email or password' });
  });

  it('rejects a weak password without consuming the token', async () => {
    const users = new InMemoryUsersRepository();
    const tokens = new InMemoryPasswordResetTokensRepository();
    const sender = new RecordingEmailSender();
    await createPasswordUser(users, 'ada@example.com');
    await requestPasswordReset(users, tokens, sender, {
      email: 'ada@example.com',
      appBaseUrl: APP_BASE_URL,
      ttlMinutes: 60,
    });
    const token = extractToken(sender.messages[0]);

    await expect(
      resetPassword(users, tokens, { token, password: 'weak' }),
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });

    await expect(resetPassword(users, tokens, { token, password: NEW_PASSWORD })).resolves.toBeUndefined();
  });

  it('rejects an unknown token', async () => {
    const users = new InMemoryUsersRepository();
    const tokens = new InMemoryPasswordResetTokensRepository();

    await expect(
      resetPassword(users, tokens, { token: 'unknown', password: NEW_PASSWORD }),
    ).rejects.toMatchObject({ status: 400, code: 'RESET_TOKEN_INVALID' });
  });

  it('rejects an expired token', async () => {
    const users = new InMemoryUsersRepository();
    const tokens = new InMemoryPasswordResetTokensRepository();
    const user = await createPasswordUser(users, 'ada@example.com');
    await tokens.create({
      userId: user.id,
      tokenHash: hashResetToken('expired-token'),
      expiresAt: new Date(Date.now() - 60_000),
    });

    await expect(
      resetPassword(users, tokens, { token: 'expired-token', password: NEW_PASSWORD }),
    ).rejects.toMatchObject({ status: 400, code: 'RESET_TOKEN_INVALID' });
  });

  it('rejects a token that was already used', async () => {
    const users = new InMemoryUsersRepository();
    const tokens = new InMemoryPasswordResetTokensRepository();
    const sender = new RecordingEmailSender();
    await createPasswordUser(users, 'ada@example.com');
    await requestPasswordReset(users, tokens, sender, {
      email: 'ada@example.com',
      appBaseUrl: APP_BASE_URL,
      ttlMinutes: 60,
    });
    const token = extractToken(sender.messages[0]);
    await resetPassword(users, tokens, { token, password: NEW_PASSWORD });

    await expect(
      resetPassword(users, tokens, { token, password: 'Another1!' }),
    ).rejects.toMatchObject({ status: 400, code: 'RESET_TOKEN_INVALID' });
  });

  it('invalidates the previous token when a new one is requested', async () => {
    const users = new InMemoryUsersRepository();
    const tokens = new InMemoryPasswordResetTokensRepository();
    const sender = new RecordingEmailSender();
    await createPasswordUser(users, 'ada@example.com');
    await requestPasswordReset(users, tokens, sender, {
      email: 'ada@example.com',
      appBaseUrl: APP_BASE_URL,
      ttlMinutes: 60,
    });
    const firstToken = extractToken(sender.messages[0]);
    await requestPasswordReset(users, tokens, sender, {
      email: 'ada@example.com',
      appBaseUrl: APP_BASE_URL,
      ttlMinutes: 60,
    });
    const secondToken = extractToken(sender.messages[1]);

    await expect(
      resetPassword(users, tokens, { token: firstToken, password: NEW_PASSWORD }),
    ).rejects.toMatchObject({ status: 400, code: 'RESET_TOKEN_INVALID' });
    await expect(
      resetPassword(users, tokens, { token: secondToken, password: NEW_PASSWORD }),
    ).resolves.toBeUndefined();
  });
});

describe('generateResetToken', () => {
  it('produces distinct high-entropy tokens', () => {
    const tokens = new Set(Array.from({ length: 50 }, () => generateResetToken()));

    expect(tokens.size).toBe(50);
    expect([...tokens].every((token) => token.length >= 32)).toBe(true);
  });
});
