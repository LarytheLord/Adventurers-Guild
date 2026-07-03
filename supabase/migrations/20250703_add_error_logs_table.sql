-- Migration: Add error_logs table for secure error logging
-- Issue: #342 - Unauthenticated error log endpoint
-- Date: 2025-07-03

-- Create error_logs table
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'error',
  source VARCHAR(200),
  url VARCHAR(500),
  user_agent VARCHAR(500),
  stack_trace TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_source ON public.error_logs(source);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert logs (for client-side error reporting)
CREATE POLICY "Authenticated users can insert error logs"
ON public.error_logs FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Allow only admins to view logs
CREATE POLICY "Admins can view all error logs"
ON public.error_logs FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Allow admins to delete old logs
CREATE POLICY "Admins can delete error logs"
ON public.error_logs FOR DELETE
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);