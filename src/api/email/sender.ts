import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

export interface EmailConfig {
  smtpUrl: string | null;
  mailFrom: string | null;
}

export class SmtpEmailSender implements EmailSender {
  private readonly transport: Transporter;

  constructor(
    smtpUrl: string,
    private readonly mailFrom: string,
  ) {
    this.transport = nodemailer.createTransport(smtpUrl);
  }

  async send(message: EmailMessage): Promise<void> {
    await this.transport.sendMail({ from: this.mailFrom, ...message });
  }
}

export class ConsoleEmailSender implements EmailSender {
  async send(message: EmailMessage): Promise<void> {
    console.info(
      `[email] SMTP is not configured; not delivering "${message.subject}" to ${message.to}\n${message.text}`,
    );
  }
}

export function createEmailSender(config: EmailConfig): EmailSender {
  if (config.smtpUrl && config.mailFrom) {
    return new SmtpEmailSender(config.smtpUrl, config.mailFrom);
  }
  return new ConsoleEmailSender();
}
