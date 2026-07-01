// app/api/user/verify-email-change/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import nodemailer from 'nodemailer';
import { createNotification } from '@/lib/notification-utils';

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new NextResponse(
        `<html><body style="font-family: Arial; text-align: center; padding: 50px;"><h1 style="color: red;">Missing verification token</h1><p>Please use the link from your email.</p></body></html>`,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    const { data: requestRecord, error: fetchError } = await supabase
      .from('email_change_requests')
      .select('*')
      .eq('verification_token', token)
      .eq('status', 'pending')
      .single();

    if (fetchError || !requestRecord) {
      return new NextResponse(
        `<html><body style="font-family: Arial; text-align: center; padding: 50px;"><h1 style="color: red;">Invalid or expired verification link</h1><p>This link is no longer valid. Please request a new email change.</p></body></html>`,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    const expiresAt = new Date(requestRecord.expires_at);
    if (expiresAt < new Date()) {
      await supabase
        .from('email_change_requests')
        .update({ status: 'expired' })
        .eq('id', requestRecord.id);

      return new NextResponse(
        `<html><body style="font-family: Arial; text-align: center; padding: 50px;"><h1 style="color: red;">Verification link expired</h1><p>This link expired on ${expiresAt.toLocaleString()}. Please request a new email change.</p></body></html>`,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    const userId = requestRecord.user_id;
    const oldEmail = requestRecord.old_email;
    const newEmail = requestRecord.new_email;

    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(userId, {
      email: newEmail
    });

    if (updateAuthError) {
      console.error('Failed to update email in auth:', updateAuthError);
      return new NextResponse(
        `<html><body style="font-family: Arial; text-align: center; padding: 50px;"><h1 style="color: red;">Failed to update email</h1><p>An error occurred while changing your email. Please try again or contact support.</p></body></html>`,
        { status: 500, headers: { 'Content-Type': 'text/html' } }
      );
    }

    await supabase
      .from('email_change_requests')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString()
      })
      .eq('id', requestRecord.id);

    await supabase
      .from('email_change_requests')
      .update({ status: 'cancelled' })
      .eq('user_id', userId)
      .eq('status', 'pending')
      .neq('id', requestRecord.id);

    try {
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
        to: newEmail,
        subject: 'Email Changed Successfully - The Adventurers Guild',
        html: `
          <!DOCTYPE html>
          <html>
          <head><title>Email Changed Successfully</title></head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; border-radius: 12px; text-align: center;">
              <h1 style="margin: 0;">✅ Email Changed Successfully</h1>
            </div>
            <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <p style="margin: 0; color: #155724;"><strong>Your email address has been updated.</strong></p>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Old Email:</strong> ${oldEmail}</p>
              <p><strong>New Email:</strong> ${newEmail}</p>
              <p><strong>Changed At:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p style="text-align: center; color: #666; font-size: 14px;">
              If you did not make this change, please contact support immediately.
            </p>
          </body>
          </html>
        `
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    try {
      await createNotification(
        userId,
        'Email Changed Successfully',
        `Your email has been changed from ${oldEmail} to ${newEmail}.`,
        'email_change_confirmed',
        { oldEmail, newEmail }
      );
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    return new NextResponse(
      `<html><body style="font-family: Arial; text-align: center; padding: 50px;">
        <h1 style="color: green;">✅ Email Changed Successfully!</h1>
        <p>Your email has been updated from <strong>${oldEmail}</strong> to <strong>${newEmail}</strong>.</p>
        <p>A confirmation email has been sent to your new address.</p>
        <p style="margin-top: 30px;"><a href="${env.NEXT_PUBLIC_APP_URL || '/'}">Return to Home</a></p>
      </body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error) {
    console.error('Email verification error:', error);
    return new NextResponse(
      `<html><body style="font-family: Arial; text-align: center; padding: 50px;"><h1 style="color: red;">An error occurred</h1><p>Please try again or contact support.</p></body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
}
