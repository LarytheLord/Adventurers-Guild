-- Migration: Add email change requests table
-- Issue: #407 - Secure email change flow
-- Date: 2025-07-03

-- Create email change requests table
CREATE TABLE IF NOT EXISTS public.email_change_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  old_email TEXT NOT NULL,
  new_email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, expired
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_email_change_requests_token ON public.email_change_requests(token);
CREATE INDEX IF NOT EXISTS idx_email_change_requests_user_id ON public.email_change_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_email_change_requests_status ON public.email_change_requests(status);

-- Add RLS policies
ALTER TABLE public.email_change_requests ENABLE ROW LEVEL SECURITY;

-- User can only view their own requests
CREATE POLICY "Users can view own email change requests" 
ON public.email_change_requests FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own requests
CREATE POLICY "Users can create email change requests" 
ON public.email_change_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own requests (for status changes)
CREATE POLICY "Users can update own email change requests" 
ON public.email_change_requests FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all email change requests" 
ON public.email_change_requests FOR SELECT
USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);