import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  const isDev = process.env.NODE_ENV !== 'production';
  const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

  if (!smtpConfigured) {
    if (isDev) {
      // Dev fallback: log email to console so you can test without SMTP
      console.log('\n─── [mail dev] ───────────────────────────────');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${html.replace(/<[^>]+>/g, '').trim()}`);
      console.log('──────────────────────────────────────────────\n');
      return;
    }
    throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL || '"Guild" <noreply@adventurersguild.com>',
    to,
    subject,
    html,
  });
}
