import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface QuestNotificationData {
  questTitle: string;
  questId: string;
  applicantName?: string;
  companyName?: string;
}

/**
 * Create SMTP transporter
 */
function createTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    pool: false,
    maxConnections: 1,
    connectionTimeout: 60000,
    socketTimeout: 60000,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
}

/**
 * Send email with error handling
 */
async function sendEmail(options: EmailOptions): Promise<boolean> {
  const transporter = createTransporter();

  if (!transporter) {
    console.error('SMTP not configured - skipping email');
    return false;
  }

  try {
    const result = await transporter.sendMail({
      from: options.from || `"Adventurers Guild" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log('Email sent:', result.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  } finally {
    transporter.close();
  }
}

/**
 * Notify company about new quest application
 */
export async function notifyQuestApplication(data: QuestNotificationData & { applicantEmail: string; companyEmail: string }) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">New Quest Application Received!</h2>
      <p><strong>${data.applicantName}</strong> has applied for your quest:</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">${data.questTitle}</h3>
        <p style="margin: 0;"><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/quests?id=${data.questId}">View Application</a></p>
      </div>
      <p>Log in to your dashboard to review the application.</p>
    </div>
  `;

  return sendEmail({
    to: data.companyEmail,
    subject: `New Application: ${data.questTitle}`,
    html,
  });
}

/**
 * Notify adventurer about quest approval
 */
export async function notifyQuestApproved(data: QuestNotificationData & { adventurerEmail: string }) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #22c55e;">Quest Approved! 🎉</h2>
      <p>Congratulations! Your submission for <strong>${data.questTitle}</strong> has been approved.</p>
      <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;">You've earned XP and your payment is being processed.</p>
      </div>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/my-quests">View Your Quests</a></p>
    </div>
  `;

  return sendEmail({
    to: data.adventurerEmail,
    subject: `Quest Approved: ${data.questTitle}`,
    html,
  });
}

/**
 * Notify adventurer about quest rejection/rework
 */
export async function notifyQuestRework(data: QuestNotificationData & { adventurerEmail: string; feedback?: string }) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Quest Needs Revision</h2>
      <p>Your submission for <strong>${data.questTitle}</strong> needs some changes.</p>
      ${data.feedback ? `<div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0;"><p><strong>Feedback:</strong> ${data.feedback}</p></div>` : ''}
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/my-quests">View Details and Resubmit</a></p>
    </div>
  `;

  return sendEmail({
    to: data.adventurerEmail,
    subject: `Revision Needed: ${data.questTitle}`,
    html,
  });
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(email: string, name: string, role: 'adventurer' | 'company') {
  const roleText = role === 'adventurer' ? 'Adventurer' : 'Company';
  const dashboardLink = role === 'adventurer' ? '/dashboard' : '/dashboard/company';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">Welcome to Adventurers Guild, ${name}!</h2>
      <p>You've joined as a <strong>${roleText}</strong>. Here's what you can do next:</p>
      <ul style="line-height: 1.8;">
        ${role === 'adventurer'
          ? '<li>Browse available quests</li><li>Complete your profile with skills</li><li>Start earning XP and rewards!</li>'
          : '<li>Post your first quest</li><li>Browse talented adventurers</li><li>Get your projects completed!</li>'}
      </ul>
      <p style="margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}${dashboardLink}" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Go to Dashboard</a>
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Welcome to Adventurers Guild!`,
    html,
  });
}
