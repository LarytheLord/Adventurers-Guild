import { createClient } from '@supabase/supabase-js'
import { createServerComponentClient as createServerComponentClientOriginal } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Browser client for client components (call lazily)
export const createBrowserSupabaseClient = () => {
  // Lazy import to avoid SSR/build-time issues when env vars are missing
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createBrowserClient } = require('@supabase/ssr')
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Server client for server components - only import cookies when needed
export const createServerSupabaseClient = () => {
  // Dynamic import to avoid issues with client-side usage
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { cookies } = require('next/headers')
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

// Lazily initialized singleton for browser usage to avoid env access at import time during build
let browserClient: ReturnType<typeof createBrowserSupabaseClient> | null = null
export const getBrowserSupabaseClient = () => {
  if (!browserClient) {
    browserClient = createBrowserSupabaseClient()
  }
  return browserClient
}

export const createClientComponentClient = getBrowserSupabaseClient
export const createServerComponentClient = createServerSupabaseClient
