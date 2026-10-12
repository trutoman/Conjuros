import type { EmailMessage, EmailSender } from '../email/sender';
import { buildWelcomeEmail } from '../email/templates';

export async function sendEmailSafely(
  sender: EmailSender,
  message: EmailMessage,
  label: string,
): Promise<void> {
  try {
    await sender.send(message);
  } catch (error) {
    console.error(`Failed to send ${label}`, error);
  }
}

export async function sendWelcomeEmail(
  sender: EmailSender,
  email: string,
  appBaseUrl: string,
): Promise<void> {
  await sendEmailSafely(sender, { to: email, ...buildWelcomeEmail(appBaseUrl) }, 'welcome email');
}
