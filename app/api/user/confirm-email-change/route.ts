import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/emailService'

// Timing-safe string comparison
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    
    if (!token) {
      return NextResponse.redirect(new URL('/profile?error=invalid_token', req.url))
    }
    
    const supabase = createSupabaseServerClient()
    
    // Find the email change request
    const { data: request, error: requestError } = await supabase
      .from('email_change_requests')
      .select('*')
      .eq('token', token)
      .single()
    
    if (requestError || !request) {
      return NextResponse.redirect(new URL('/profile?error=invalid_token', req.url))
    }
    
    // Check if already confirmed or expired
    if (request.status !== 'pending') {
      return NextResponse.redirect(new URL('/profile?error=request_already_processed', req.url))
    }
    
    // Check expiration
    if (new Date(request.expires_at) < new Date()) {
      // Mark as expired
      await supabase
        .from('email_change_requests')
        .update({ status: 'expired' })
        .eq('id', request.id)
      
      return NextResponse.redirect(new URL('/profile?error=token_expired', req.url))
    }
    
    // Verify token using timing-safe comparison
    if (!timingSafeEqual(request.token, token)) {
      return NextResponse.redirect(new URL('/profile?error=invalid_token', req.url))
    }
    
    // Get the old email for notification
    const oldEmail = request.old_email
    
    // Update user's email
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        email: request.new_email,
        updated_at: new Date().toISOString()
      })
      .eq('id', request.user_id)
    
    if (updateError) {
      console.error('Failed to update email:', updateError)
      return NextResponse.redirect(new URL('/profile?error=update_failed', req.url))
    }
    
    // Also update in Supabase auth
    const { error: authUpdateError } = await supabase.auth.updateUser({
      email: request.new_email
    })
    
    if (authUpdateError) {
      console.error('Failed to update auth email:', authUpdateError)
      // Continue anyway - we've updated the profile
    }
    
    // Mark request as confirmed
    await supabase
      .from('email_change_requests')
      .update({ status: 'confirmed' })
      .eq('id', request.id)
    
    // Invalidate all sessions (force re-login)
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      console.error('Failed to sign out user:', signOutError)
    }
    
    // Send notification to new email
    try {
      await sendEmail({
        to: request.new_email,
        subject: 'Your email has been changed - Adventurers Guild',
        html: `
          <h1>Email Changed Successfully</h1>
          <p>Your email address for Adventurers Guild has been changed from <strong>${oldEmail}</strong> to <strong>${request.new_email}</strong>.</p>
          <p>If you did not make this change, please contact support immediately.</p>
          <p>Please log in again with your new email address.</p>
        `
      })
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError)
    }
    
    // Redirect to login with success message
    return NextResponse.redirect(new URL('/login?email_changed=true', req.url))
    
  } catch (error) {
    console.error('Email confirmation error:', error)
    return NextResponse.redirect(new URL('/profile?error=confirmation_failed', req.url))
  }
}