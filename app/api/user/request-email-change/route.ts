import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendEmail } from '@/lib/emailService'

// Rate limiting: max 3 requests per hour per user
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const hour = 60 * 60 * 1000
  const limit = 3
  
  const userLimit = rateLimitMap.get(userId)
  
  if (!userLimit || userLimit.resetTime < now) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + hour })
    return true
  }
  
  if (userLimit.count >= limit) {
    return false
  }
  
  userLimit.count++
  return true
}

// Generate secure random token
function generateToken(): string {
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
}

const requestEmailChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Password is required'),
  newEmail: z.string().email('Invalid email address')
})

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.user.id
    
    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
    
    // Validate request body
    const body = await req.json()
    const validation = requestEmailChangeSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      )
    }
    
    const { currentPassword, newEmail } = validation.data
    
    // Get current user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Check if new email is already in use
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', newEmail)
      .neq('id', userId)
      .single()
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'This email is already in use' },
        { status: 400 }
      )
    }
    
    // Verify current password using Supabase auth
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    })
    
    if (signInError) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 403 }
      )
    }
    
    // Check for existing pending request
    const { data: existingRequest } = await supabase
      .from('email_change_requests')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single()
    
    if (existingRequest) {
      return NextResponse.json(
        { error: 'A pending email change request already exists' },
        { status: 400 }
      )
    }
    
    // Generate secure token
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    // Create email change request
    const { error: insertError } = await supabase
      .from('email_change_requests')
      .insert({
        user_id: userId,
        old_email: user.email,
        new_email: newEmail,
        token,
        status: 'pending',
        expires_at: expiresAt.toISOString()
      })
    
    if (insertError) {
      console.error('Failed to create email change request:', insertError)
      return NextResponse.json(
        { error: 'Failed to create email change request' },
        { status: 500 }
      )
    }
    
    // Send confirmation email to OLD address
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const confirmUrl = `${appUrl}/api/user/confirm-email-change?token=${token}`
    
    try {
      await sendEmail({
        to: user.email,
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
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't expose email errors to client
    }
    
    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent to your current email address'
    })
    
  } catch (error) {
    console.error('Email change request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}