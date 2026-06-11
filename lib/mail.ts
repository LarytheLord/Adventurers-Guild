import { Resend } from 'resend';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  const isDev = process.env.NODE_ENV !== 'production';
  const resendConfigured = !!process.env.RESEND_API_KEY;

  console.log('[mail] Sending email:', { to, subject, isDev, resendConfigured });

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

  // Lazy-init: only construct Resend when a key is confirmed present so module-level
  // import during Next.js static analysis (CI without env vars) never throws.
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    console.log('[mail] Calling Resend API...');
    const result = await resend.emails.send({
      from: 'Guild <noreply@guilds.work>',
      to,
      subject,
      html,
    });
    console.log('[mail] Resend API response:', result);

    // Check if there's an error in the response (Resend returns 200 with error object)
    if (result.error) {
      console.error('[mail] Resend returned an error:', result.error);

      // Handle testing mode limitation
      if (result.error.message?.includes('testing emails')) {
        console.log('[mail] Resend is in testing mode. In dev/testing, we fall back to console logging.');
        console.log('\n─── [RESET PASSWORD EMAIL - TESTING MODE] ───────────────');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body:\n${html.replace(/<[^>]+>/g, '').trim()}`);
        console.log('──────────────────────────────────────────────────────\n');
        return; // Don't throw error, allow testing to continue
      }

      throw new Error(`Resend error: ${result.error.message}`);
    }
  } catch (error) {
    console.error('[mail] Failed to send email via Resend:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
