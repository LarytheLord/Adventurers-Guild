import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return cachedTransporter;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const transporter = getTransporter();

  try {
    const info = await transporter.sendMail({
      from: process.env.ADMIN_EMAIL || '"Adventurers Guild" <admin@adventurersguild.com>',
      to,
      subject,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
