import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, message, email, page } = body;

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json({ error: 'Message is required (min 5 characters)', success: false }, { status: 400 });
    }

    const feedbackType = typeof type === 'string' ? type : 'General';
    const userEmail = typeof email === 'string' && email.trim() ? email.trim() : 'anonymous';
    const fromPage = typeof page === 'string' && page.trim() ? page.trim() : 'unknown';

    await sendEmail({
      to: 'abid@guilds.work',
      subject: `[Guild Feedback] ${feedbackType} — from ${userEmail}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1e293b; margin-bottom: 8px;">New Feedback Received</h2>
          <p style="color: #64748b; font-size: 13px; margin-bottom: 24px;">Submitted via Guild platform feedback form</p>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 12px; font-weight: 600; color: #475569; width: 120px;">Type</td>
              <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 13px; color: #1e293b;">${feedbackType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 12px; font-weight: 600; color: #475569;">From</td>
              <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 13px; color: #1e293b;">${userEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 12px; font-weight: 600; color: #475569;">Page</td>
              <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 13px; color: #1e293b;">${fromPage}</td>
            </tr>
          </table>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
            <p style="font-size: 12px; font-weight: 600; color: #475569; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">Message</p>
            <p style="font-size: 14px; color: #1e293b; white-space: pre-wrap; margin: 0;">${message.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[feedback] Error sending feedback:', error);
    return NextResponse.json({ error: 'Failed to send feedback. Please try again.', success: false }, { status: 500 });
  }
}
