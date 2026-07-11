import nodemailer from 'nodemailer';
import { config } from '../config';

const smtpConfigured = Boolean(config.smtp.host && config.smtp.user && config.smtp.pass);

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    })
  : null;

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email if SMTP credentials are configured; otherwise logs to console.
 * This keeps auth flows (verification, password reset) functional in local/dev
 * environments without requiring a real mail provider.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  if (!transporter) {
    // eslint-disable-next-line no-console
    console.log(`\n--- [DEV EMAIL] ---\nTo: ${to}\nSubject: ${subject}\n${html}\n-------------------\n`);
    return;
  }

  await transporter.sendMail({
    from: config.smtp.from,
    to,
    subject,
    html,
  });
}

export function verificationEmailHtml(name: string, verifyUrl: string): string {
  return `<p>Hi ${name},</p><p>Welcome to Connectify. Verify your email to activate your account:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
}

export function resetPasswordEmailHtml(name: string, resetUrl: string): string {
  return `<p>Hi ${name},</p><p>You requested a password reset. This link expires in 1 hour:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, ignore this email.</p>`;
}
