// app/api/user/update-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import nodemailer from 'nodemailer';

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

function generateVerificationToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newEmail } = body;

    if (!currentPassword || !newEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: currentPassword and newEmail' },
        { status: 400 }
      );
    }

    if (!isValidEmail(newEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(session.user.id);
    if (authError || !authUser.user) {
      throw new Error('Failed to retrieve user');
    }

    const oldEmail = authUser.user.email;

    if (newEmail.toLowerCase() === oldEmail?.toLowerCase()) {
      return NextResponse.json(
        { error: 'New email must be different from current email' },
        { status: 400 }
      );
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: oldEmail!,
      password: currentPassword
    });

    if (signInError) {
      console.error('Password verification failed:', signInError.message);
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 403 }
      );
    }

    await supabase.auth.signOut();

    const { data: pendingRequests } = await supabase
      .from('email_change_requests')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString());

    if (pendingRequests && pendingRequests.length > 0) {
      return NextResponse.json(
        { error: 'A pending email change request already exists. Please complete the verification first.' },
        { status: 409 }
      );
    }

    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { error: insertError } = await supabase
      .from('email_change_requests')
      .insert([{
        user_id: session.user.id,
        old_email: oldEmail!,
        new_email: newEmail,
        current_password_hash: 'verified',
        verification_token: verificationToken,
        status: 'pending',
        expires_at: expiresAt.toISOString()
      }]);

    if (insertError) {
      console.error('Failed to create email change request:', insertError);
      return NextResponse.json(
        { error: 'Failed to initiate email change' },
        { status: 500 }
      );
    }

    try {
      const verificationLink = `${env.NEXT_PUBLIC_APP_URL || request.headers.get('origin')}/api/user/verify-email-change?token=${verificationToken}`;

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: { rejectUnauthorized: false }
      });

      await transporter.sendMail({
        from: `"The Adventurers Guild" <${process.env.SMTP_USER}>`,
        to: oldEmail!,
        subject: 'Confirm Your Email Change Request',
        html: `
          <!DOCTYPE html>
          <html>
          <head><title>Email Change Confirmation</title></head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; border-radius: 12px; text-align: center;">
              <h1 style="margin: 0;">🛡️ Email Change Request</h1>
            </div>
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404;"><strong>Security Notice:</strong> Someone (hopefully you) requested to change the email address for this account.</p>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Current Email:</strong> ${oldEmail}</p>
              <p><strong>New Email:</strong> ${newEmail}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background: #667eea; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">Confirm Email Change</a>
            </div>
            <p style="text-align: center; color: #666; font-size: 14px;">
              If you did not request this change, please ignore this email. The request will expire in 24 hours.
            </p>
            <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
              This link expires in 24 hours. If you need to change your email again, you'll need to request a new verification.
            </p>
          </body>
          </html>
        `
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    return NextResponse.json({
      message: 'Verification email sent to your current email address',
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('Email change request error:', error);
    return NextResponse.json(
      { error: 'Failed to process email change request' },
      { status: 500 }
    );
  }
}
