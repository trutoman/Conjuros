export interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

export function buildWelcomeEmail(appBaseUrl: string): EmailContent {
  return {
    subject: 'Welcome to Conjuros',
    text: `Welcome to Conjuros!\n\nYour account is ready. Open ${appBaseUrl} to start your collection.`,
    html: `<p>Welcome to Conjuros!</p><p>Your account is ready. Open <a href="${appBaseUrl}">${appBaseUrl}</a> to start your collection.</p>`,
  };
}

export function buildPasswordResetEmail(appBaseUrl: string, token: string): EmailContent {
  const link = `${appBaseUrl}/reset-password?token=${encodeURIComponent(token)}`;
  return {
    subject: 'Reset your Conjuros password',
    text: `We received a request to reset your Conjuros password.\n\nOpen this link to choose a new password:\n${link}\n\nIf you did not request this, you can ignore this message.`,
    html: `<p>We received a request to reset your Conjuros password.</p><p>Open <a href="${link}">${link}</a> to choose a new password.</p><p>If you did not request this, you can ignore this message.</p>`,
  };
}
