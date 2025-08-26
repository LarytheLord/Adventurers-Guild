import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { createServerComponentClient as createServerComponentClientOriginal } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Browser client for client components
export const createBrowserSupabaseClient = () => {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Server client for server components
export const createServerSupabaseClient = () => {
  const cookieStore = cookies()
  return createServerComponentClientOriginal<Database>({ cookies: () => cookieStore })
}

// Admin client with service role (use with caution!)
export const createAdminSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Legacy exports for backward compatibility (will be removed)
export const supabase = createBrowserSupabaseClient()
export const createClientComponentClient = createBrowserSupabaseClient
export const createServerComponentClient = createServerSupabaseClient
