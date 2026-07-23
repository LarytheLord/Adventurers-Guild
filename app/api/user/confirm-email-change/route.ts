import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Find the email change request
    const emailChangeRequest = await prisma.emailChangeRequest.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!emailChangeRequest) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });
    }

    // Check if token is already used
    if (emailChangeRequest.status === 'confirmed') {
      return NextResponse.json({ error: 'This token has already been used' }, { status: 400 });
    }

    // Check if token is expired
    if (emailChangeRequest.expiresAt < new Date()) {
      // Update status to expired
      await prisma.emailChangeRequest.update({
        where: { id: emailChangeRequest.id },
        data: { status: 'expired' },
      });
      return NextResponse.json({ error: 'Token has expired' }, { status: 400 });
    }

    // Check if new email is still available (another user might have registered with it)
    const existingUser = await prisma.user.findUnique({
      where: { email: emailChangeRequest.newEmail },
    });

    if (existingUser && existingUser.id !== emailChangeRequest.userId) {
      return NextResponse.json(
        { error: 'This email is now in use by another account. Please request a new email change.' },
        { status: 400 }
      );
    }

    // Use transaction to ensure atomic update
    await prisma.$transaction(async (tx) => {
      // Update user's email
      await tx.user.update({
        where: { id: emailChangeRequest.userId },
        data: { 
          email: emailChangeRequest.newEmail,
          // Force session invalidation by updating updatedAt timestamp
          updatedAt: new Date(),
        },
      });

      // Mark email change request as confirmed
      await tx.emailChangeRequest.update({
        where: { id: emailChangeRequest.id },
        data: { status: 'confirmed' },
      });

      // Invalidate any other pending email change requests for this user
      await tx.emailChangeRequest.updateMany({
        where: {
          userId: emailChangeRequest.userId,
          id: { not: emailChangeRequest.id },
          status: 'pending',
        },
        data: { status: 'expired' },
      });
    });

    // Return success page or redirect to login
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Changed Successfully</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 400px;
          }
          .success-icon {
            font-size: 48px;
            color: #10b981;
            margin-bottom: 1rem;
          }
          h1 {
            color: #1f2937;
            margin-bottom: 1rem;
          }
          p {
            color: #6b7280;
            margin-bottom: 2rem;
            line-height: 1.5;
          }
          .login-button {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
          }
          .login-button:hover {
            background: #5a67d8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✓</div>
          <h1>Email Changed Successfully!</h1>
          <p>Your email has been updated to <strong>${emailChangeRequest.newEmail}</strong>.</p>
          <p>For security reasons, you have been logged out. Please log in again with your new email address.</p>
          <a href="/login" class="login-button">Go to Login</a>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Failed to confirm email change:', error);
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error Confirming Email Change</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #f56565 0%, #ed8936 100%);
          }
          .container {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 400px;
          }
          .error-icon {
            font-size: 48px;
            color: #f56565;
            margin-bottom: 1rem;
          }
          h1 {
            color: #1f2937;
            margin-bottom: 1rem;
          }
          p {
            color: #6b7280;
            margin-bottom: 2rem;
            line-height: 1.5;
          }
          .home-button {
            background: #f56565;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
          }
          .home-button:hover {
            background: #e53e3e;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error-icon">✗</div>
          <h1>Error Confirming Email Change</h1>
          <p>There was an error processing your email change request. Please try requesting a new email change.</p>
          <a href="/dashboard/settings" class="home-button">Go to Settings</a>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      status: 500,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
}