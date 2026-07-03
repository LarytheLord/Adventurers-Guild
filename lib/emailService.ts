import * as nodemailer from 'nodemailer'
import type { TransportOptions } from 'nodemailer'

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: parseInt(process.env.SMTP_PORT || '587') === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  } as TransportOptions)
}

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send an email using the configured SMTP server
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<void> {
  // Check if SMTP is configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP not configured, skipping email send:', { to, subject })
    return
  }
  
  const transporter = createTransporter()
  
  await transporter.sendMail({
    from: `"Adventurers Guild" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for plain text
  })
}

/**
 * Send a verification email for email change
 */
export async function sendEmailChangeConfirmation(
  oldEmail: string,
  newEmail: string,
  confirmUrl: string
): Promise<void> {
  await sendEmail({
    to: oldEmail,
    subject: 'Confirm your email change - Adventurers Guild',
    html: `
      <h1>Email Change Request</h1>
      <p>We received a request to change your email address to: <strong>${newEmail}</strong></p>
      <p>If you did not make this request, please ignore this email. Your account will remain secure.</p>
      <p>To confirm this change, click the link below:</p>
      <a href="${confirmUrl}" style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Confirm Email Change
      </a>
      <p>This link will expire in 24 hours.</p>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p>${confirmUrl}</p>
    `
  })
}

/**
 * Send email change notification to new email
 */
export async function sendEmailChangeNotification(
  newEmail: string,
  oldEmail: string
): Promise<void> {
  await sendEmail({
    to: newEmail,
    subject: 'Your email has been changed - Adventurers Guild',
    html: `
      <h1>Email Changed Successfully</h1>
      <p>Your email address for Adventurers Guild has been changed from <strong>${oldEmail}</strong> to <strong>${newEmail}</strong>.</p>
      <p>If you did not make this change, please contact support immediately.</p>
      <p>Please log in again with your new email address.</p>
    `
  })
}