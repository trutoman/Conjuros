import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ConsoleEmailSender,
  SmtpEmailSender,
  createEmailSender,
} from '../../api/email/sender';
import { buildPasswordResetEmail, buildWelcomeEmail } from '../../api/email/templates';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createEmailSender', () => {
  it('uses the SMTP sender when email is configured', () => {
    const sender = createEmailSender({
      smtpUrl: 'smtp://user:pass@smtp.example.com:587',
      mailFrom: 'no-reply@example.com',
    });

    expect(sender).toBeInstanceOf(SmtpEmailSender);
  });

  it('uses the non-delivering fallback when email is not configured', () => {
    const sender = createEmailSender({ smtpUrl: null, mailFrom: null });

    expect(sender).toBeInstanceOf(ConsoleEmailSender);
  });
});

describe('ConsoleEmailSender', () => {
  it('records the message without throwing', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const sender = new ConsoleEmailSender();

    await expect(
      sender.send({ to: 'ada@example.com', subject: 'Hello', text: 'Body' }),
    ).resolves.toBeUndefined();

    expect(info).toHaveBeenCalledOnce();
    expect(info.mock.calls[0][0]).toContain('ada@example.com');
  });
});

describe('email builders', () => {
  it('builds a welcome email that links to the application', () => {
    const email = buildWelcomeEmail('https://conjuros.example.com');

    expect(email.subject).toBe('Welcome to Conjuros');
    expect(email.text).toContain('https://conjuros.example.com');
    expect(email.html).toContain('https://conjuros.example.com');
  });

  it('builds a password reset email containing the reset link with the token', () => {
    const email = buildPasswordResetEmail('https://conjuros.example.com', 'reset-token-value');
    const link = 'https://conjuros.example.com/reset-password?token=reset-token-value';

    expect(email.subject).toBe('Reset your Conjuros password');
    expect(email.text).toContain(link);
    expect(email.html).toContain(link);
  });
});
