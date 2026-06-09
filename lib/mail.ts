import { Resend } from 'resend';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  const isDev = process.env.NODE_ENV !== 'production';
  const resendConfigured = !!process.env.RESEND_API_KEY;

  if (!resendConfigured) {
    if (isDev) {
      // Dev fallback: log email to console so you can test without Resend
      console.log('\n─── [mail dev] ───────────────────────────────');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${html.replace(/<[^>]+>/g, '').trim()}`);
      console.log('──────────────────────────────────────────────\n');
      return;
    }
    throw new Error('Resend API key is not configured. Set RESEND_API_KEY environment variable.');
  }

  try {
    await resend.emails.send({
      from: 'Guild <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Failed to send email via Resend:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
