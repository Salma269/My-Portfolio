import nodemailer from 'nodemailer';
import { env } from './env';
import { escapeHtml } from './http';

export async function sendContactEmail(input: { name: string; email: string; subject: string; message: string }): Promise<void> {
  if (!env.smtpUser || !env.smtpPassword) {
    throw new Error('SMTP is not configured.');
  }

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPassword,
    },
  });

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033">
      <h2>New portfolio message</h2>
      <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(input.subject)}</p>
      <div style="padding:16px;border:1px solid #d9e2ef;border-radius:12px;background:#f8fafc;white-space:pre-wrap">${escapeHtml(input.message)}</div>
    </div>
  `;

  await transporter.sendMail({
    to: env.smtpUser,
    from: `"Portfolio Contact" <${env.smtpUser}>`,
    replyTo: input.email,
    subject: `[Portfolio] ${input.subject}`,
    html,
    text: `Name: ${input.name}\nEmail: ${input.email}\nSubject: ${input.subject}\n\n${input.message}`,
  });
}
